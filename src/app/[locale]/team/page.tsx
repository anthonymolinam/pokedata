import type { Metadata } from "next";
import { getDictionary } from "@/constants/translations";
import { getLocalizedPath } from "@/constants/routes";
import { Locale } from "@/proxy";

interface TeamPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { team } = getDictionary(locale);

  // Título exacto del §4.9, sin la plantilla «%s | PokéData» del layout
  const title = `${team.nav} · PokéData`;
  // La canónica nunca lleva ?t=: un equipo compartido no es otra página
  const esPath = getLocalizedPath("es", "team");
  const enPath = getLocalizedPath("en", "team");
  const currentPath = locale === "es" ? esPath : enPath;

  return {
    title: { absolute: title },
    description: team.description,
    alternates: {
      canonical: currentPath,
      languages: { es: esPath, en: enPath },
    },
    openGraph: {
      title,
      description: team.description,
      url: currentPath,
      siteName: "PokéData",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
  };
}

// Equipo (DESIGN.md §4.9). La página es estática: el equipo vive en el
// navegador (localStorage o ?t=) y aparece tras la hidratación
export default async function TeamPage({ params }: TeamPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { team } = getDictionary(locale);

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div>
        <h1 className="text-hero font-black">{team.title}</h1>
        <p className="mt-3 text-body text-ink-soft max-sm:hidden">{team.lead}</p>
      </div>
    </div>
  );
}
