import type { Metadata } from "next";
import { getDictionary } from "@/constants/translations";
import { getLocalizedPath } from "@/constants/routes";
import TeamBuilder from "@/components/team/TeamBuilder";
import { Locale } from "@/proxy";
import { pageMetadata } from "@/lib/metadata";

interface TeamPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { team } = getDictionary(locale);

  // «Equipo · PokéData» (§4.9). La canónica nunca lleva ?t=: un equipo
  // compartido no es otra página
  return pageMetadata({
    locale,
    title: team.nav,
    description: team.description,
    paths: {
      es: getLocalizedPath("es", "team"),
      en: getLocalizedPath("en", "team"),
    },
  });
}

// Equipo (DESIGN.md §4.9). La página es estática: el equipo vive en el
// navegador (localStorage o ?t=) y aparece tras la hidratación
export default async function TeamPage({ params }: TeamPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";

  // El título y la frase los pinta TeamBuilder, porque por debajo de 1024px
  // «Compartir enlace» va a su lado
  return <TeamBuilder locale={locale} />;
}
