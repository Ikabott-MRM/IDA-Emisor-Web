/**
 * Cognito / NextAuth config from environment only.
 * Production must set all required vars (Amplify branch env); no hardcoded fallbacks.
 */

export function requireProdEnv(name: string): string {
  const value = process.env[name]?.trim() || '';
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variable ${name}. Configure it in Amplify (or .env) and redeploy.`,
    );
  }
  return value;
}

export function getAuthEnv() {
  const isProd = process.env.NODE_ENV === 'production';

  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() || '';
  if (isProd && !nextAuthUrl) {
    throw new Error(
      'Missing required environment variable NEXTAUTH_URL. Configure it in Amplify and redeploy.',
    );
  }

  if (isProd) {
    process.env.NEXTAUTH_URL = nextAuthUrl;
    process.env.NEXTAUTH_URL_INTERNAL =
      process.env.NEXTAUTH_URL_INTERNAL?.trim() || nextAuthUrl;
  }

  const authSecret =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    '';

  if (isProd && !authSecret) {
    throw new Error(
      'Missing required environment variable NEXTAUTH_SECRET (or AUTH_SECRET).',
    );
  }

  const cognito = {
    domain: process.env.COGNITO_DOMAIN?.trim() || '',
    issuer: process.env.COGNITO_ISSUER?.trim() || '',
    clientId: process.env.COGNITO_CLIENT_ID?.trim() || '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET?.trim() || '',
  };

  if (isProd) {
    for (const key of [
      'COGNITO_DOMAIN',
      'COGNITO_ISSUER',
      'COGNITO_CLIENT_ID',
      'COGNITO_CLIENT_SECRET',
    ] as const) {
      if (!process.env[key]?.trim()) {
        throw new Error(
          `Missing required environment variable ${key}. Configure Cognito in Amplify and redeploy.`,
        );
      }
    }
  }

  return {
    isProd,
    nextAuthUrl,
    authSecret,
    cognito,
    authDebug: process.env.NEXTAUTH_DEBUG === 'true' || !isProd,
  };
}
