/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@usecases/core',
    '@usecases/collector-base',
    '@usecases/collector-manual',
  ],
};

module.exports = nextConfig;
