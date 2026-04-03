/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.discordapp.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'zlib-sync': false,
        'bufferutil': false,
        'utf-8-validate': false,
        'erlpack': false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['discord.js'],
  },
};

module.exports = nextConfig;