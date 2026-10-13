import type { Metadata } from "next";
import { getPokemonDetail } from "@/lib/pokeapi";
import { getDictionary } from "@/constants/translations";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getLocalizedPath } from "@/constants/routes";
import CompareHeader from "@/components/compare/CompareHeader";
import CompareStatBars from "@/components/compare/CompareStatBars";

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

export default async function ComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { locale } = await params;
  const { p1 = "charizard", p2 = "blastoise" } = await searchParams;
  const dict = getDictionary(locale);

  const [pokemon1, pokemon2] = await Promise.all([
    getPokemonDetail(p1).catch(() => null),
    getPokemonDetail(p2).catch(() => null),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {dict.compare.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          {dict.compare.subtitle}
        </p>
      </div>

      <CompareHeader
        pokemon1={pokemon1}
        pokemon2={pokemon2}
        p1Slug={p1}
        p2Slug={p2}
        locale={locale}
      />

      {pokemon1 && pokemon2 && (
        <CompareStatBars
          pokemon1={pokemon1}
          pokemon2={pokemon2}
          locale={locale}
        />
      )}
    </main>
  );
}
