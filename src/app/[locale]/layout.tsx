import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import GlobalSearchBar from "@/components/common/GlobalSearchBar";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { getDictionary } from "@/constants/translations";
import { getLocalizedPath } from "@/constants/routes";
import { Locale } from "@/proxy";

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

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://https://pokedata-pied.vercel.app";

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

  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const shortSha = commitSha ? commitSha.slice(0, 7) : "dev";
  const repoUrl = "https://github.com/anthonymolinam/pokedata";
  const commitUrl = commitSha ? `${repoUrl}/commit/${commitSha}` : repoUrl;

  return (
    <html lang={locale} className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col">
        <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-zinc-950/70">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 font-black text-xl tracking-tight text-white hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
              <span className="hidden sm:inline">PokéData</span>
            </Link>

            {/* Buscador */}
            <div className="flex-1 max-w-sm">
              <GlobalSearchBar
                locale={locale}
                placeholder={dict.nav.searchPlaceholder}
              />
            </div>

            {/* Navegación y selector de idioma */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
                <Link
                  href={getLocalizedPath(locale, "types")}
                  className="text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  {dict.nav.typeChart}
                </Link>

                <Link
                  href={getLocalizedPath(locale, "compare")}
                  className="text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  {dict.nav.compare ||
                    (locale === "es" ? "Comparador" : "Compare")}
                </Link>
              </nav>

              <LanguageSwitcher currentLocale={locale} />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950/90 py-8 mt-12 text-xs text-zinc-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <p className="font-semibold text-zinc-400">
                PokéData is an unofficial fan-made project created solely for
                educational and recreational purposes.
              </p>
              <p className="leading-relaxed">
                Pokémon, character names, trademarks, and associated imagery are
                intellectual property of{" "}
                <span className="text-zinc-400 font-medium">Nintendo</span>,{" "}
                <span className="text-zinc-400 font-medium">
                  Creatures Inc.
                </span>
                , and{" "}
                <span className="text-zinc-400 font-medium">
                  GAME FREAK Inc.
                </span>{" "}
                This website is not affiliated with, endorsed, or sponsored by
                any of these entities.
              </p>
            </div>
            <div className="sm:text-right shrink-0 space-y-1">
              <p className="font-mono text-zinc-600">Data powered by PokéAPI</p>
              <div className="flex items-center gap-2 sm:justify-end text-[11px] text-zinc-500">
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-300 underline transition-colors"
                >
                  GitHub Repository
                </a>
                <span>•</span>
                <a
                  href={commitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1"
                  title="View commit on GitHub"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {shortSha}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
