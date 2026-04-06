/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.rebrickable.com' },
      { protocol: 'https', hostname: 'img.bricklink.com' },
      { protocol: 'https', hostname: 'rebrickable.com' },
    ],
  },
};

module.exports = nextConfig;
