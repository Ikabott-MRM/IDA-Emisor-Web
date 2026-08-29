import type { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

const isProd = process.env.NODE_ENV === 'production';
// Prefer Amplify/runtime env; keep old Amplify URL only as last-resort fallback.
const prodBaseUrl =
  process.env.NEXTAUTH_URL?.trim() ||
  'https://main.d26n82vm7gk12r.amplifyapp.com';
if (isProd) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || prodBaseUrl;
  process.env.NEXTAUTH_URL_INTERNAL =
    process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL || prodBaseUrl;
}

// Fallback when Amplify SSR does not inject branch env at runtime.
// Prefer process.env.*; these match account 870318143452 (ida-emisor-web-new).
const PROD = {
  secret: 'UsAf4NRKLadbjtn8qCpkDZi9le7ETXcYwS51y6vBuHI',
  issuer: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_IMHgoehPm',
  domain: 'ida-emisor-new-37369.auth.us-east-1.amazoncognito.com',
  clientId: '7mu9ll5eviedeh7l68tocrbuu9',
  clientSecret: 'd1c8cmb22jo8huojv2ago6kto5snq6ieua1m15t79mjbt1d7cs3',
};

const domain =
  process.env.COGNITO_DOMAIN?.trim() || (isProd ? PROD.domain : '');
const baseUrl = domain ? `https://${domain}` : '';

const issuer = process.env.COGNITO_ISSUER?.trim() || (isProd ? PROD.issuer : undefined);
const clientId =
  process.env.COGNITO_CLIENT_ID?.trim() || (isProd ? PROD.clientId : '') || '';
const clientSecret =
  process.env.COGNITO_CLIENT_SECRET?.trim() ||
  (isProd ? PROD.clientSecret : '') ||
  '';

const authSecret =
  process.env.NEXTAUTH_SECRET?.trim() ||
  process.env.AUTH_SECRET?.trim() ||
  (isProd ? PROD.secret : undefined) ||
  process.env.IDENTITY_API_KEY?.trim() ||
  process.env.NEXT_PUBLIC_API_KEY?.trim();
const authDebug = process.env.NEXTAUTH_DEBUG === 'true' || !isProd;

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    CognitoProvider({
      clientId,
      clientSecret,
      issuer,
      ...(issuer
        ? {
            wellKnown: `${issuer}/.well-known/openid-configuration`,
          }
        : {}),
      ...(baseUrl
        ? {
            authorization: {
              url: `${baseUrl}/oauth2/authorize`,
              params: { scope: 'openid email profile' },
            },
            token: `${baseUrl}/oauth2/token`,
            userinfo: `${baseUrl}/oauth2/userInfo`,
          }
        : {}),
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  debug: authDebug,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[next-auth][callback][signIn]', {
        hasUser: !!user,
        provider: account?.provider,
        accountType: account?.type,
        profileSub: (profile as { sub?: string } | undefined)?.sub,
      });
      return true;
    },
    async jwt({ token, account, profile, trigger }) {
      console.log('[next-auth][callback][jwt]', {
        trigger,
        hasAccount: !!account,
        provider: account?.provider,
        profileSub: (profile as { sub?: string } | undefined)?.sub,
        tokenSub: token?.sub,
      });
      return token;
    },
    async session({ session, token }) {
      console.log('[next-auth][callback][session]', {
        hasSessionUser: !!session?.user,
        tokenSub: token?.sub,
      });
      return session;
    },
  },
  logger: {
    error(code, ...message) {
      console.error('[next-auth][error]', code, ...message);
    },
    warn(code, ...message) {
      console.warn('[next-auth][warn]', code, ...message);
    },
    debug(code, ...message) {
      console.log('[next-auth][debug]', code, ...message);
    },
  },
};
