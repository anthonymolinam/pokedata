import { NextResponse } from "next/server";
import { GENERATIONS } from "@/constants/generations";
import { isPokemonType } from "@/constants/typeColors";
import { countResults } from "@/lib/home-query";

// Cuántos Pokémon daría una combinación de filtros, antes de aplicarla
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const types = (searchParams.get("types") ?? "")
    .split(",")
    .filter(isPokemonType)
    .slice(0, 2);
  const gen = Number(searchParams.get("gen"));
  const genId = GENERATIONS.some((g) => g.id === gen) ? gen : null;
  const q = searchParams.get("q")?.trim() ?? "";

  const total = await countResults({ types, genId, q });
  return NextResponse.json({ total });
}
