import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";
import SiteHeader from "@/components/common/SiteHeader";
import SiteFooter from "@/components/common/SiteFooter";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Única familia (DESIGN.md §3): display 900, controles 800, texto 600
const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const isEs = locale === "es";

  // Corregido el doble https://
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata-pied.vercel.app";

  const titleDefault = isEs
    ? "PokéData | Base de Datos, Tabla de Tipos y Comparador Pokémon"
    : "PokéData | Pokémon Database, Type Chart & Stats Comparator";

  const description = isEs
    ? "Enciclopedia Pokémon moderna con datos de combate en tiempo real: calculadora y tabla de efectividad de tipos, estadísticas base, comparador Pokémon y evoluciones con PokéAPI."
    : "Modern Pokémon database featuring combat statistics, interactive type chart matchups, head-to-head Pokémon comparator, and evolution lines powered by PokéAPI.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: titleDefault,
      template: "%s | PokéData",
    },
    description,
    applicationName: "PokéData",
    authors: [
      { name: "Anthony Molina", url: "https://github.com/anthonymolinam" },
    ],
    creator: "Anthony Molina",
    keywords: isEs
      ? [
          "PokéData",
          "pokemon database español",
          "pokedex interactiva",
          "comparador pokemon",
          "tabla de tipos pokemon",
          "estadisticas base pokemon",
          "pokeapi",
        ]
      : [
          "PokéData",
          "pokemon encyclopedia",
          "pokemon comparator",
          "type chart pokemon",
          "base stats comparison",
          "pokeapi",
        ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        es: "/es",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: isEs ? "es_ES" : "en_US",
      url: `/${locale}`,
      siteName: "PokéData",
      title: titleDefault,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const dict = getDictionary(locale);

  // Schema.org estructurado para forzar el nombre "PokéData" en Google
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata-pied.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PokéData",
    alternateName: ["PokeData", "PokéData App"],
    url: siteUrl,
  };

  return (
    <html lang={locale} className={nunito.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-svh antialiased flex flex-col">
        <SiteHeader
          locale={locale}
          labels={{
            pokedex: dict.nav.pokedex,
            types: dict.nav.types,
            compare: dict.nav.compare,
            search: dict.nav.search,
            searchLabel: dict.nav.searchLabel,
            openSearch: dict.nav.openSearch,
            closeSearch: dict.nav.closeSearch,
            menu: dict.nav.menu,
            closeMenu: dict.nav.closeMenu,
            mainNav: dict.nav.mainNav,
            home: dict.nav.home,
            language: dict.nav.language,
          }}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
