import type { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

const isProd = process.env.NODE_ENV === 'production';
const prodBaseUrl = 'https://main.d1fkse5la21xp8.amplifyapp.com';
if (isProd) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || prodBaseUrl;
  process.env.NEXTAUTH_URL_INTERNAL =
    process.env.NEXTAUTH_URL_INTERNAL || prodBaseUrl;
}

// Temporary production workaround: force auth values in code until Amplify runtime env resolution is fixed.
const PROD = {
  secret:
    'Lv3alFGMqJ064VQU+zYv6zCoowUizS1oYuBnDGWdmsxWlsWwWY0Z09I5yqj00sfz',
  issuer: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_VLok2ozQ6',
  domain: 'ida-emisor-prod-42351.auth.us-east-1.amazoncognito.com',
  clientId: '6n193icf5uh5pmp1vef7gqvbh8',
  clientSecret: 'nsmm283c2a1r3djhuuascv0oe7vgvn15n1h46jjblrbn7fd4e7q',
};

const domain = isProd
  ? PROD.domain
  : process.env.COGNITO_DOMAIN?.trim() || '';
const baseUrl = domain ? `https://${domain}` : '';

const issuer = isProd ? PROD.issuer : process.env.COGNITO_ISSUER;
const clientId = isProd ? PROD.clientId : process.env.COGNITO_CLIENT_ID || '';
const clientSecret = isProd
  ? PROD.clientSecret
  : process.env.COGNITO_CLIENT_SECRET || '';

const authSecret =
  (isProd ? PROD.secret : process.env.NEXTAUTH_SECRET?.trim()) ||
  process.env.AUTH_SECRET?.trim() ||
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
