import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getPaginatedPokemonList } from "@/lib/pokeapi";
import {
  countResults,
  getFilteredPage,
  homeQueryKey,
  homeQueryParams,
  needsBrowserFavorites,
  parseHomeQuery,
  type HomeSearchParams,
  type Query,
} from "@/lib/home-query";
import { FAVORITES_COOKIE } from "@/lib/favorites";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";
import { pageMetadata } from "@/lib/metadata";
import HomeHero from "@/components/home/HomeHero";
import PokemonGrid from "@/components/home/PokemonGrid";
import PokemonFiltersBar from "@/components/home/PokemonFiltersBar";
import { PokemonGridSkeleton } from "@/components/pokemon/PokemonCardSkeleton";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<HomeSearchParams & { page?: string }>;
}

const PAGE_SIZE = 24;

// La canónica es la portada sin filtros ni página: son vistas de la misma
export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { meta } = getDictionary(locale);

  return pageMetadata({
    locale,
    title: { absolute: meta.homeTitle },
    description: meta.homeDescription,
    paths: { es: "/es", en: "/en" },
  });
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const resolvedParams = await searchParams;
  const { filters, favorites } = getDictionary(locale);

  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  // La cookie de favoritos solo se lee con ?fav=1 (DESIGN.md §4.10)
  const query = await parseHomeQuery(
    resolvedParams,
    async () => (await cookies()).get(FAVORITES_COOKIE)?.value,
  );
  const genParam = query.genId;
  const queryKey = homeQueryKey(query);
  // ?fav=1 sin cookie válida: el servidor no filtra y el resultado lo calcula
  // el navegador; mientras, las tarjetas fantasma
  const browserFavorites = needsBrowserFavorites(query);

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
          // Con región manda la región; si no, «Tus favoritos» con ?fav=1
          title={
            genParam
              ? filters.regionNames[genParam - 1]
              : query.fav
                ? favorites.title
                : filters.national
          }
          count={
            browserFavorites ? (
              <span className="invisible">1025 Pokémon</span>
            ) : (
              <Suspense
                key={queryKey}
                fallback={<span className="invisible">1025 Pokémon</span>}
              >
                <ResultCount query={query} />
              </Suspense>
            )
          }
        />

        {browserFavorites ? (
          <PokemonGridSkeleton />
        ) : (
          <Suspense
            key={`${queryKey}-${currentPage}`}
            fallback={<PokemonGridSkeleton />}
          >
            <HomeResults locale={locale} currentPage={currentPage} query={query} />
          </Suspense>
        )}
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
  // Búsqueda, región, tipos o favoritos; sin ninguno, la lista paginada
  const { pokemon, totalPages } =
    (await getFilteredPage(query, currentPage, PAGE_SIZE)) ??
    (await getPaginatedPokemonList(currentPage, PAGE_SIZE));

  const makePageUrl = (pageNum: number) => {
    const queryParams = homeQueryParams(query);
    queryParams.set("page", String(pageNum));
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
  return <>{await countResults(query)} Pokémon</>;
}
