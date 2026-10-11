/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.upstash.io' },
      { protocol: 'https', hostname: '*.clerk.accounts.dev' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;