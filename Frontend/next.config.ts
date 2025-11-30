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
      // Add any other image hosting services you use
    ],
  },
  
  // The rewrites function should be INSIDE the config object
  async rewrites() {
    return [
      {
        source: '/admin-api/:path*',
        destination: 'https://clickto-eat-rxo1-ip41vktxo-bryans-projects-e4c7e470.vercel.app/:path*',
      },
    ];
  },
};

// Use EITHER export default OR module.exports, not both
export default nextConfig;