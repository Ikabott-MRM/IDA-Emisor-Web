import { NextResponse } from 'next/server';
import { tenantBrand } from '@/lib/brand/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Runtime tenant brand from Amplify/process.env.
 * Client bundles cannot rely on dynamic process.env[name] (Next does not inline it),
 * so pages fetch this after mount.
 */
export async function GET() {
  return NextResponse.json(tenantBrand, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
