import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import SiteHeader from "@/components/common/SiteHeader";
import SiteFooter from "@/components/common/SiteFooter";
import MotionProvider from "@/components/common/MotionProvider";
import InlineScript from "@/components/common/InlineScript";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";
import { THEME_COLORS, themeScript } from "@/lib/theme";

// Única familia (DESIGN.md §3): display 900, controles 800, texto 600.
// Va en el proyecto (src/app/fonts, OFL) y no desde Google Fonts, que falla
// al compilar en Vercel: un woff2 estático por peso, con latin y latin-ext
const nunito = localFont({
  src: [
    { path: "../fonts/Nunito-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Nunito-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Nunito-800.woff2", weight: "800", style: "normal" },
    { path: "../fonts/Nunito-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-nunito",
  display: "swap",
});

// Barra del navegador en el --ground de cada tema (DESIGN.md §2.4). Con el tema
// forzado, el script de arranque antepone otro theme-color que gana a estos
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

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
    // suppressHydrationWarning: el script de arranque cambia los atributos de
    // <html> antes de hidratar, y React tiene que quedarse con los del DOM
    <html lang={locale} className={nunito.variable} suppressHydrationWarning>
      <head>
        {/* Tema sin parpadeo (DESIGN.md §2.4): corre antes del primer pintado */}
        <InlineScript html={themeScript} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-svh antialiased flex flex-col">
        <MotionProvider>
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
              theme: dict.nav.theme,
              themeLight: dict.nav.themeLight,
              themeDark: dict.nav.themeDark,
              themeSystem: dict.nav.themeSystem,
              themeSystemShort: dict.nav.themeSystemShort,
            }}
          />

          {/* overflow-x-clip: red de seguridad para que la página nunca tenga
              scroll horizontal (solo lo tienen contenedores como la tabla de
              tipos). clip no crea contenedor de scroll, así que no rompe sticky */}
          <main className="flex-1 shell py-8 overflow-x-clip">
            {children}
          </main>

          <SiteFooter locale={locale} />
        </MotionProvider>
      </body>
    </html>
  );
}
