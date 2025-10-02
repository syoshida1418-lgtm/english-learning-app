// next.config.js
const isProd = process.env.NODE_ENV === 'production';

// Only enable PWA (service worker) in production builds. Service workers can
// interfere with Next.js dev HMR and cause reload loops on mobile browsers
// (especially iOS). Keep a no-op passthrough in development.
const withPWA = isProd
  ? require('next-pwa')({
      dest: 'public',
      register: true,
      skipWaiting: true,
    })
  : (config) => config;

module.exports = withPWA({
  reactStrictMode: true,
});
