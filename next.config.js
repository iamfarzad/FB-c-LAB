/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/roi-calculation',
        destination: '/api/routes/roi-calculation',
      },
      {
        source: '/api/analyze-document',
        destination: '/api/routes/analyze-document',
      },
      {
        source: '/api/analyze-image',
        destination: '/api/routes/analyze-image',
      },
      {
        source: '/api/video-to-app',
        destination: '/api/routes/video-to-app',
      },
      {
        source: '/api/grounded-search',
        destination: '/api/routes/grounded-search',
      },
      {
        source: '/api/send-lead-email',
        destination: '/api/routes/send-lead-email',
      },
    ];
  },
};

module.exports = nextConfig;