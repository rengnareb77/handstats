import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.48"],

  async rewrites() {
    return [
      {
        source: "/api/parse",
        destination: "http://localhost:8000/api/parse", // Envoi vers le microservice parser
      },
      {
        source: "/api/parse/:path*",
        destination: "http://localhost:8000/api/parse/:path*", // Envoi vers le microservice parser
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/:path*", // Envoi vers le microservice core
      },
    ];
  },
};

export default nextConfig;
