import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata.app";

  // Páginas estáticas / principales
  const routes = ["", "/types", "/compare"].flatMap((route) => [
    {
      url: `${baseUrl}/es${route === "/types" ? "/tabla-de-tipos" : route === "/compare" ? "/comparador" : route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8,
    },
    {
      url: `${baseUrl}/en${route === "/types" ? "/type-chart" : route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8,
    },
  ]);

  return routes;
}
