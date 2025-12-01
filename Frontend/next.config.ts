/** @type {import('next').NextConfig} */
const nextConfig = {
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
  
  async rewrites() {
    return [
      {
        source: '/admin-api/:path*',
        destination: 'https://clicktoeat-pw67.onrender.com/:path*',  // ✅ Use Render backend
      },
    ];
  },
};

export default nextConfig;