/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api-ssi.iovf.org'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "connect-src 'self' http://100.27.228.0:3000 https://*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
