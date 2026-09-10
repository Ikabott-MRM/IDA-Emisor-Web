import type { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { getAuthEnv } from '@/lib/auth-env';

const { authSecret, cognito, authDebug } = getAuthEnv();
const domain = cognito.domain;
const baseUrl = domain ? `https://${domain}` : '';
const { issuer, clientId, clientSecret } = cognito;

export const authOptions: NextAuthOptions = {
  secret: authSecret || undefined,
  providers: [
    CognitoProvider({
      clientId,
      clientSecret,
      issuer: issuer || undefined,
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
