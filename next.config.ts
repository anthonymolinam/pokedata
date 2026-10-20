import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // El artwork se sirve tal cual desde jsDelivr, sin el optimizador
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/PokeAPI/sprites@master/**",
      },
    ],
  },
};

export default nextConfig;
