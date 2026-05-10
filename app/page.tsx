'use client';

import { useState } from 'react';
import Image from 'next/image';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CredentialsList from '@/app/credenciales/components/CredentialsList';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { Button } from '@mui/material';

function HomeContent() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-gray-50 flex flex-col items-center">
        <header className="w-full bg-[#BB2929] shadow-md top-0 left-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3 py-4">
              <Image
                src="/images/logo-demo.png"
                alt={t('header.logoAlt')}
                width={100}
                height={56}
                priority
              />
              <div className="border-l-4 border-white pl-3 ml-3">
                <h1 className="text-2xl font-bold text-white">
                  {t('header.portalTitle')}
                </h1>
                <h2 className="text-xl text-white">
                  {t('header.portalSubtitle')}
                </h2>
              </div>
              <div className="flex gap-1 ml-auto">
                <Button
                  size="small"
                  variant={locale === 'en' ? 'contained' : 'outlined'}
                  onClick={() => setLocale('en')}
                  sx={{ color: locale === 'en' ? undefined : 'white' }}
                >
                  {t('lang.en')}
                </Button>
                <Button
                  size="small"
                  variant={locale === 'es' ? 'contained' : 'outlined'}
                  onClick={() => setLocale('es')}
                  sx={{ color: locale === 'es' ? undefined : 'white' }}
                >
                  {t('lang.es')}
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-700 mt-4 mb-6">
            {t('requestsList.title')}
          </h2>
          <CredentialsList />
        </div>
      </main>
      <footer className="w-full bg-gray-500 text-white py-4 flex justify-center items-center">
        <p
          className="text-sm font-bold"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {t('footer.poweredBy')}
        </p>
        <div className="ml-2">
          <Image
            src="/images/logo-iovf-white.png"
            alt={t('footer.logoAlt')}
            width={100}
            height={56}
            priority
          />
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <HomeContent />
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
