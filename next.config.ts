import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.doswiftly.pl',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'app.localhost',
        port: '8000',
      },
    ],
    // Allow dangerous URLs for local development
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Disable image optimization for local development if needed
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    NEXT_PUBLIC_SHOP_SLUG: process.env.NEXT_PUBLIC_SHOP_SLUG,
  },
};

export default nextConfig;
