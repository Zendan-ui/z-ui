/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX #6: Use 'export' to generate static files in /out directory
  // The Go backend serves these files directly — no Node.js server needed in production
  output: 'export',
  
  reactStrictMode: true,
  
  // Trailing slash for static export compatibility
  trailingSlash: true,
  
  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },

  // Dev-only: proxy API calls to Go backend
  async rewrites() {
    // rewrites only work in dev mode (not with output: 'export')
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8443/api/:path*',
        },
        {
          source: '/sub/:path*',
          destination: 'http://localhost:8443/sub/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
