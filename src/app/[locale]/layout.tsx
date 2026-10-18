import type { Metadata } from "next";
import Link from "next/link";
import { Chivo } from "next/font/google";
import "../globals.css";
import GlobalSearchBar from "@/components/common/GlobalSearchBar";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { getDictionary } from "@/constants/translations";
import { getLocalizedPath } from "@/constants/routes";
import { Locale } from "@/proxy";

// Única familia del rediseño (DESIGN.md §3): display 900, navegación 700, texto 400
const chivo = Chivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700", "900"],
  variable: "--font-chivo",
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

  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const shortSha = commitSha ? commitSha.slice(0, 7) : "dev";
  const repoUrl = "https://github.com/anthonymolinam/pokedata";
  const commitUrl = commitSha ? `${repoUrl}/commit/${commitSha}` : repoUrl;

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
    <html lang={locale} className={chivo.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* Fondo y tinta salen del campo de la página (globals.css): papel por
          defecto, o el capítulo que marque la página con data-chapter */}
      <body className="min-h-svh antialiased flex flex-col">
        {/* Barra superior (DESIGN.md §4.1): plana, opaca, sin bordes, en el
            color de la página. En móvil y tablet, dos filas: marca y enlaces; buscador e idioma */}
        <header className="lg:sticky lg:top-0 z-50 bg-field text-field-ink">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-3 lg:py-0 lg:h-20 flex flex-wrap lg:flex-nowrap items-center gap-x-5 gap-y-3 lg:gap-x-8">
            <Link
              href={`/${locale}`}
              className="display text-lead shrink-0 order-1"
            >
              PokéData
            </Link>

            <nav className="order-2 lg:order-3 ml-auto flex items-center gap-4 lg:gap-6 font-bold text-small lg:text-body">
              <Link
                href={getLocalizedPath(locale, "types")}
                className="whitespace-nowrap underline-offset-4 decoration-2 hover:underline"
              >
                {dict.nav.typeChart}
              </Link>
              <Link
                href={getLocalizedPath(locale, "compare")}
                className="whitespace-nowrap underline-offset-4 decoration-2 hover:underline"
              >
                {dict.nav.compare}
              </Link>
            </nav>

            <div className="order-3 w-full flex items-center gap-3 lg:contents">
              <div className="flex-1 min-w-0 lg:order-2 lg:max-w-md">
                <GlobalSearchBar
                  locale={locale}
                  placeholder={dict.nav.searchPlaceholder}
                />
              </div>
              <div className="shrink-0 lg:order-4">
                <LanguageSwitcher currentLocale={locale} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        {/* Pie (DESIGN.md §4.6): campo de tinta a sangre, el nombre al ancho
            completo y debajo el aviso legal y los datos del despliegue */}
        <footer
          data-field="ink"
          className="bg-field text-field-ink mt-18 md:mt-30"
        >
          <div className="@container max-w-[1440px] mx-auto px-6 lg:px-8 pt-12 md:pt-20 pb-10 md:pb-12">
            <p className="display text-[20.2cqi] whitespace-nowrap">
              PokéData
            </p>

            <div className="mt-10 md:mt-16 grid gap-8 md:grid-cols-12 text-small">
              <div className="md:col-span-7 lg:col-span-6 space-y-2 max-w-[65ch]">
                <p className="font-bold">{dict.footer.disclaimer}</p>
                <p>{dict.footer.trademark}</p>
              </div>

              <ul className="md:col-span-4 md:col-start-9 lg:col-span-3 lg:col-start-10 space-y-2 font-bold">
                <li>
                  <a
                    href="https://pokeapi.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 decoration-2 hover:underline"
                  >
                    {dict.footer.data}
                  </a>
                </li>
                <li>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 decoration-2 hover:underline"
                  >
                    {dict.footer.repo}
                  </a>
                </li>
                <li>
                  <a
                    href={commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={dict.footer.commitTitle}
                    className="num inline-flex items-center gap-2 underline-offset-4 decoration-2 hover:underline"
                  >
                    <span aria-hidden="true" className="size-2 bg-emerald-500" />
                    {shortSha}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
