import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.48"],

  async rewrites() {
    const parserUrl = process.env.PARSER_API_URL || "http://localhost:8000";
    const coreUrl = process.env.CORE_API_URL || "http://localhost:8080";
    
    return [
      {
        source: "/api/parse",
        destination: `${parserUrl}/api/parse`, // Envoi vers le microservice parser
      },
      {
        source: "/api/parse/:path*",
        destination: `${parserUrl}/api/parse/:path*`, // Envoi vers le microservice parser
      },
      {
        source: "/api/:path*",
        destination: `${coreUrl}/:path*`, // Envoi vers le microservice core
      },
    ];
  },
};

export default nextConfig;
