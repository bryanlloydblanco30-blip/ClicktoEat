/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/ClicktoEat', // Replace with your actual repo name
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ccfd3agjzt.ucarecd.net',
      },
      {
        protocol: 'https',
        hostname: 'uploadcare.com',
      },
      // Add any other image hosting services you use
    ],
  },
}

module.exports = nextConfig