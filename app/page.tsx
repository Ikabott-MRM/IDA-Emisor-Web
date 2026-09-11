'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CredentialsList from '@/app/credenciales/components/CredentialsList';
import VerifierCompanyCodeSettings from '@/app/credenciales/components/VerifierCompanyCodeSettings';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { BrandProvider, useBrand } from '@/context/BrandProvider';
import BrandLogo from '@/components/BrandLogo';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { Button } from '@mui/material';
import { signOut } from 'next-auth/react';

function HomeContent() {
  const { locale, setLocale, t } = useI18n();
  const brand = useBrand();

  return (
    <div className="flex flex-col min-h-screen">
      <main
        className="flex-grow flex flex-col items-center"
        style={{ backgroundColor: brand.colors.background }}
      >
        <header
          className="w-full shadow-md top-0 left-0 z-50"
          style={{ backgroundColor: brand.colors.primary }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3 py-4">
              <BrandLogo
                src={brand.logos.header}
                alt={t(brand.logos.headerAltKey)}
                fallbackText={brand.name}
                width={188}
                height={56}
                priority
              />
              <div className="border-l-4 border-white pl-3 ml-3">
                <h1 className="text-2xl font-bold text-white">{brand.name}</h1>
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
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => void signOut({ callbackUrl: '/login' })}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  {t('auth.signOut')}
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mt-4 mb-6 text-[#1A1A1A]">
            {t('requestsList.title')}
          </h2>
          <VerifierCompanyCodeSettings />
          <CredentialsList />
        </div>
      </main>
      <footer
        className="w-full text-white py-4 flex justify-center items-center"
        style={{ backgroundColor: brand.colors.primaryDark }}
      >
        <BrandLogo
          src={brand.logos.footer}
          alt={t(brand.logos.footerAltKey)}
          fallbackText={brand.name}
          width={188}
          height={56}
          priority
        />
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
        <BrandProvider>
          <HomeContent />
        </BrandProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
