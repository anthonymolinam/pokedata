import type { Metadata } from "next";
import TypeChart, { type TypeSelection } from "@/components/types/TypeChart";
import { getLocalizedPath } from "@/constants/routes";
import { isPokemonType } from "@/constants/typeColors";
import { Locale } from "@/proxy";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ atk?: string; def?: string; type?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";

  return {
    title: isEs ? "Tabla de tipos | PokéData" : "Type chart | PokéData",
    description: isEs
      ? "Matriz completa de enfrentamientos elementales, debilidades y resistencias en Pokémon."
      : "Complete matrix of elemental matchups, weaknesses, and resistances in Pokémon.",
  };
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
