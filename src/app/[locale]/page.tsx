import { Suspense } from "react";
import {
  getPaginatedPokemonList,
  getFilteredPokemonList,
  getFilteredPokemonIds,
} from "@/lib/pokeapi";
import { GENERATIONS } from "@/constants/generations";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";
import PokemonGrid from "@/components/home/PokemonGrid";
import PokemonFiltersBar from "@/components/home/PokemonFiltersBar";
import { PokemonGridSkeleton } from "@/components/pokemon/PokemonCardSkeleton";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; types?: string; gen?: string }>;
}

const PAGE_SIZE = 24;

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
  const filtersKey = `${genParam || "all"}-${typesParam || "all"}`;

  // El recuento y la rejilla se cargan aparte: mientras llega cada página o
  // filtro se ven las tarjetas fantasma (DESIGN.md §4.8)
  return (
    <div>
      <PokemonFiltersBar
        locale={locale}
        title={genParam ? filters.regionNames[genParam - 1] : filters.national}
        count={
          <Suspense
            key={filtersKey}
            fallback={<span className="invisible">1025 Pokémon</span>}
          >
            <ResultCount typesParam={typesParam} genParam={genParam} />
          </Suspense>
        }
      />

      <div className="mt-6">
        <Suspense
          key={`${filtersKey}-${currentPage}`}
          fallback={<PokemonGridSkeleton />}
        >
          <HomeResults
            locale={locale}
            currentPage={currentPage}
            typesParam={typesParam}
            genParam={genParam}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function HomeResults({
  locale,
  currentPage,
  typesParam,
  genParam,
}: {
  locale: string;
  currentPage: number;
  typesParam: string | null;
  genParam: number | null;
}) {
  const activeTypes = typesParam ? typesParam.split(",").filter(Boolean) : [];
  const hasFilters = activeTypes.length > 0 || genParam !== null;

  const { pokemon, totalPages } = hasFilters
    ? await getFilteredPokemonList({
        types: activeTypes,
        genId: genParam,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
    : await getPaginatedPokemonList(currentPage, PAGE_SIZE);

  const makePageUrl = (pageNum: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(pageNum));
    if (typesParam) queryParams.set("types", typesParam);
    if (genParam) queryParams.set("gen", String(genParam));
    return `/${locale}?${queryParams.toString()}`;
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

// «151 Pokémon»: sin filtros son todos; con filtros, los que los cumplen
async function ResultCount({
  typesParam,
  genParam,
}: {
  typesParam: string | null;
  genParam: number | null;
}) {
  const activeTypes = typesParam ? typesParam.split(",").filter(Boolean) : [];
  const total =
    activeTypes.length > 0 || genParam !== null
      ? (await getFilteredPokemonIds({ types: activeTypes, genId: genParam })).length
      : 1025;

  return <>{total} Pokémon</>;
}
