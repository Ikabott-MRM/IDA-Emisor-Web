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

function guessContentType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

function streamResponse(upstream: Response, fallbackName: string): NextResponse {
  const contentType =
    upstream.headers.get('content-type') || guessContentType(fallbackName);
  const cacheControl =
    upstream.headers.get('cache-control') || 'private, max-age=60';

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
  });
}

/**
 * Design A+B document proxy (Emisor):
 * Cognito session → server fetches Identity with IDENTITY_API_KEY → streams bytes.
 * Never expose the API key to the browser.
 *
 * Preferred Identity access:
 *   a) GET /documents/:id/url  → signed URL → fetch bytes
 *   c) GET /documents/:id      with x-api-key (legacy filename / transition)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { base: API_BASE_URL, key: API_KEY } = resolveBackend();
    if (!API_BASE_URL || !API_KEY) {
      return NextResponse.json(
        {
          error: 'Server misconfiguration',
          details:
            'Set NEXT_PUBLIC_API_BASE_URL and IDENTITY_API_KEY on the host or in .env.local for local dev.',
        },
        { status: 503 },
      );
    }

    const rawId = params?.id;
    if (!rawId || typeof rawId !== 'string') {
      return NextResponse.json({ error: 'Missing document id' }, { status: 400 });
    }

    // Decode once; reject path traversal / empty
    const id = decodeURIComponent(rawId).replace(/\\/g, '/').split('/').pop() || '';
    if (!id || id.includes('..')) {
      return NextResponse.json({ error: 'Invalid document id' }, { status: 400 });
    }

    const apiHeaders = { 'x-api-key': API_KEY };

    // (a) Prefer Identity minting a short-lived emisor signed URL
    try {
      const urlRes = await fetch(
        `${API_BASE_URL}/documents/${encodeURIComponent(id)}/url`,
        { headers: apiHeaders, cache: 'no-store' },
      );

      if (urlRes.ok) {
        const payload = (await urlRes.json()) as { url?: string };
        if (payload?.url) {
          // Signed GET may still require emisor API key when did=role:emisor
          const signedRes = await fetch(payload.url, {
            headers: apiHeaders,
            cache: 'no-store',
          });
          if (signedRes.ok && signedRes.body) {
            return streamResponse(signedRes, id);
          }
          console.error(
            '[Documents GET] Signed URL fetch failed:',
            signedRes.status,
            signedRes.statusText,
          );
        }
      } else if (urlRes.status !== 404 && urlRes.status !== 405) {
        console.error(
          '[Documents GET] /url endpoint error:',
          urlRes.status,
          urlRes.statusText,
        );
      }
    } catch (err) {
      console.error('[Documents GET] /url attempt failed, falling back:', err);
    }

    // (c) Transition / current Identity: stream GET /documents/:filename with API key
    const directRes = await fetch(
      `${API_BASE_URL}/documents/${encodeURIComponent(id)}`,
      { headers: apiHeaders, cache: 'no-store' },
    );

    if (!directRes.ok) {
      console.error(
        '[Documents GET] Direct fetch error:',
        directRes.status,
        directRes.statusText,
      );
      const detail = await directRes.text().catch(() => '');
      return NextResponse.json(
        {
          error: 'Document not found or upstream error',
          status: directRes.status,
          details: detail.slice(0, 500),
        },
        { status: directRes.status === 404 ? 404 : 502 },
      );
    }

    return streamResponse(directRes, id);
  } catch (error) {
    console.error('[Documents GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
