/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  turbopack: {},
  webpack: (config) => {
    // Exclude workers from client bundles
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
