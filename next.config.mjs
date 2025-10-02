import withPWA from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

const withPWAConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  // Ensure service worker is disabled during development to avoid Safari/PWA
  // caching issues that can cause infinite reloads on iPhone during development.
  disable: process.env.NODE_ENV !== 'production',
  workboxOptions: {
    disableDevLogs: true,
  },
})

export default withPWAConfig(nextConfig)
