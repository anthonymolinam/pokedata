import type { Metadata } from "next";
import TypeChart, { type TypeSelection } from "@/components/types/TypeChart";
import { getLocalizedPath } from "@/constants/routes";
import { isPokemonType } from "@/constants/typeColors";
import { Locale } from "@/proxy";
import { getDictionary } from "@/constants/translations";
import { pageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ atk?: string; def?: string; type?: string }>;
}

// La canónica no lleva ?atk= ni ?def=: la selección es una vista de la tabla
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { meta } = getDictionary(locale);

  return pageMetadata({
    locale,
    title: meta.types,
    description: meta.typesDescription,
    paths: {
      es: getLocalizedPath("es", "types"),
      en: getLocalizedPath("en", "types"),
    },
  });
}

// Tabla de tipos (DESIGN.md §4.5). La fila elegida llega en ?atk=fire y la
// columna en ?def=fire; los enlaces antiguos con ?type= abren la fila
export default async function TypesPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { atk, def, type } = await searchParams;

  let selected: TypeSelection | null = null;
  const attacker = atk ?? type;
  if (attacker && isPokemonType(attacker)) selected = { axis: "atk", type: attacker };
  else if (def && isPokemonType(def)) selected = { axis: "def", type: def };

  return (
    <TypeChart
      locale={locale}
      basePath={getLocalizedPath(locale, "types")}
      selected={selected}
    />
  );
}
