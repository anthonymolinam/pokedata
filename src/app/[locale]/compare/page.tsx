import type { Metadata } from "next";
import { getPokemonDetail } from "@/lib/pokeapi";
import { getDictionary } from "@/constants/translations";
import {
  CANONICAL_TO_SPANISH,
  resolveCanonicalPokemonName,
} from "@/constants/pokemonAliases";
import { getLocalizedPath } from "@/constants/routes";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareStatBars from "@/components/compare/CompareStatBars";
import { getDailyPokemon } from "@/lib/daily-server";
import { Locale } from "@/proxy";

interface ComparePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ p1?: string; p2?: string }>;
}

function formatMetaName(name: string, isEs: boolean): string {
  const lower = name.toLowerCase();
  if (isEs && CANONICAL_TO_SPANISH[lower]) {
    return CANONICAL_TO_SPANISH[lower]
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
  searchParams,
}: ComparePageProps): Promise<Metadata> {
  const { locale } = await params;
  const { p1, p2 } = await searchParams;
  const isEs = locale === "es";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata.app";

  // Sin los dos Pokémon (la página vacía por defecto), título genérico y
  // enlace sin parámetros
  const pair =
    p1 && p2
      ? { p1: formatMetaName(p1, isEs), p2: formatMetaName(p2, isEs) }
      : null;
  const query = pair ? `?p1=${p1}&p2=${p2}` : "";

  // 1. Marca primero en el título
  const title = pair
    ? isEs
      ? `PokéData | Comparar ${pair.p1} vs ${pair.p2}`
      : `PokéData | Compare ${pair.p1} vs ${pair.p2}`
    : isEs
      ? "PokéData | Comparador de Pokémon"
      : "PokéData | Pokémon comparator";

  // 2. Descripción orientada a la intención de búsqueda
  const versus = pair
    ? isEs
      ? `entre ${pair.p1} y ${pair.p2}`
      : `between ${pair.p1} and ${pair.p2}`
    : isEs
      ? "entre dos Pokémon"
      : "between two Pokémon";
  const description = isEs
    ? `Comparador Pokémon en PokéData: compara estadísticas base (PS, Ataque, Defensa, Velocidad), tipos elementales y ventajas de combate ${versus} cara a cara.`
    : `PokéData Pokémon Comparator: compare base stats (HP, Attack, Defense, Speed), elemental types, and battle matchups ${versus} head-to-head.`;

  const esPath = `${baseUrl}${getLocalizedPath("es", "compare")}${query}`;
  const enPath = `${baseUrl}${getLocalizedPath("en", "compare")}${query}`;
  const currentPath = isEs ? esPath : enPath;
  const pairKeyword = pair
    ? [`${pair.p1.toLowerCase()} vs ${pair.p2.toLowerCase()}`]
    : [];

  return {
    title,
    description,
    keywords: isEs
      ? [
          "comparador pokemon",
          "comparar pokemon",
          "estadisticas pokemon",
          ...pairKeyword,
          "base stats comparacion",
          "pokedata",
        ]
      : [
          "pokemon comparator",
          "compare pokemon",
          "pokemon stats comparison",
          ...pairKeyword,
          "base stats battle",
          "pokedata",
        ],
    alternates: {
      canonical: currentPath,
      languages: {
        es: esPath,
        en: enPath,
      },
    },
    openGraph: {
      title,
      description,
      url: currentPath,
      siteName: "PokéData",
      locale: isEs ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// Comparador (DESIGN.md §4.6): dos escenarios en el campo de cada Pokémon y,
// debajo, sus estadísticas enfrentadas
export default async function ComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const query = await searchParams;
  // Admite alias en español (?p1=colmilargo) igual que la ficha. Sin enlace,
  // los dos lados empiezan vacíos
  const p1 = query.p1
    ? resolveCanonicalPokemonName(query.p1).toLowerCase()
    : "";
  const p2 = query.p2
    ? resolveCanonicalPokemonName(query.p2).toLowerCase()
    : "";
  const { compare } = getDictionary(locale);

  const [pokemon1, pokemon2] = await Promise.all([
    p1 ? getPokemonDetail(p1).catch(() => null) : null,
    p2 ? getPokemonDetail(p2).catch(() => null) : null,
  ]);

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <div>
        <h1 className="text-hero font-black">{compare.title}</h1>
        <p className="mt-3 text-body">{compare.subtitle}</p>
      </div>

      <CompareHeader
        pokemon1={pokemon1}
        pokemon2={pokemon2}
        p1Slug={p1}
        p2Slug={p2}
        basePath={getLocalizedPath(locale, "compare")}
        suggestions={getDailyPokemon()}
        locale={locale}
      />

      {pokemon1 && pokemon2 && (
        // La key vuelve a montar las barras al cambiar de Pokémon o de forma,
        // para que crezcan de nuevo
        <CompareStatBars
          key={`${p1}:${p2}`}
          pokemon1={pokemon1}
          pokemon2={pokemon2}
          locale={locale}
        />
      )}
    </div>
  );
}
