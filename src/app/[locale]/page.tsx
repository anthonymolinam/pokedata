import { Suspense } from "react";
import { getPaginatedPokemonList, getFilteredPokemonList } from "@/lib/pokeapi";
import { GENERATIONS } from "@/constants/generations";
import { getDictionary } from "@/constants/translations";
import { isPokemonType } from "@/constants/typeColors";
import PokemonGrid from "@/components/home/PokemonGrid";
import PokemonFiltersBar from "@/components/home/PokemonFiltersBar";
import { PokemonGridSkeleton } from "@/components/pokemon/PokemonCardSkeleton";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; types?: string; gen?: string }>;
}

const PAGE_SIZE = 24;

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedParams = await searchParams;
  const isEs = locale === "es";

  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const typesParam = resolvedParams?.types || null;
  const genParam = resolvedParams?.gen ? Number(resolvedParams.gen) : null;

  // La rejilla se carga aparte: mientras llega cada página o filtro se ven las
  // tarjetas fantasma (DESIGN.md §4.8)
  return (
    <div>
      <h1 className="text-head font-black">
        {isEs ? "Pokédex Nacional" : "National Pokédex"}
      </h1>

      <div className="mt-6">
        <PokemonFiltersBar locale={locale} />
      </div>

      <Suspense
        key={`${genParam || "all"}-${typesParam || "all"}-${currentPage}`}
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
  const isEs = locale === "es";
  const { typeNames } = getDictionary(locale);
  const activeTypes = typesParam ? typesParam.split(",").filter(Boolean) : [];
  const hasFilters = activeTypes.length > 0 || genParam !== null;

  const { pokemon, totalPages, totalCount } = hasFilters
    ? await getFilteredPokemonList({
        types: activeTypes,
        genId: genParam,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
    : await getPaginatedPokemonList(currentPage, PAGE_SIZE);

  const currentGenData = genParam
    ? GENERATIONS.find((g) => g.id === genParam)
    : null;

  const makePageUrl = (pageNum: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(pageNum));
    if (typesParam) queryParams.set("types", typesParam);
    if (genParam) queryParams.set("gen", String(genParam));
    return `/${locale}?${queryParams.toString()}`;
  };

  return (
    <>
      <p className="mt-4 mb-6 text-body">
        {hasFilters ? (
          <>
            {isEs
              ? `${totalCount} resultado${totalCount === 1 ? "" : "s"} para: `
              : `${totalCount} result${totalCount === 1 ? "" : "s"} for: `}
            {currentGenData && (
              <span className="font-extrabold mr-1">
                {currentGenData.name} ({currentGenData.region})
              </span>
            )}
            {activeTypes.length > 0 && (
              <span className="font-extrabold">
                {activeTypes
                  .map((t) => (isPokemonType(t) ? typeNames[t] : t))
                  .join(" + ")}
              </span>
            )}
          </>
        ) : (
          `${totalCount} Pokémon`
        )}
      </p>

      <PokemonGrid
        initialList={pokemon}
        currentPage={currentPage}
        totalPages={totalPages}
        prevPageHref={
          currentPage > 1 ? makePageUrl(currentPage - 1) : undefined
        }
        nextPageHref={
          currentPage < totalPages ? makePageUrl(currentPage + 1) : undefined
        }
        locale={locale}
      />
    </>
  );
}
