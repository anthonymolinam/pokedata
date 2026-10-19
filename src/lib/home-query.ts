import { getFilteredPokemonIds, searchPokemonMatches } from "@/lib/pokeapi";

const TOTAL_POKEMON = 1025;

// Lo que pide la portada: tipos (?types=), región (?gen=) y búsqueda (?q=)
export interface Query {
  types: string[];
  genId: number | null;
  q: string;
}

export const hasFilters = ({ types, genId }: Query) =>
  types.length > 0 || genId !== null;

// Búsqueda por nombre o número, dentro de los filtros activos si los hay
export async function getSearchMatches(query: Query) {
  const matches = await searchPokemonMatches(query.q);
  if (!hasFilters(query)) return matches;
  const allowed = new Set(await getFilteredPokemonIds(query));
  return matches.filter((m) => allowed.has(m.id));
}

// Sin filtros ni búsqueda son todos; si no, los que cumplen. Lo usan el
// recuento de la portada y el botón «Aplicar» del panel de filtros
export async function countResults(query: Query) {
  if (query.q) return (await getSearchMatches(query)).length;
  if (hasFilters(query)) return (await getFilteredPokemonIds(query)).length;
  return TOTAL_POKEMON;
}
