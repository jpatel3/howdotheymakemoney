/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Server Actions are enabled by default in Next.js 14
    // serverActions: true,
  },
  env: {
    DB_URL: process.env.DB_URL || 'file:local.db',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '/**', // Allow any path on this hostname
      },
    ],
  },
}

export default nextConfig 