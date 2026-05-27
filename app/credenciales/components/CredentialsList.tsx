'use client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useMemo, useState } from 'react';
import { useCredentialsQuery } from '@/hooks/queries/credentials';
import { CredentialStatus, RequestCredential } from '@/@types/credential';
import { CredentialForm } from '@/app/credenciales/components/CredentialForm';
import Image from 'next/image';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useI18n } from '@/lib/i18n/I18nProvider';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CredentialsList() {
  const { locale, t } = useI18n();
  const [selectedStatus, setSelectedStatus] = useState<CredentialStatus>(
    CredentialStatus.pending,
  );
  const { credentials, isLoading, isError, error } = useCredentialsQuery({
    status: selectedStatus,
  });
  const [showForm, setShowForm] = useState(false);

  const dateFormat = locale === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';

  const formatDate = useMemo(
    () => (d: string) =>
      dayjs(d)
        .locale(locale === 'es' ? 'es' : 'en')
        .format(dateFormat),
    [locale, dateFormat],
  );

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setSelectedStatus(event.target.value as CredentialStatus);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress sx={{ marginBottom: 2 }} />
        <Typography variant="h5" sx={{ color: 'blue', marginTop: 2 }}>
          {t('loading')}
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography variant="h5" className="text-red-500">
        {t('errorPrefix')}: {error?.message ?? ''}
      </Typography>
    );
  }

  const sortedCredentials = credentials?.sort(
    (a: RequestCredential, b: RequestCredential) =>
      dayjs(b.created_at).unix() - dayjs(a.created_at).unix(),
  );

  const statusLabel = (s: CredentialStatus) => t(`status.${s}`);

  return (
    <>
      <FormControl fullWidth className="flex mb-10" variant="outlined" margin="normal">
        <InputLabel id="status-filter-label">{t('filter.label')}</InputLabel>
        <Select
          className="w-52"
          labelId="status-filter-label"
          value={selectedStatus}
          onChange={handleStatusChange}
          label={t('filter.label')}
        >
          <MenuItem value={CredentialStatus.pending}>
            {statusLabel(CredentialStatus.pending)}
          </MenuItem>
          <MenuItem value={CredentialStatus.approved}>
            {statusLabel(CredentialStatus.approved)}
          </MenuItem>
          <MenuItem value={CredentialStatus.rejected}>
            {statusLabel(CredentialStatus.rejected)}
          </MenuItem>
        </Select>
      </FormControl>
      {sortedCredentials?.length === 0 && (
        <Typography variant="h5" className="text-black">
          {t('empty.noCredentials')}
        </Typography>
      )}
      {sortedCredentials?.map(
        ({
          id,
          status,
          document_url,
          schema_id,
          created_at,
          code,
        }: RequestCredential) => (
          <Accordion className="mb-3" key={id}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="panel2-content"
              id="panel2-header"
            >
              <Typography>
                {t('accordion.credentialRequest', {
                  date: formatDate(created_at),
                  code,
                })}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="flex flex-col max-w-xl">
              <Typography variant="h6">
                {t('details.status')}: {statusLabel(status)}
              </Typography>
              <Typography variant="h6">
                {t('details.created')}: {formatDate(created_at)}
              </Typography>
              <Typography variant="h6">
                {t('details.documentType')}: {t(`credentialType.${schema_id}`)}
              </Typography>
              <Image
                src={`${apiBaseUrl}/${document_url.replace(/^\//, '')}`}
                width={500}
                height={320}
                alt={t('details.identityImageAlt')}
                className="my-4"
              />
              {status === CredentialStatus.pending && (
                <CredentialForm
                  id={id}
                  schemaId={schema_id}
                  showForm={showForm}
                  setShowForm={setShowForm}
                />
              )}
            </AccordionDetails>
          </Accordion>
        ),
      )}
    </>
  );
}
