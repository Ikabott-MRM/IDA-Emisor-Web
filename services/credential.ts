import axios from './axios';
import {CredentialStatus} from "@/@types/credential";
import {Dayjs} from "dayjs";
import {isAxiosError} from 'axios';

type IdentifiableData = {
  name: string,
  lastname: string,
  category: string,
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

interface ErrorResponse {
  message: string;
}

export default {
  getCredentials: async (status: CredentialStatus) => {
    try {
      // Proxy handles the /requests endpoint
      const response: ApiResponse<any> = await axios.get('/', {
        params: { status },
      });
      return response?.data?.data;
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        //Axios specific errors
        const error: ErrorResponse | undefined = e.response?.data;
        const errorMessage = error?.message || e.message || 'Failed to fetch credentials from backend.';
        console.error('API Error:', errorMessage, e.response?.status);
        throw new Error(errorMessage);
      } else {
        //unexpected errors
        console.error('Unexpected Error:', e);
        throw new Error('An unexpected error occurred while fetching credentials.');
      }
    }
  },
  manageCredential: async ({id, action, exp_date, identifiable_data}: { id: string, action: 'approve' | 'reject', exp_date?: Dayjs, identifiable_data?: IdentifiableData}) => {
    try {
      // Proxy handles the /requests/{id}/action endpoint
      const response: ApiResponse<any> = await axios.post(
        `/`,
        {
          id,
          action,
          identifiable_data,
          exp_date,
        }
      );
      return response?.data;
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        //Axios specific errors
        const error: ErrorResponse | undefined = e.response?.data;
        const errorMessage = error?.message || e.message || 'Failed to manage credential.';
        console.error('API Error:', errorMessage, e.response?.status);
        throw new Error(errorMessage);
      } else {
        //unexpected errors
        console.error('Unexpected Error:', e);
        throw new Error('An unexpected error occurred while managing credential.');
      }
    }
  },
};
