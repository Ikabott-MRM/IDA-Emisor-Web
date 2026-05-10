'use client';

import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useCredentialMutation } from '@/hooks/mutations/credential';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';
import {
  BaseSyntheticEvent,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from '@/context/SnackbarContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useI18n } from '@/lib/i18n/I18nProvider';
import 'dayjs/locale/es';

type FormData = {
  [key: `${string}_${'firstName'}`]: string;
  [key: `${string}_${'lastName'}`]: string;
  [key: `${string}_${'licenseCategory'}`]: string;
  [key: `${string}_${'expirationDate'}`]: Dayjs;
};

type CredentialFormType = {
  id: string;
  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  schemaId: string;
};

const CATEGORY_VALUES = {
  ciclomotores: 'Ciclomotores y motocicletas',
  automoviles: 'Automóviles',
  camiones: 'Camiones',
  transportePasajeros:
    'Automóviles para transporte de pasajeros',
} as const;

const CredentialForm = ({
  id,
  showForm,
  setShowForm,
  schemaId: _schemaId,
}: CredentialFormType) => {
  const { locale, t } = useI18n();
  const { control, register, handleSubmit, formState: { errors } } =
    useForm<FormData>();
  const { manageCredential, isPending } = useCredentialMutation();
  const { showSnackbar } = useSnackbar();

  const textValidation = useMemo(
    () => ({
      required: t('validation.required'),
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: t('validation.lettersOnly'),
      },
      maxLength: {
        value: 40,
        message: t('validation.maxLength40'),
      },
    }),
    [t],
  );

  const acceptCredential: SubmitHandler<FormData> = (
    values: FormData,
    event: BaseSyntheticEvent<object, any, any> | undefined,
  ) => {
    manageCredential(
      {
        id,
        action: 'approve',
        identifiable_data: {
          name: values[`${id}_firstName`],
          lastname: values[`${id}_lastName`],
          category: values[`${id}_licenseCategory`],
        },
        exp_date: values[`${id}_expirationDate`],
      },
      {
        onSuccess: () => {
          showSnackbar(t('snackbar.approved'));
        },
        onError: () => {
          showSnackbar(t('snackbar.acceptFailed'));
        },
      },
    );
  };

  const rejectCredential = () => {
    manageCredential(
      {
        id,
        action: 'reject',
      },
      {
        onSuccess: () => {
          showSnackbar(t('snackbar.rejectDone'));
        },
        onError: () => {
          showSnackbar(t('snackbar.rejectFailed'));
        },
      },
    );
  };

  const dayjsLocale = locale === 'es' ? 'es' : 'en';

  return (
    <>
      {showForm && !isPending && (
        <Box
          component="form"
          onSubmit={handleSubmit((values, event) =>
            acceptCredential(values, event),
          )}
          sx={{ mt: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('form.firstName')}
                {...register(`${id}_firstName`, textValidation)}
                error={!!errors[`${id}_firstName`]}
                helperText={
                  errors[`${id}_firstName`]
                    ? errors[`${id}_firstName`]?.message
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('form.lastName')}
                {...register(`${id}_lastName`, textValidation)}
                error={!!errors[`${id}_lastName`]}
                helperText={
                  errors[`${id}_lastName`]
                    ? errors[`${id}_lastName`]?.message
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label={t('form.category')}
                {...register(`${id}_licenseCategory`, {
                  required: t('validation.required'),
                })}
                error={!!errors[`${id}_licenseCategory`]}
                helperText={
                  errors[`${id}_licenseCategory`]
                    ? errors[`${id}_licenseCategory`]?.message
                    : ''
                }
              >
                <MenuItem value={CATEGORY_VALUES.ciclomotores}>
                  {t('category.ciclomotores')}
                </MenuItem>
                <MenuItem value={CATEGORY_VALUES.automoviles}>
                  {t('category.automoviles')}
                </MenuItem>
                <MenuItem value={CATEGORY_VALUES.camiones}>
                  {t('category.camiones')}
                </MenuItem>
                <MenuItem value={CATEGORY_VALUES.transportePasajeros}>
                  {t('category.transportePasajeros')}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={dayjsLocale}
              >
                <Controller
                  rules={{
                    required: {
                      value: true,
                      message: t('validation.required'),
                    },
                  }}
                  name={`${id}_expirationDate`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      format={locale === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY'}
                      label={t('form.expirationDate')}
                      {...field}
                      inputRef={field.ref}
                      value={field.value}
                      onChange={date => field.onChange(date)}
                      className="w-full"
                      slotProps={{
                        textField: {
                          error: !!errors[`${id}_expirationDate`],
                          helperText: errors[`${id}_expirationDate`]?.message,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          <Button variant="contained" className="!my-3 w-full" type="submit">
            {t('form.approve')}
          </Button>
        </Box>
      )}
      {!showForm && !isPending && (
        <Button
          variant="contained"
          className="!mb-3 !bg-green-700"
          onClick={() => setShowForm(true)}
        >
          {t('form.approve')}
        </Button>
      )}
      {!isPending && (
        <Button
          variant="contained"
          className="!bg-orange-700 hover:bg-grey-700"
          onClick={rejectCredential}
        >
          {t('form.reject')}
        </Button>
      )}
      {isPending && <CircularProgress sx={{ margin: '0 auto' }} />}
    </>
  );
};

export { CredentialForm };
