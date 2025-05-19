/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['www.everstream.ai']
  },
  webpack: (config) => {
    // Disable webpack caching
    config.cache = false;
    
    // Configure cache to use memory instead of filesystem
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };
    
    return config;
  }
};

module.exports = nextConfig;