/** @type {import('next').NextConfig} */

function patternFromUrl(raw, fallbackPathname = '/**') {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw);
    const protocol = u.protocol === 'http:' ? 'http' : 'https';
    const pattern = {
      protocol,
      hostname: u.hostname,
      pathname: fallbackPathname,
    };
    if (u.port) pattern.port = u.port;
    return pattern;
  } catch {
    return null;
  }
}

function buildImageRemotePatterns() {
  const patterns = [];
  const seen = new Set();
  const add = (p) => {
    if (!p) return;
    const key = `${p.protocol}://${p.hostname}${p.port || ''}${p.pathname}`;
    if (seen.has(key)) return;
    seen.add(key);
    patterns.push(p);
  };

  // Tenant logo CDNs (Amplify NEXT_PUBLIC_LOGO_* + common client hosts)
  add(patternFromUrl(process.env.NEXT_PUBLIC_LOGO_HEADER_URL));
  add(patternFromUrl(process.env.NEXT_PUBLIC_LOGO_FOOTER_URL));
  for (const host of [
    'storage.googleapis.com',
    'geyser.fund',
    'avaldao.com',
    'api-ssi.iovf.org',
  ]) {
    add({ protocol: 'https', hostname: host, pathname: '/**' });
  }
  add(patternFromUrl(process.env.NEXT_PUBLIC_API_BASE_URL));
  return patterns;
}

/** Browser connect-src: same-origin API proxy plus optional API origin and HTTPS APIs. */
function buildConnectSrc() {
  const parts = ["'self'"];
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (raw?.trim()) {
    try {
      parts.push(new URL(raw).origin);
    } catch {
      // ignore invalid URL at build time
    }
  }
  parts.push('https:');
  return parts.join(' ');
}

const nextConfig = {
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `connect-src ${buildConnectSrc()}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
