import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/metadata";
import { THEME_COLORS } from "@/lib/theme";

// Manifiesto para instalar la web en Android (DESIGN.md §5): la marca de la
// lente sobre blanco, y una versión con margen para los iconos recortados en
// círculo o en gota (maskable). iPhone usa apple-icon.png, junto a este fichero
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Los 1025 Pokémon, con su artwork oficial.",
    start_url: "/",
    display: "standalone",
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
