/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@parts-search/core',
    '@parts-search/adapter-base',
    '@parts-search/adapter-monotaro',
    '@parts-search/adapter-misumi',
    '@parts-search/adapter-amazon',
    '@parts-search/adapter-hobuhin',
    '@parts-search/adapter-askul',
    '@parts-search/adapter-axel',
    '@parts-search/adapter-aperza',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
