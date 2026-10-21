import type { Metadata } from "next";
import type { Locale } from "@/proxy";

// Dirección pública del sitio para canónicas, hreflang, sitemap y robots. En
// producción la da NEXT_PUBLIC_SITE_URL; sin ella, el despliegue de Vercel
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata-pied.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "PokéData";

// Todas las pestañas siguen «Tabla de tipos · PokéData»: el layout lo
// aplica con su plantilla y OpenGraph y Twitter lo repiten entero
export const TITLE_TEMPLATE = `%s · ${SITE_NAME}`;
export const withSiteName = (title: string) => TITLE_TEMPLATE.replace("%s", title);

interface PageMetadataInput {
  locale: Locale;
  // Sin la marca, que añade la plantilla; { absolute } no pasa por ella
  // (la portada, que empieza por la marca)
  title: string | { absolute: string };
  description: string;
  // Ruta de la página en cada idioma, con la query que forme parte de ella
  paths: Record<Locale, string>;
  keywords?: string[];
  image?: { url: string; width: number; height: number; alt: string };
  // false en páginas que no deben salir en buscadores
  index?: boolean;
}

// Metadata propia de cada página. Next mezcla la del layout solo en el primer
// nivel, así que canónica, OpenGraph y Twitter van siempre juntos: una página
// sin ellos heredaría los de la portada
export function pageMetadata({
  locale,
  title,
  description,
  paths,
  keywords,
  image,
  index = true,
}: PageMetadataInput): Metadata {
  const fullTitle = typeof title === "string" ? withSiteName(title) : title.absolute;
  const url = `${SITE_URL}${paths[locale]}`;

  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical: url,
      languages: {
        es: `${SITE_URL}${paths.es}`,
        en: `${SITE_URL}${paths.en}`,
        "x-default": `${SITE_URL}${paths.es}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      url,
      title: fullTitle,
      description,
      ...(image && { images: [image] }),
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      ...(image && { images: [image.url] }),
    },
    // Va aquí y no en el layout: la 404 recibiría «index» junto al noindex de Next
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        }
      : { index: false, follow: true },
  };
}
