/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {},
  webpack: (config) => {
    // Exclude workers from client bundles
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
