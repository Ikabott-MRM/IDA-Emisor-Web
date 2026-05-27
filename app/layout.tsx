import { Roboto } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { AuthSessionProvider } from '@/app/AuthSessionProvider';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: 'Zijin Mining Issuer Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AuthSessionProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
