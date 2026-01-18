import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://100.27.228.0:3000').replace(/\/$/, '');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
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
