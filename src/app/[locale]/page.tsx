import { getPaginatedPokemonList, getFilteredPokemonList } from "@/lib/pokeapi";
import { GENERATIONS } from "@/constants/generations";
import PokemonGrid from "@/components/home/PokemonGrid";
import PokemonFiltersBar from "@/components/home/PokemonFiltersBar";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; types?: string; gen?: string }>;
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedParams = await searchParams;
  const isEs = locale === "es";

  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const typesParam = resolvedParams?.types || null;
  const genParam = resolvedParams?.gen ? Number(resolvedParams.gen) : null;
  const pageSize = 24;

  const activeTypes = typesParam ? typesParam.split(",").filter(Boolean) : [];
  const hasFilters = activeTypes.length > 0 || genParam !== null;

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

  const makePageUrl = (pageNum: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", String(pageNum));
    if (typesParam) queryParams.set("types", typesParam);
    if (genParam) queryParams.set("gen", String(genParam));
    return `/${locale}?${queryParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {isEs ? "Pokédex Nacional" : "National Pokédex"}
        </h1>
        <p className="text-zinc-400 text-sm">
          {hasFilters ? (
            <>
              {isEs ? (
                <>
                  Mostrando {totalCount} resultado{totalCount === 1 ? "" : "s"}{" "}
                  para:{" "}
                </>
              ) : (
                <>
                  Showing {totalCount} result{totalCount === 1 ? "" : "s"}{" "}
                  for:{" "}
                </>
              )}
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
          ) : isEs ? (
            `Explorando ${totalCount} Pokémon oficiales.`
          ) : (
            `Exploring ${totalCount} official Pokémon.`
          )}
        </p>
      </section>

      <PokemonFiltersBar locale={locale} />

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
        locale={locale}
      />
    </div>
  );
}
