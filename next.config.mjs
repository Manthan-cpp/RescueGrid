/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["falkordb"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
