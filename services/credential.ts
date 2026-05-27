import axios from './axios';
import { CredentialStatus } from '@/@types/credential';
import { Dayjs } from 'dayjs';
import { isAxiosError } from 'axios';

export type TranslateFn = (
  key: string,
  vars?: Record<string, string>,
) => string;

type IdentifiableData = {
  [key: string]: string;
};

export type ManageCredentialPayload = {
  id: string;
  action: 'approve' | 'reject';
  exp_date?: Dayjs;
  identifiable_data?: IdentifiableData;
};

interface ApiResponse<T> {
  data: T;
  status: number;
}

interface ErrorResponse {
  message: string;
}

export default {
  getCredentials: async (
    status: CredentialStatus,
    t: TranslateFn,
  ) => {
    try {
      // Proxy handles the /requests endpoint
      const response: ApiResponse<any> = await axios.get('/', {
        params: { status },
      });
      return response?.data?.data;
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const error: ErrorResponse | undefined = e.response?.data;
        const detail = (error?.message || e.message || '').trim();
        console.error('API Error:', detail || '(no message)', e.response?.status);
        throw new Error(
          detail
            ? t('errors.fetchCredentialsWithDetail', { message: detail })
            : t('errors.fetchCredentials'),
        );
      } else {
        console.error('Unexpected Error:', e);
        throw new Error(t('errors.unexpectedFetch'));
      }
    }
  },
  manageCredential: async (params: ManageCredentialPayload, t: TranslateFn) => {
    const { id, action, exp_date, identifiable_data } = params;
    try {
      // Proxy handles the /requests/{id}/action endpoint
      const response: ApiResponse<any> = await axios.post(
        `/`,
        {
          id,
          action,
          identifiable_data,
          exp_date,
        },
      );
      return response?.data;
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        const error: ErrorResponse | undefined = e.response?.data;
        const detail = (error?.message || e.message || '').trim();
        console.error('API Error:', detail || '(no message)', e.response?.status);
        throw new Error(
          detail
            ? t('errors.manageCredentialWithDetail', { message: detail })
            : t('errors.manageCredential'),
        );
      } else {
        console.error('Unexpected Error:', e);
        throw new Error(t('errors.unexpectedManage'));
      }
    }
  },
};
