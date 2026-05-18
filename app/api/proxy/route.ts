import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

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

async function unauthorizedResponse() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await unauthorizedResponse();
    if (unauthorized) {
      return unauthorized;
    }

    const { base: API_BASE_URL, key: API_KEY } = resolveBackend();
    if (!API_BASE_URL || !API_KEY) {
      return misconfiguredResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const url = `${API_BASE_URL}/requests${status ? `?status=${status}` : ''}`;
    
    console.log('[Proxy GET] Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.error('[Proxy GET] Backend error:', response.status, response.statusText);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Proxy GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await unauthorizedResponse();
    if (unauthorized) {
      return unauthorized;
    }

    const { base: API_BASE_URL, key: API_KEY } = resolveBackend();
    if (!API_BASE_URL || !API_KEY) {
      return misconfiguredResponse();
    }

    const body = await request.json();
    const { id, action, exp_date, identifiable_data } = body;

    const url = `${API_BASE_URL}/requests/${id}/action`;
    
    console.log('[Proxy POST] Sending to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ action, exp_date, identifiable_data }),
    });

    if (!response.ok) {
      console.error('[Proxy POST] Backend error:', response.status, response.statusText);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Proxy POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send request to backend', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
