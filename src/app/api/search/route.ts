import { NextResponse } from "next/server";
import { getAllPokemonIndex, searchPokemonGlobal } from "@/lib/pokeapi";
import {
  MULTILINGUAL_ALIASES,
  normalizeQuery,
} from "@/constants/pokemonAliases";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit")) || 24),
  );

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
