/** @type {import('next').NextConfig} */
const nextConfig = {
  //basePath: '/ClicktoEat', // Replace with your actual repo name
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
      {
        source: '/admin-api/:path*',
        destination: 'https://clickto-eat-rxo1-41618asb3-bryans-projects-e4c7e470.vercel.app/:path*',
      }
    ],
  },
}

module.exports = nextConfig