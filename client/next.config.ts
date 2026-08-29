import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawBackendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const backendOrigin = rawBackendUrl.replace(/\/api\/?$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
