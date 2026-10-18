import type { Metadata } from "next";
import TypeChart from "@/components/types/TypeChart";
import { getLocalizedPath } from "@/constants/routes";
import { isPokemonType } from "@/constants/typeColors";
import { Locale } from "@/proxy";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
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

// Tabla de tipos (DESIGN.md §4.5). El tipo elegido llega en ?type=fire
export default async function TypesPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { type } = await searchParams;

  return (
    <TypeChart
      locale={locale}
      basePath={getLocalizedPath(locale, "types")}
      selected={type && isPokemonType(type) ? type : null}
    />
  );
}
