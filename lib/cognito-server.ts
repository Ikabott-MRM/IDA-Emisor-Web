import crypto from 'crypto';

const isProd = process.env.NODE_ENV === 'production';

// Temporary production fallback until Amplify env resolution is fully stable.
const PROD = {
  clientId: '6n193icf5uh5pmp1vef7gqvbh8',
  clientSecret: 'nsmm283c2a1r3djhuuascv0oe7vgvn15n1h46jjblrbn7fd4e7q',
  region: 'us-east-1',
};

export function getCognitoServerConfig() {
  return {
    clientId: isProd ? PROD.clientId : process.env.COGNITO_CLIENT_ID || '',
    clientSecret: isProd
      ? PROD.clientSecret
      : process.env.COGNITO_CLIENT_SECRET || '',
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
