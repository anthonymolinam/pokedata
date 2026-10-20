import { MetadataRoute } from "next";
import { getLocalizedPath } from "@/constants/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata-pied.vercel.app";

  // Páginas estáticas / principales, con la ruta traducida de cada idioma. El
  // equipo entra sin ?t=: un equipo compartido no es una página propia
  const routes = ["", "types", "compare", "team"].flatMap((route) =>
    (["es", "en"] as const).map((locale) => ({
      url: `${baseUrl}${route ? getLocalizedPath(locale, route) : `/${locale}`}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8,
    })),
  );

  return routes;
}
