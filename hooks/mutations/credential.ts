'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import credentialApi, {
  type ManageCredentialPayload,
} from '@/services/credential';
import { CREDENTIAL_QUERY_KEYS } from '@/constants/queryKeys/credential';
import { useI18n } from '@/lib/i18n/I18nProvider';

const useCredentialMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { mutate, ...rest } = useMutation({
    mutationFn: (params: ManageCredentialPayload) =>
      credentialApi.manageCredential(params, t),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CREDENTIAL_QUERY_KEYS.GET_CREDENTIALS],
      });
    },
  });

  return { manageCredential: mutate, ...rest };
};

export { useCredentialMutation };
