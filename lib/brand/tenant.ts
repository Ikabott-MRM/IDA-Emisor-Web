/**
 * Tenant branding from env (Amplify bake-time / runtime NEXT_PUBLIC_*).
 * Neutral defaults only — never ship Zijin/IOVF as production customer branding.
 *
 * IMPORTANT: Prefer static process.env.NEXT_PUBLIC_* reads so Next can inline at
 * build time. Dynamic process.env[name] is NOT replaced in the client bundle and
 * falls back to defaults after hydration. Client UI should still prefer BrandProvider
 * + GET /api/brand for Amplify SSR/runtime env.
 */

export type TenantBrand = {
  name: string;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    text: string;
  };
  logos: {
    header: string;
    footer: string;
    headerAltKey: 'header.logoAlt';
    footerAltKey: 'footer.logoAlt';
  };
  /** Tab icon. Prefer a square PNG/ICO under /images/tenants/. */
  favicon: string;
};

function pick(value: string | undefined, fallback: string): string {
  const v = value?.trim();
  return v || fallback;
}


function defaultFavicon(): string {
  const explicit = process.env.NEXT_PUBLIC_FAVICON_URL?.trim();
  if (explicit) return explicit;
  const name = (process.env.NEXT_PUBLIC_TENANT_NAME || '').trim().toLowerCase();
  if (name.includes('geyser')) return '/images/tenants/geyser-favicon.png';
  if (name.includes('avaldao')) return '/images/tenants/avaldao-favicon.png';
  return '/favicon.ico';
}

/** Read brand from process.env (server / build). Safe defaults only. */
export function getTenantBrand(): TenantBrand {
  return {
    name: pick(process.env.NEXT_PUBLIC_TENANT_NAME, 'Issuer Portal'),
    colors: {
      primary: pick(process.env.NEXT_PUBLIC_PRIMARY_COLOR, '#0B3D6E'),
      primaryDark: pick(process.env.NEXT_PUBLIC_PRIMARY_DARK_COLOR, '#062847'),
      accent: pick(process.env.NEXT_PUBLIC_ACCENT_COLOR, '#4A90A4'),
      background: pick(process.env.NEXT_PUBLIC_BACKGROUND_COLOR, '#F5F7FA'),
      text: pick(process.env.NEXT_PUBLIC_TEXT_COLOR, '#1A1A1A'),
    },
    logos: {
      header: pick(
        process.env.NEXT_PUBLIC_LOGO_HEADER_URL,
        '/images/logo-issuer.svg',
      ),
      footer: pick(
        process.env.NEXT_PUBLIC_LOGO_FOOTER_URL,
        '/images/logo-issuer-white.svg',
      ),
      headerAltKey: 'header.logoAlt',
      footerAltKey: 'footer.logoAlt',
    },
    favicon: defaultFavicon(),
  };
}

/** Module snapshot — fine on server; client should use BrandProvider. */
export const tenantBrand: TenantBrand = getTenantBrand();

/** @deprecated Prefer tenantBrand — kept for gradual import migration */
export const zijinBrand = tenantBrand;

export const DRIVER_LICENSE_SCHEMA_ID = 'drivers_license';
export const PRODUCTION_REGISTRY_SCHEMA_ID = 'production_registry';
export const DONOR_SCHEMA_ID = 'donor';
export const FUNDRAISER_SCHEMA_ID = 'fundraiser';
export const ASSOCIATE_SCHEMA_ID = 'associate';

/** Schemas that use first/last name (+ optional fundraiser fields), not license categories. */
export const NAME_BASED_SCHEMA_IDS = [
  DONOR_SCHEMA_ID,
  FUNDRAISER_SCHEMA_ID,
  ASSOCIATE_SCHEMA_ID,
  DRIVER_LICENSE_SCHEMA_ID,
] as const;
