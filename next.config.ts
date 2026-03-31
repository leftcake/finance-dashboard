import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep runtime on Node.js for broad platform compatibility
  // (Vercel and Cloudflare adapters handle Node target best).
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare')
    .then((m) => m.initOpenNextCloudflareForDev())
    .catch(() => {
      // Cloudflare adapter is optional outside CF workflows.
    })
}
