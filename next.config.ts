/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/kanji-app',
  assetPrefix: '/kanji-app/',
  images: {
    unoptimized: true,
  },
  // publicRuntimeConfig のセクションは完全に削除します
  // publicRuntimeConfig: {
  //   basePath: '/kanji-app',
  // },
};

module.exports = nextConfig;