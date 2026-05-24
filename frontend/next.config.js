/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8443/api/:path*',
      },
      {
        source: '/sub/:path*',
        destination: 'http://localhost:8443/sub/:path*',
      },
      {
        source: '/ws',
        destination: 'http://localhost:8443/ws',
      },
    ];
  },
};

module.exports = nextConfig;
