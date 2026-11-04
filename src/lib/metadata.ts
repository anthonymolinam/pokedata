import type { Metadata } from "next";
import type { Locale } from "@/proxy";

// Dirección pública del sitio para canónicas, hreflang, sitemap y robots: el
// dominio propio, salvo que NEXT_PUBLIC_SITE_URL diga otra (una vista previa).
// Con www, que es el principal en Vercel: pokedata.app redirige ahí
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.pokedata.app"
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
  // Sin imagen propia, la del sitio (app/[locale]/opengraph-image.tsx). Next
  // solo la pone sola en la portada: las demás páginas dan su propio
  // openGraph y, sin esto, se quedaban sin imagen
  const shared = image ?? {
    url: `/${locale}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: SITE_NAME,
  };

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
      images: [shared],
    },
    // La del sitio es apaisada: tarjeta grande. El artwork de una ficha es
    // cuadrado: la pequeña
    twitter: {
      card: image ? "summary" : "summary_large_image",
      title: fullTitle,
      description,
      images: [shared.url],
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
