import { NextResponse } from "next/server";
import { searchPokemonGlobal, searchPokemonMatches } from "@/lib/pokeapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") || "";
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit")) || 24),
  );

  const matches = await searchPokemonMatches(rawQuery);

  if (matches.length === 0) {
    return NextResponse.json({ results: [], totalMatches: 0, hasMore: false });
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
