/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove basePath for Render deployment
  // basePath: '/ClicktoEat', // Only needed for GitHub Pages
  output: 'standalone', // Add this for Render
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ccfd3agjzt.ucarecd.net',
      },
      {
        protocol: 'https',
        hostname: 'uploadcare.com',
      },
    ],
  },
}

module.exports = nextConfig