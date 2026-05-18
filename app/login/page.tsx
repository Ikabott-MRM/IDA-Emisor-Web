'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function LoginPage() {
  const { t } = useI18n();

  useEffect(() => {
    void signIn('cognito', { callbackUrl: '/' });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-700">{t('auth.redirectingLogin')}</p>
    </main>
  );
}
