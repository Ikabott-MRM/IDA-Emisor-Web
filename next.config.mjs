/** @type {import('next').NextConfig} */

function buildImageRemotePatterns() {
  const legacy = {
    protocol: 'https',
    hostname: 'api-ssi.iovf.org',
    pathname: '/**',
  };
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw?.trim()) {
    return [legacy];
  }
  try {
    const u = new URL(raw);
    const protocol = u.protocol === 'http:' ? 'http' : 'https';
    const pattern = {
      protocol,
      hostname: u.hostname,
      pathname: '/**',
    };
    if (u.port) {
      pattern.port = u.port;
    }
    return [pattern, legacy];
  } catch {
    return [legacy];
  }
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
