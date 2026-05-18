import { NextResponse } from 'next/server';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { buildSecretHash, getCognitoServerConfig } from '@/lib/cognito-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() || '';
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
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
      new SignUpCommand({
        ClientId: clientId,
        SecretHash: secretHash,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[auth][signup] error', error);

    const cognitoError = error as { name?: string; message?: string };
    if (cognitoError.name === 'UsernameExistsException') {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in or reset password.' },
        { status: 400 }
      );
    }

    if (cognitoError.name === 'InvalidPasswordException') {
      return NextResponse.json(
        {
          error:
            'Password does not meet policy. Use at least 12 characters with uppercase, lowercase, number, and symbol.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Signup failed. Please try again.' },
      { status: 400 }
    );
  }
}
