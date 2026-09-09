import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export const runtime = 'nodejs';

function resolveBackend() {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const key =
    process.env.IDENTITY_API_KEY?.trim() || process.env.NEXT_PUBLIC_API_KEY || '';
  if (!raw) {
    return { base: '', key };
  }
  return {
    base: raw.replace(/\/+$/, ''),
    key,
  };
}

function misconfiguredResponse() {
  return NextResponse.json(
    {
      error: 'Server misconfiguration',
      details:
        'Set NEXT_PUBLIC_API_BASE_URL and IDENTITY_API_KEY on the host or in .env.local for local dev.',
    },
    { status: 503 },
  );
}

/** Cognito session → Identity PUT/GET /verifier/company-code with IDENTITY_API_KEY. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { base: API_BASE_URL, key: API_KEY } = resolveBackend();
    if (!API_BASE_URL || !API_KEY) {
      return misconfiguredResponse();
    }

    const response = await fetch(`${API_BASE_URL}/verifier/company-code`, {
      headers: { 'x-api-key': API_KEY },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Verifier company-code GET]', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch company code status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { base: API_BASE_URL, key: API_KEY } = resolveBackend();
    if (!API_BASE_URL || !API_KEY) {
      return misconfiguredResponse();
    }

    const body = await request.json();
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    if (code.length < 4) {
      return NextResponse.json(
        { error: 'Code must be at least 4 characters' },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/verifier/company-code`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Verifier company-code PUT]', error);
    return NextResponse.json(
      {
        error: 'Failed to update company code',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
