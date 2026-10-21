import type { MetadataRoute } from "next";
import { getLocalizedPath } from "@/constants/routes";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import POKEMON_INDEX from "@/data/pokemon-index.json";
import { SITE_URL } from "@/lib/metadata";

const LOCALES = ["es", "en"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Páginas principales, con la ruta traducida de cada idioma. El equipo entra
  // sin ?t=: un equipo compartido no es una página propia
  const routes = ["", "types", "compare", "team"].flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${route ? getLocalizedPath(locale, route) : `/${locale}`}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8,
    })),
  );

  // Una ficha por especie y por idioma, con el mismo slug que enlazan las
  // tarjetas (colmilargo / great-tusk). Las formas van en ?variant= y no entran
  const pokemon = POKEMON_INDEX.flatMap(([name]) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/pokemon/${(locale === "es" && CANONICAL_TO_SPANISH[name]) || name}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...routes, ...pokemon];
}
