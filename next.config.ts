import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 para el artwork grande de la ficha y del comparador; el resto usa 75
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
};

export default nextConfig;
