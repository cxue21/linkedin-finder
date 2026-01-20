/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Remove the hardcoded env section!
  // Vercel will provide environment variables automatically
};

module.exports = nextConfig;
