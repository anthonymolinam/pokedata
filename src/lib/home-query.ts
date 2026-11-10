import {
  getFilteredPokemonIds,
  getPokemonSummariesByIds,
  searchPokemonGlobal,
  searchPokemonMatches,
  type PokemonSummary,
} from "@/lib/pokeapi";
import { decodeFavoritesCookie, encodeFavoritesCookie } from "@/lib/favorites";
import { GENERATIONS } from "@/constants/generations";

const TOTAL_POKEMON = 1025;

// Tarjetas por página de la portada, en el servidor y en el modo navegador
export const HOME_PAGE_SIZE = 24;

// Lo que pide la portada: tipos (?types=), región (?gen=), búsqueda (?q=) y
// solo favoritos (?fav=1, DESIGN.md §4.10)
export interface Query {
  types: string[];
  genId: number | null;
  q: string;
  // ?fav=1 en la URL: «mis favoritos», los de quien abre la página
  fav: boolean;
  // Los favoritos de la cookie, solo si hay ?fav=1. null es «ausente»: sin
  // ?fav=1, o con la cookie que falta o no es válida. Entonces el servidor no
  // filtra por favoritos y el filtro lo hace el navegador (modo navegador).
  favorites: number[] | null;
}

export interface HomeSearchParams {
  types?: string;
  gen?: string;
  q?: string;
  fav?: string;
}

// La consulta a partir de la URL y de la cookie de favoritos. La cookie solo
// se lee con ?fav=1; readFavoritesCookie se llama solo en ese caso.
export async function parseHomeQuery(
  params: HomeSearchParams | undefined,
  readFavoritesCookie: () => Promise<string | null | undefined>,
): Promise<Query> {
  const gen = Number(params?.gen);
  const fav = params?.fav === "1";
  return {
    types: params?.types ? params.types.split(",").filter(Boolean) : [],
    genId: GENERATIONS.some((g) => g.id === gen) ? gen : null,
    q: params?.q?.trim() ?? "",
    fav,
    favorites: fav ? decodeFavoritesCookie(await readFavoritesCookie()) : null,
  };
}

// ?fav=1 sin una cookie válida: el servidor no sabe qué favoritos hay, pinta
// las tarjetas fantasma y deja el resultado al navegador
export const needsBrowserFavorites = ({ fav, favorites }: Query) =>
  fav && favorites === null;

// Filtros de región o tipos (los favoritos van aparte)
export const hasFilters = ({ types, genId }: Query) =>
  types.length > 0 || genId !== null;

// Las funciones de datos, inyectables para las pruebas
export interface HomeQueryDeps {
  searchPokemonMatches: (q: string) => Promise<{ id: number; name: string }[]>;
  getFilteredPokemonIds: (filters: {
    types: string[];
    genId: number | null;
  }) => Promise<number[]>;
}

const defaultDeps: HomeQueryDeps = { searchPokemonMatches, getFilteredPokemonIds };

// Los favoritos de la consulta, o null si no se filtra por ellos
const favoriteSet = ({ favorites }: Query) =>
  favorites === null ? null : new Set(favorites);

// Búsqueda por nombre o número, dentro de los filtros y los favoritos activos
export async function getSearchMatches(query: Query, deps = defaultDeps) {
  let matches = await deps.searchPokemonMatches(query.q);
  const favs = favoriteSet(query);
  if (favs) matches = matches.filter((m) => favs.has(m.id));
  if (!hasFilters(query) || matches.length === 0) return matches;
  const allowed = new Set(await deps.getFilteredPokemonIds(query));
  return matches.filter((m) => allowed.has(m.id));
}

// Los números que cumplen la región, los tipos y los favoritos, en orden, sin
// búsqueda. null cuando no hay ningún filtro: son los 1025.
export async function getFilteredIds(
  query: Query,
  deps = defaultDeps,
): Promise<number[] | null> {
  const favs = favoriteSet(query);
  if (!hasFilters(query)) return query.favorites ? [...query.favorites] : null;
  // Sin favoritos guardados la intersección es vacía: no hace falta pedir nada
  if (favs?.size === 0) return [];
  const ids = await deps.getFilteredPokemonIds(query);
  return favs ? ids.filter((id) => favs.has(id)) : ids;
}

// Recuento de la portada: sin filtros ni búsqueda son todos; si no, los que
// cumplen
export async function countResults(query: Query, deps = defaultDeps) {
  if (query.q) return (await getSearchMatches(query, deps)).length;
  return (await getFilteredIds(query, deps))?.length ?? TOTAL_POKEMON;
}

// La página de la rejilla cuando hay búsqueda o algún filtro (favoritos
// incluidos); null sin ninguno, para que la portada pida la lista paginada
export async function getFilteredPage(
  query: Query,
  page: number,
  pageSize: number,
): Promise<{ pokemon: PokemonSummary[]; totalPages: number } | null> {
  if (query.q) {
    const matches = await getSearchMatches(query);
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    const validPage = Math.min(Math.max(1, page), totalPages);
    const { results } = await searchPokemonGlobal(
      matches,
      (validPage - 1) * pageSize,
      pageSize,
    );
    return { pokemon: results, totalPages };
  }
  const ids = await getFilteredIds(query);
  if (ids === null) return null;
  const totalPages = Math.max(1, Math.ceil(ids.length / pageSize));
  const validPage = Math.min(Math.max(1, page), totalPages);
  const pageIds = ids.slice((validPage - 1) * pageSize, validPage * pageSize);
  return {
    pokemon: await getPokemonSummariesByIds(pageIds, query.types),
    totalPages,
  };
}

// Los parámetros de la portada para enlaces (paginación): ?fav=1, nunca la
// lista de favoritos
export function homeQueryParams(query: Query): URLSearchParams {
  const params = new URLSearchParams();
  if (query.types.length > 0) params.set("types", query.types.join(","));
  if (query.genId) params.set("gen", String(query.genId));
  if (query.q) params.set("q", query.q);
  if (query.fav) params.set("fav", "1");
  return params;
}

// Clave de Suspense: cambia con cualquier filtro y con los favoritos, para que
// se vean las tarjetas fantasma mientras llega el resultado nuevo
export function homeQueryKey(query: Query): string {
  const favs = !query.fav ? "all" : query.favorites ? encodeFavoritesCookie(query.favorites) : "browser";
  return `${query.genId || "all"}-${query.types.join(",") || "all"}-${favs}-${query.q}`;
}

// Modo navegador (§4.10): GET /api/home?fav=<mapa de bits>&types=&gen=&q=.
// La lista llega en ?fav= con el formato y el tope de la cookie. null si falta
// o no es válida: la ruta no adivina y responde con un error.
export function parseBrowserFavoritesQuery(params: URLSearchParams): Query | null {
  const favorites = decodeFavoritesCookie(params.get("fav"));
  if (favorites === null) return null;
  const gen = Number(params.get("gen"));
  return {
    types: (params.get("types") ?? "").split(",").filter(Boolean),
    genId: GENERATIONS.some((g) => g.id === gen) ? gen : null,
    q: params.get("q")?.trim() ?? "",
    fav: true,
    favorites,
  };
}
