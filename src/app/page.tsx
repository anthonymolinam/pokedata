import { getPaginatedPokemonList, getFilteredPokemonList } from "@/lib/pokeapi";
import { GENERATIONS } from "@/constants/generations";
import PokemonGrid from "@/components/home/PokemonGrid";
import PokemonFiltersBar from "@/components/home/PokemonFiltersBar";

interface PageProps {
  searchParams: Promise<{ page?: string; types?: string; gen?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const typesParam = resolvedParams?.types || null;
  const genParam = resolvedParams?.gen ? Number(resolvedParams.gen) : null;
  const pageSize = 24;

  const activeTypes = typesParam ? typesParam.split(",").filter(Boolean) : [];
  const hasFilters = activeTypes.length > 0 || genParam !== null;

  // Load data: filtered when active filters exist, or standard paginated list
  const { pokemon, totalPages, totalCount } = hasFilters
    ? await getFilteredPokemonList({
        types: activeTypes,
        genId: genParam,
        page: currentPage,
        pageSize,
      })
    : await getPaginatedPokemonList(currentPage, pageSize);

  const currentGenData = genParam
    ? GENERATIONS.find((g) => g.id === genParam)
    : null;

  // Build pagination URLs preserving active query filters
  const makePageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    if (typesParam) params.set("types", typesParam);
    if (genParam) params.set("gen", String(genParam));
    return `/?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          National Pokédex
        </h1>
        <p className="text-zinc-400 text-sm">
          {hasFilters ? (
            <>
              Showing {totalCount} result{totalCount === 1 ? "" : "s"} for:{" "}
              {currentGenData && (
                <span className="text-white font-semibold mr-1">
                  {currentGenData.name} ({currentGenData.region})
                </span>
              )}
              {activeTypes.length > 0 && (
                <span className="text-rose-400 font-semibold uppercase">
                  [{activeTypes.join(" + ")}]
                </span>
              )}
            </>
          ) : (
            `Exploring ${totalCount} official Pokémon.`
          )}
        </p>
      </section>

      {/* Filter toggle button and collapsible options panel */}
      <PokemonFiltersBar />

      {/* Pokémon grid managing both results and conditional pagination */}
      <PokemonGrid
        key={`${genParam || "all"}-${typesParam || "all"}-${currentPage}`}
        initialList={pokemon}
        currentPage={currentPage}
        totalPages={totalPages}
        prevPageHref={
          currentPage > 1 ? makePageUrl(currentPage - 1) : undefined
        }
        nextPageHref={
          currentPage < totalPages ? makePageUrl(currentPage + 1) : undefined
        }
      />
    </div>
  );
}
