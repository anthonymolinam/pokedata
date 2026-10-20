import { NextResponse } from "next/server";
import { POKEMON_TYPES, type PokemonType } from "@/constants/typeChart";
import { getTeamMemberSource } from "@/lib/pokeapi";
import { formatFormName, formatPokemonHeroName } from "@/lib/pokemon-names";
import {
  STAT_KEYS,
  sanitizeTeam,
  type StatKey,
  type TeamMember,
} from "@/lib/team";

// Datos de los miembros del equipo (DESIGN.md §4.9):
// GET /api/team?slugs=charizard,ninetales-alola&locale=es
//
// Devuelve { members } en el orden pedido, con null en el sitio de cada slug
// que PokéAPI no conoce: el cliente lo descarta del equipo. Un slug puede
// volver con otro nombre (la forma por defecto vuelve como la especie). Son
// datos de PokéAPI que no cambian, así que la respuesta se cachea mucho
// tiempo; si PokéAPI falla, responde 502 sin caché para reintentarlo.

const CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000";

const isPokemonType = (type: string): type is PokemonType =>
  POKEMON_TYPES.includes(type as PokemonType);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = sanitizeTeam((searchParams.get("slugs") ?? "").split(","));
  const isEs = searchParams.get("locale") !== "en";

  let sources;
  try {
    sources = await Promise.all(slugs.map(getTeamMemberSource));
  } catch {
    return NextResponse.json(
      { error: "pokeapi-unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const members: (TeamMember | null)[] = sources.map((source) => {
    if (!source) return null;
    const stats = Object.fromEntries(
      STAT_KEYS.map((key) => [
        key,
        source.stats.find((s) => s.name === key)?.value ?? 0,
      ]),
    ) as Record<StatKey, number>;
    return {
      slug: source.slug,
      id: source.speciesId,
      name: formatPokemonHeroName(source.speciesName, isEs ? "es" : "en"),
      form: source.formLabel ? formatFormName(source.formLabel, isEs) : null,
      types: source.types.filter(isPokemonType),
      stats,
      artworkId: source.artworkId,
      forms: source.forms.map((form) => ({
        slug: form.slug,
        name: form.label ? formatFormName(form.label, isEs) : null,
      })),
    };
  });

  return NextResponse.json(
    { members },
    { headers: { "Cache-Control": CACHE_CONTROL } },
  );
}
