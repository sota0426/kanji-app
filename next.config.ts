/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/kanji-app',
  assetPrefix: '/kanji-app/',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;