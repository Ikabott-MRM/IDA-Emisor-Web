import crypto from 'crypto';

const isProd = process.env.NODE_ENV === 'production';

// Fallback for Amplify SSR when branch env is not injected at runtime.
const PROD = {
  clientId: '7mu9ll5eviedeh7l68tocrbuu9',
  clientSecret: 'd1c8cmb22jo8huojv2ago6kto5snq6ieua1m15t79mjbt1d7cs3',
  region: 'us-east-1',
};

export function getCognitoServerConfig() {
  return {
    clientId:
      process.env.COGNITO_CLIENT_ID?.trim() ||
      (isProd ? PROD.clientId : '') ||
      '',
    clientSecret:
      process.env.COGNITO_CLIENT_SECRET?.trim() ||
      (isProd ? PROD.clientSecret : '') ||
      '',
    region: process.env.AWS_REGION || PROD.region,
  };
}

export function buildSecretHash(
  username: string,
  clientId: string,
  clientSecret?: string
) {
  if (!clientSecret) {
    return undefined;
  }

  return crypto
    .createHmac('sha256', clientSecret)
    .update(`${username}${clientId}`)
    .digest('base64');
}
