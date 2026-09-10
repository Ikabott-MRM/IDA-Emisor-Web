import crypto from 'crypto';

export function getCognitoServerConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const clientId = process.env.COGNITO_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.COGNITO_CLIENT_SECRET?.trim() || '';
  const region =
    process.env.AWS_REGION?.trim() ||
    process.env.COGNITO_REGION?.trim() ||
    'us-east-1';

  if (isProd && (!clientId || !clientSecret)) {
    throw new Error(
      'Missing COGNITO_CLIENT_ID or COGNITO_CLIENT_SECRET. Configure Amplify env and redeploy.',
    );
  }

  return { clientId, clientSecret, region };
}

export function buildSecretHash(
  username: string,
  clientId: string,
  clientSecret?: string,
) {
  if (!clientSecret) {
    return undefined;
  }

  return crypto
    .createHmac('sha256', clientSecret)
    .update(`${username}${clientId}`)
    .digest('base64');
}
