import { NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { buildSecretHash, getCognitoServerConfig } from '@/lib/cognito-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; code?: string };
    const email = body.email?.trim().toLowerCase() || '';
    const code = body.code?.trim() || '';

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const { clientId, clientSecret, region } = getCognitoServerConfig();
    if (!clientId) {
      return NextResponse.json(
        { error: 'Cognito client is not configured.' },
        { status: 500 }
      );
    }

    const client = new CognitoIdentityProviderClient({ region });
    const secretHash = buildSecretHash(email, clientId, clientSecret);

    await client.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        SecretHash: secretHash,
        Username: email,
        ConfirmationCode: code,
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[auth][confirm] error', error);
    return NextResponse.json(
      { error: 'Confirmation failed. Please check the code and try again.' },
      { status: 400 }
    );
  }
}
