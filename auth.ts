import type { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

const cognitoDomain = process.env.COGNITO_DOMAIN?.trim();
const cognitoBaseUrl = cognitoDomain ? `https://${cognitoDomain}` : '';
const authSecret =
  process.env.NEXTAUTH_SECRET?.trim() ||
  process.env.IDENTITY_API_KEY?.trim() ||
  process.env.COGNITO_CLIENT_SECRET?.trim() ||
  process.env.NEXT_PUBLIC_API_KEY?.trim();

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID || '',
      clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
      issuer: process.env.COGNITO_ISSUER,
      ...(process.env.COGNITO_ISSUER
        ? {
            wellKnown: `${process.env.COGNITO_ISSUER}/.well-known/openid-configuration`,
          }
        : {}),
      ...(cognitoBaseUrl
        ? {
            authorization: {
              url: `${cognitoBaseUrl}/oauth2/authorize`,
              params: { scope: 'openid email profile' },
            },
            token: `${cognitoBaseUrl}/oauth2/token`,
            userinfo: `${cognitoBaseUrl}/oauth2/userInfo`,
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
  debug: process.env.NODE_ENV !== 'production',
  logger: {
    error(code, ...message) {
      console.error('[next-auth][error]', code, ...message);
    },
  },
};
