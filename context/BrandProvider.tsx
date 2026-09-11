'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { resolveFavicon, tenantBrand, type TenantBrand } from '@/lib/brand/tenant';

const BrandContext = createContext<TenantBrand>(tenantBrand);

function isTenantBrand(value: unknown): value is TenantBrand {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const colors = v.colors as Record<string, unknown> | undefined;
  const logos = v.logos as Record<string, unknown> | undefined;
  return (
    typeof v.name === 'string' &&
    !!colors &&
    typeof colors.primary === 'string' &&
    typeof colors.primaryDark === 'string' &&
    typeof colors.accent === 'string' &&
    typeof colors.background === 'string' &&
    typeof colors.text === 'string' &&
    !!logos &&
    typeof logos.header === 'string' &&
    typeof logos.footer === 'string'
  );
}

export function BrandProvider({ children }: { children: ReactNode }) {
  // Keep SSR / module defaults until /api/brand succeeds — never clear on error.
  const [brand, setBrand] = useState<TenantBrand>(tenantBrand);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/brand', { cache: 'no-store' });
      if (!res.ok) return;
      const data: unknown = await res.json();
      if (!isTenantBrand(data)) return;
      const incoming = data as TenantBrand & { favicon?: string };
      setBrand({
        name: data.name,
        colors: { ...data.colors },
        logos: {
          header: data.logos.header,
          footer: data.logos.footer,
          headerAltKey: 'header.logoAlt',
          footerAltKey: 'footer.logoAlt',
        },
        favicon: resolveFavicon({ url: incoming.favicon, name: data.name }),
      });
    } catch {
      // Keep previous brand (SSR/defaults).
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo(() => brand, [brand]);

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

export function useBrand(): TenantBrand {
  return useContext(BrandContext);
}
