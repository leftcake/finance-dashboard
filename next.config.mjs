import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 swcMinify（Next.js 16 默认已优化）
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // 解决多个 lockfile 的根目录警告
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig