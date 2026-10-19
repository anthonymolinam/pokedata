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
  const { p1 = "charizard", p2 = "blastoise" } = await searchParams;
  const isEs = locale === "es";

  const p1Name = formatMetaName(p1, isEs);
  const p2Name = formatMetaName(p2, isEs);

  // 1. Marca primero en el título
  const title = isEs
    ? `PokéData | Comparar ${p1Name} vs ${p2Name}`
    : `PokéData | Compare ${p1Name} vs ${p2Name}`;

  // 2. Descripción orientada a la intención de búsqueda
  const description = isEs
    ? `Comparador Pokémon en PokéData: compara estadísticas base (PS, Ataque, Defensa, Velocidad), tipos elementales y ventajas de combate entre ${p1Name} y ${p2Name} cara a cara.`
    : `PokéData Pokémon Comparator: compare base stats (HP, Attack, Defense, Speed), elemental types, and battle matchups between ${p1Name} and ${p2Name} head-to-head.`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata.app";
  const esPath = `${baseUrl}${getLocalizedPath("es", "compare")}?p1=${p1}&p2=${p2}`;
  const enPath = `${baseUrl}${getLocalizedPath("en", "compare")}?p1=${p1}&p2=${p2}`;
  const currentPath = isEs ? esPath : enPath;

  return {
    title,
    description,
    keywords: isEs
      ? [
          "comparador pokemon",
          "comparar pokemon",
          "estadisticas pokemon",
          `${p1Name.toLowerCase()} vs ${p2Name.toLowerCase()}`,
          "base stats comparacion",
          "pokedata",
        ]
      : [
          "pokemon comparator",
          "compare pokemon",
          "pokemon stats comparison",
          `${p1Name.toLowerCase()} vs ${p2Name.toLowerCase()}`,
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
  // Admite alias en español (?p1=colmilargo) igual que la ficha
  const p1 = resolveCanonicalPokemonName(query.p1 || "charizard").toLowerCase();
  const p2 = resolveCanonicalPokemonName(query.p2 || "blastoise").toLowerCase();
  const { compare } = getDictionary(locale);

  const [pokemon1, pokemon2] = await Promise.all([
    getPokemonDetail(p1).catch(() => null),
    getPokemonDetail(p2).catch(() => null),
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
