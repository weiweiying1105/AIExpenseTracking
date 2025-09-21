/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  experimental: {
    outputFileTracingIncludes: {
      "/": ["./public/**/*"],
    },
  },
};

module.exports = nextConfig;
