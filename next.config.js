/** @type {import('next').NextConfig} */
const isGHPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: isGHPages ? 'export' : undefined,
  basePath: isGHPages ? '/brickbot' : '',
  assetPrefix: isGHPages ? '/brickbot/' : '',
  trailingSlash: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  images: {
    unoptimized: isGHPages,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.rebrickable.com' },
      { protocol: 'https', hostname: 'img.bricklink.com' },
      { protocol: 'https', hostname: 'rebrickable.com' },
    ],
  },
};

module.exports = nextConfig;
