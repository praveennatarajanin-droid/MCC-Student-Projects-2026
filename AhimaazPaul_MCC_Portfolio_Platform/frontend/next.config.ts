import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Force IPv4 (127.0.0.1) to avoid ECONNREFUSED on ::1 (IPv6)
        source: "/api/:path*",
        destination: "http://127.0.0.1:5129/api/:path*",
      },
      {
        // Proxy uploaded static files (avatars, resumes, documents) from the backend
        source: "/uploads/:path*",
        destination: "http://127.0.0.1:5129/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;

