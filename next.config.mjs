/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    VITE_GOOGLE_API_KEY: process.env.VITE_GOOGLE_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    API_KEY: process.env.API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
