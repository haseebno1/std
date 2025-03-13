/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Remove the transpilePackages line if it causes issues
  // transpilePackages: [],
  experimental: {
    // Only enable this if you really need Server Actions
    // serverActions: true,
  }
}

module.exports = nextConfig 