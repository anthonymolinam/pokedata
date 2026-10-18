import { Suspense } from "react";
import {
  getPaginatedPokemonList,
  getFilteredPokemonList,
  getFilteredPokemonIds,
  searchPokemonGlobal,
  searchPokemonMatches,
  PokemonSummary,
} from "@/lib/pokeapi";
import { GENERATIONS } from "@/constants/generations";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";
import HomeHero from "@/components/home/HomeHero";
import PokemonGrid from "@/components/home/PokemonGrid";
import PokemonFiltersBar from "@/components/home/PokemonFiltersBar";
import { PokemonGridSkeleton } from "@/components/pokemon/PokemonCardSkeleton";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    types?: string;
    gen?: string;
    q?: string;
  }>;
}

const PAGE_SIZE = 24;
const TOTAL_POKEMON = 1025;

interface Query {
  types: string[];
  genId: number | null;
  q: string;
}

const hasFilters = ({ types, genId }: Query) => types.length > 0 || genId !== null;

// Búsqueda por nombre o número, dentro de los filtros activos si los hay
async function getSearchMatches(query: Query) {
  const matches = await searchPokemonMatches(query.q);
  if (!hasFilters(query)) return matches;
  const allowed = new Set(await getFilteredPokemonIds(query));
  return matches.filter((m) => allowed.has(m.id));
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const resolvedParams = await searchParams;
  const { filters } = getDictionary(locale);

  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const typesParam = resolvedParams?.types || null;
  const genParam = GENERATIONS.some((g) => g.id === Number(resolvedParams?.gen))
    ? Number(resolvedParams.gen)
    : null;
  const query: Query = {
    types: typesParam ? typesParam.split(",").filter(Boolean) : [],
    genId: genParam,
    q: resolvedParams?.q?.trim() ?? "",
  };
  const queryKey = `${genParam || "all"}-${typesParam || "all"}-${query.q}`;

  // El recuento y la rejilla se cargan aparte: mientras llega cada página,
  // filtro o búsqueda se ven las tarjetas fantasma (DESIGN.md §4.8)
  return (
    <div>
      <HomeHero locale={locale} />

      <section
        id="pokedex"
        aria-labelledby="pokedex-title"
        className="mt-6 md:mt-8 scroll-mt-24"
      >
        <PokemonFiltersBar
          locale={locale}
          title={genParam ? filters.regionNames[genParam - 1] : filters.national}
          count={
            <Suspense
              key={queryKey}
              fallback={<span className="invisible">1025 Pokémon</span>}
            >
              <ResultCount query={query} />
            </Suspense>
          }
        />

        <Suspense
          key={`${queryKey}-${currentPage}`}
          fallback={<PokemonGridSkeleton />}
        >
          <HomeResults locale={locale} currentPage={currentPage} query={query} />
        </Suspense>
      </section>
    </div>
  );
}

async function HomeResults({
  locale,
  currentPage,
  query,
}: {
  locale: Locale;
  currentPage: number;
  query: Query;
}) {
  let pokemon: PokemonSummary[];
  let totalPages: number;

  if (query.q) {
    const matches = await getSearchMatches(query);
    totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    const page = Math.min(currentPage, totalPages);
    ({ results: pokemon } = await searchPokemonGlobal(
      matches,
      (page - 1) * PAGE_SIZE,
      PAGE_SIZE,
    ));
  } else if (hasFilters(query)) {
    ({ pokemon, totalPages } = await getFilteredPokemonList({
      types: query.types,
      genId: query.genId,
      page: currentPage,
      pageSize: PAGE_SIZE,
    }));
  } else {
    ({ pokemon, totalPages } = await getPaginatedPokemonList(
      currentPage,
      PAGE_SIZE,
    ));
  }

  const makePageUrl = (pageNum: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(pageNum));
    if (query.types.length > 0) queryParams.set("types", query.types.join(","));
    if (query.genId) queryParams.set("gen", String(query.genId));
    if (query.q) queryParams.set("q", query.q);
    return `/${locale}?${queryParams.toString()}#pokedex`;
  };

  return (
    <PokemonGrid
      initialList={pokemon}
      currentPage={currentPage}
      totalPages={totalPages}
      prevPageHref={currentPage > 1 ? makePageUrl(currentPage - 1) : undefined}
      nextPageHref={
        currentPage < totalPages ? makePageUrl(currentPage + 1) : undefined
      }
      locale={locale}
    />
  );
}

// «151 Pokémon»: sin filtros ni búsqueda son todos; si no, los que cumplen
async function ResultCount({ query }: { query: Query }) {
  let total = TOTAL_POKEMON;
  if (query.q) total = (await getSearchMatches(query)).length;
  else if (hasFilters(query)) total = (await getFilteredPokemonIds(query)).length;

  return <>{total} Pokémon</>;
}
