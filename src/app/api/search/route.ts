import { NextResponse } from "next/server";
import { getAllPokemonIndex, searchPokemonGlobal } from "@/lib/pokeapi";

const MULTILINGUAL_ALIASES: Record<string, string> = {
  // Nombres especiales
  "codigo cero": "type-null",
  "codigo-cero": "type-null",

  // Paradojas Pasado (Gen 9)
  colmilargo: "great-tusk",
  colagrito: "scream-tail",
  furioseta: "brute-bonnet",
  melenaleteo: "flutter-mane",
  reptalada: "slither-wing",
  peliarena: "sandy-shocks",
  bramaluna: "roaring-moon",
  ondulagua: "walking-wake",
  flamalariete: "gouging-fire",
  electrofuror: "raging-bolt",

  // Paradojas Futuro (Gen 9)
  ferrodada: "iron-treads",
  ferrosaco: "iron-bundle",
  ferropalmas: "iron-hands",
  ferrocuello: "iron-jugulis",
  ferropolilla: "iron-moth",
  ferropuas: "iron-thorns",
  ferropaladin: "iron-valiant",
  ferroverdor: "iron-leaves",
  ferromole: "iron-boulder",
  ferrotesta: "iron-crown",
};

function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = 24;

  const cleanQuery = normalizeQuery(rawQuery);

  if (!cleanQuery) {
    return NextResponse.json({ results: [], totalMatches: 0, hasMore: false });
  }

  const allPokemon = await getAllPokemonIndex();
  const isNumeric = /^\d+$/.test(cleanQuery);

  let matches: { id: number; name: string }[] = [];

  if (isNumeric) {
    matches = allPokemon.filter((poke) => poke.id === Number(cleanQuery));
  } else {
    const matchedCanonicalNames = new Set<string>();

    for (const [spanishAlias, englishName] of Object.entries(
      MULTILINGUAL_ALIASES,
    )) {
      if (spanishAlias.includes(cleanQuery)) {
        matchedCanonicalNames.add(englishName);
      }
    }

    matches = allPokemon.filter((poke) => {
      const pokeName = normalizeQuery(poke.name);
      return (
        pokeName.includes(cleanQuery) || matchedCanonicalNames.has(pokeName)
      );
    });
  }

  const { results, hasMore } = await searchPokemonGlobal(
    matches,
    offset,
    limit,
  );

  return NextResponse.json({
    results,
    totalMatches: matches.length,
    hasMore,
  });
}
