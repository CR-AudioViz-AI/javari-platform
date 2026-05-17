/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  // Resolve parallel pages conflict by disabling static optimization
  experimental: { workerThreads: false, cpus: 1 }
}
module.exports = nextConfig
