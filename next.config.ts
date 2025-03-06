/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ecslnojuilswdjnyhlze.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecslnojuilswdjnyhlze.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      }
    ],
    unoptimized: true,
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
  // Add this to help with debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig