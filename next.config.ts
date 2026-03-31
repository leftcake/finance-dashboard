import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // no external packages
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Edge running
  unstable_allowSuspendedClientComponents: false,
};

export default nextConfig;
