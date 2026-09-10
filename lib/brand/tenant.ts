/**
 * Tenant branding from env (Amplify bake-time NEXT_PUBLIC_*).
 * Defaults keep local/dev usable without Zijin hard-coupling in production stacks.
 */

function env(name: string, fallback: string): string {
  const v = process.env[name]?.trim();
  return v || fallback;
}

export const tenantBrand = {
  name: env('NEXT_PUBLIC_TENANT_NAME', 'Issuer Portal'),
  colors: {
    primary: env('NEXT_PUBLIC_PRIMARY_COLOR', '#0B3D6E'),
    primaryDark: env('NEXT_PUBLIC_PRIMARY_DARK_COLOR', '#062847'),
    accent: env('NEXT_PUBLIC_ACCENT_COLOR', '#C5A028'),
    background: env('NEXT_PUBLIC_BACKGROUND_COLOR', '#F5F7FA'),
    text: env('NEXT_PUBLIC_TEXT_COLOR', '#1A1A1A'),
  },
  logos: {
    header: env('NEXT_PUBLIC_LOGO_HEADER_URL', '/images/logo-zijin.svg'),
    footer: env('NEXT_PUBLIC_LOGO_FOOTER_URL', '/images/logo-zijin-white.svg'),
    headerAltKey: 'header.logoAlt' as const,
    footerAltKey: 'footer.logoAlt' as const,
  },
};

/** @deprecated Prefer tenantBrand — kept for gradual import migration */
export const zijinBrand = tenantBrand;

export const DRIVER_LICENSE_SCHEMA_ID = 'drivers_license';
export const PRODUCTION_REGISTRY_SCHEMA_ID = 'production_registry';
