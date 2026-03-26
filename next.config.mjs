/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
}

export default nextConfig