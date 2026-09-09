'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useSnackbar } from '@/context/SnackbarContext';

type StatusResponse = {
  configured?: boolean;
  updatedAt?: string | null;
  error?: string;
};

export default function VerifierCompanyCodeSettings() {
  const { t } = useI18n();
  const { showSnackbar } = useSnackbar();
  const [code, setCode] = useState('');
  const [configured, setConfigured] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/verifier/company-code', { cache: 'no-store' });
      const data = (await res.json()) as StatusResponse;
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setConfigured(Boolean(data.configured));
      setUpdatedAt(data.updatedAt ?? null);
    } catch (err) {
      console.error(err);
      showSnackbar(t('verifierCode.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, t]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const onSave = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      showSnackbar(t('verifierCode.tooShort'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/verifier/company-code', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || `HTTP ${res.status}`,
        );
      }
      setCode('');
      setConfigured(true);
      setUpdatedAt(
        (data as { updatedAt?: string }).updatedAt ?? new Date().toISOString(),
      );
      showSnackbar(t('verifierCode.saved'));
    } catch (err) {
      console.error(err);
      showSnackbar(t('verifierCode.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-6"
      component="section"
    >
      <Typography variant="h6" className="mb-1 text-[#1A1A1A]">
        {t('verifierCode.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mb-3">
        {t('verifierCode.help')}
      </Typography>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Alert severity={configured ? 'success' : 'warning'} className="mb-3">
          {configured
            ? t('verifierCode.configured', {
                date: updatedAt
                  ? new Date(updatedAt).toLocaleString()
                  : '—',
              })
            : t('verifierCode.notConfigured')}
        </Alert>
      )}

      <Box className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
        <TextField
          type="password"
          autoComplete="new-password"
          label={t('verifierCode.label')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          size="small"
          fullWidth
          inputProps={{ minLength: 4 }}
        />
        <Button
          variant="contained"
          onClick={() => void onSave()}
          disabled={saving || code.trim().length < 4}
          sx={{ minWidth: 140, height: 40 }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : t('verifierCode.save')}
        </Button>
      </Box>
    </Box>
  );
}
