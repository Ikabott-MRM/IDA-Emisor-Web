'use client';

import { CREDENTIAL_QUERY_KEYS } from '@/constants/queryKeys/credential';
import credential from '@/services/credential';
import { useQuery } from '@tanstack/react-query';
import { CredentialStatus } from '@/@types/credential';
import { useI18n } from '@/lib/i18n/I18nProvider';

const useCredentialsQuery = ({ status }: { status: CredentialStatus }) => {
  const { t, locale } = useI18n();
  const credentials = useQuery({
    queryKey: [CREDENTIAL_QUERY_KEYS.GET_CREDENTIALS, status, locale],
    queryFn: () => credential.getCredentials(status, t),
  });

  return { ...credentials, credentials: credentials.data };
};

export { useCredentialsQuery };
