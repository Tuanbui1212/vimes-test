import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Lấy URL backend từ biến môi trường Secret (BACKEND_URL) hoặc fallback về port 8080
    const rawBackendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    // Đảm bảo không bị trùng /api khi nối chuỗi
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
