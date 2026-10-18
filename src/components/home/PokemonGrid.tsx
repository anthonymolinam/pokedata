"use client";

import { useState, useEffect, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PokemonSummary } from "@/lib/pokeapi";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { CARD_GRID } from "@/components/pokemon/PokemonCardSkeleton";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Solo las 24 primeras tarjetas entran con el «pop» (§6)
const POP_LIMIT = 24;

// Botones de la dirección Pop (§4.0): pastilla, pulsación a 0.96
const pill =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-pill font-extrabold text-small active:scale-[0.96] motion-safe:transition-transform duration-150";
const secondary = `${pill} bg-ink text-bone`;

interface PokemonGridProps {
  initialList: PokemonSummary[];
  currentPage?: number;
  totalPages?: number;
  prevPageHref?: string;
  nextPageHref?: string;
  locale?: string;
}

export default function PokemonGrid({
  initialList = [],
  currentPage = 1,
  totalPages = 1,
  prevPageHref,
  nextPageHref,
  locale: rawLocale = "es",
}: PokemonGridProps) {
  const router = useRouter();
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { grid } = getDictionary(locale);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PokemonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const cleanQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const isSearching = cleanQuery.length > 0;

  const getPokemonUrl = (name: string) => {
    const cleanName = name.toLowerCase();
    const slug =
      locale === "es" && CANONICAL_TO_SPANISH[cleanName]
        ? CANONICAL_TO_SPANISH[cleanName]
        : cleanName;

    return `/${locale}/pokemon/${slug}`;
  };

  useEffect(() => {
    if (!cleanQuery) return;

    const timeoutId = setTimeout(async () => {
      setIsDebouncing(false);
      setIsLoading(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(cleanQuery)}&offset=0`,
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        setSearchResults(data.results || []);
        setTotalFound(data.totalMatches || 0);
        setHasMore(data.hasMore || false);
      } catch (error) {
        console.error("Error searching Pokémon:", error);
        setSearchResults([]);
        setTotalFound(0);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [cleanQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length > 0) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
      setIsLoading(false);
      setSearchResults([]);
      setTotalFound(0);
      setHasMore(false);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setSearchResults([]);
    setTotalFound(0);
    setHasMore(false);
    setIsLoading(false);
    setIsDebouncing(false);
  };

  const handleClearAll = () => {
    handleClearQuery();
    router.push(`/${locale}`);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(cleanQuery)}&offset=${searchResults.length}`,
      );
      if (!res.ok) throw new Error("Load more failed");
      const data = await res.json();

      setSearchResults((prev) => [...prev, ...(data.results || [])]);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Error loading more Pokémon:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const displayedList = isSearching ? searchResults : initialList;
  const isSearchPending = isSearching && (isLoading || isDebouncing);

  return (
    <div>
      {/* Buscador provisional: pasa al hero en el paso 7 de DESIGN.md §8 */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="relative max-w-md"
      >
        <label htmlFor="grid-search" className="sr-only">
          {grid.searchLabel}
        </label>
        <Search
          aria-hidden="true"
          strokeWidth={2.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 size-5 pointer-events-none"
        />
        <input
          id="grid-search"
          type="search"
          value={query}
          onChange={handleInputChange}
          placeholder={grid.searchPlaceholder}
          className="w-full h-12 rounded-pill bg-surface focus:bg-step text-ink placeholder:text-ink-soft pl-12 pr-12 font-semibold motion-safe:transition-colors duration-150 [&::-webkit-search-cancel-button]:appearance-none"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {isSearchPending && (
            <Loader2 aria-hidden="true" className="size-5 mr-2 animate-spin" />
          )}
          {query && !isSearchPending && (
            <button
              type="button"
              onClick={handleClearQuery}
              aria-label={grid.clearSearch}
              className="grid place-items-center size-10 rounded-pill cursor-pointer active:scale-[0.96] motion-safe:transition-transform duration-150"
            >
              <X aria-hidden="true" strokeWidth={2.5} className="size-5" />
            </button>
          )}
        </div>
      </form>

      <p aria-live="polite" className="mt-3 min-h-[1.45em] text-body">
        {isSearching &&
          (isSearchPending ? grid.searching : `${totalFound} ${grid.found}`)}
      </p>

      {displayedList.length > 0 ? (
        <ul className={CARD_GRID}>
          {displayedList.map((pokemon, index) => (
            <li
              key={pokemon.id}
              className={index < POP_LIMIT ? "card-pop" : undefined}
              style={{ "--i": index } as CSSProperties}
            >
              <PokemonCard
                pokemon={pokemon}
                href={getPokemonUrl(pokemon.name)}
                locale={locale}
                eager={index < 4}
                headingAs="h2"
              />
            </li>
          ))}
        </ul>
      ) : (
        !isSearchPending && (
          <div className="py-24 text-center">
            <p className="text-lead font-black">{grid.empty}</p>
            <button
              type="button"
              onClick={handleClearAll}
              className={`${secondary} mt-6 cursor-pointer`}
            >
              {grid.clearFilters}
            </button>
          </div>
        )
      )}

      {isSearching && hasMore && (
        <div className="flex justify-center pt-16">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`${secondary} cursor-pointer disabled:cursor-wait`}
          >
            {isLoadingMore && (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            )}
            {isLoadingMore ? grid.loadingMore : grid.loadMore}
          </button>
        </div>
      )}

      {/* Paginación (§4.3): pastillas secundarias y «3 / 43» en 800 tabular */}
      {!isSearching && totalPages > 1 && (
        <nav
          aria-label={grid.pagination}
          className="flex items-center justify-center gap-4 pt-16 md:pt-20"
        >
          {prevPageHref ? (
            <Link href={prevPageHref} className={secondary}>
              <ChevronLeft aria-hidden="true" strokeWidth={2.75} className="size-4 -ml-1" />
              {grid.previous}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${pill} bg-step text-ink-soft`}>
              <ChevronLeft aria-hidden="true" strokeWidth={2.75} className="size-4 -ml-1" />
              {grid.previous}
            </span>
          )}

          <p className="font-extrabold num">
            <span aria-hidden="true">
              {currentPage} / {totalPages}
            </span>
            <span className="sr-only">
              {grid.page} {currentPage} {grid.of} {totalPages}
            </span>
          </p>

          {nextPageHref ? (
            <Link href={nextPageHref} className={secondary}>
              {grid.next}
              <ChevronRight aria-hidden="true" strokeWidth={2.75} className="size-4 -mr-1" />
            </Link>
          ) : (
            <span aria-disabled="true" className={`${pill} bg-step text-ink-soft`}>
              {grid.next}
              <ChevronRight aria-hidden="true" strokeWidth={2.75} className="size-4 -mr-1" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
