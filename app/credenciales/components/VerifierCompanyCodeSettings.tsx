'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useSnackbar } from '@/context/SnackbarContext';

type StatusResponse = {
  configured?: boolean;
  updatedAt?: string | null;
  code?: string | null;
  error?: string;
};

export default function VerifierCompanyCodeSettings() {
  const { t } = useI18n();
  const { showSnackbar } = useSnackbar();
  const [newCode, setNewCode] = useState('');
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
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
      setCurrentCode(
        typeof data.code === 'string' && data.code.length > 0 ? data.code : null,
      );
      setShowCurrent(false);
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
    const trimmed = newCode.trim();
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
      setNewCode('');
      setConfigured(true);
      setUpdatedAt(
        (data as { updatedAt?: string }).updatedAt ?? new Date().toISOString(),
      );
      setCurrentCode(trimmed);
      setShowCurrent(false);
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
        <>
          <Alert severity={configured ? 'success' : 'warning'} className="mb-3">
            {configured
              ? t('verifierCode.configured', {
                  date: updatedAt
                    ? new Date(updatedAt).toLocaleString()
                    : '—',
                })
              : t('verifierCode.notConfigured')}
          </Alert>

          {configured && currentCode === null && (
            <Alert severity="info" className="mb-3">
              {t('verifierCode.reSaveToEnableView')}
            </Alert>
          )}

          {configured && currentCode !== null && (
            <TextField
              type={showCurrent ? 'text' : 'password'}
              label={t('verifierCode.currentLabel')}
              value={currentCode}
              size="small"
              fullWidth
              className="mb-3"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showCurrent
                          ? t('verifierCode.hide')
                          : t('verifierCode.show')
                      }
                      onClick={() => setShowCurrent((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}
        </>
      )}

      <Box className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
        <TextField
          type="password"
          autoComplete="new-password"
          label={t('verifierCode.rotateLabel')}
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          size="small"
          fullWidth
          inputProps={{ minLength: 4 }}
        />
        <Button
          variant="contained"
          onClick={() => void onSave()}
          disabled={saving || newCode.trim().length < 4}
          sx={{ minWidth: 140, height: 40 }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : t('verifierCode.save')}
        </Button>
      </Box>
    </Box>
  );
}
