"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PokemonSummary, formatPokemonDisplayName } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/constants/typeColors";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { motion, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

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
  locale = "es",
}: PokemonGridProps) {
  const router = useRouter();
  const isEs = locale === "es";

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
      isEs && CANONICAL_TO_SPANISH[cleanName]
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
    <div className="space-y-6">
      {/* Search Input */}
      <form onSubmit={(e) => e.preventDefault()} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={
            isEs
              ? "Buscar en la Pokédex (ej. Lucario, 448)..."
              : "Search entire Pokédex (e.g. Lucario, 448)..."
          }
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
        />

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isSearchPending && (
            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
          )}
          {query && !isSearchPending && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Info Subtitle */}
      <p className="text-xs text-zinc-500 font-mono">
        {isSearching
          ? isSearchPending
            ? isEs
              ? "Buscando en toda la Pokédex..."
              : "Searching entire Pokédex..."
            : isEs
              ? `Se encontraron ${totalFound} Pokémon (mostrando ${displayedList.length} de ${totalFound})`
              : `Found ${totalFound} Pokémon (showing ${displayedList.length} of ${totalFound})`
          : isEs
            ? `Mostrando ${initialList.length} Pokémon en esta página`
            : `Showing ${initialList.length} Pokémon on this page`}
      </p>

      {/* Grid de resultados */}
      {displayedList.length > 0 ? (
        <motion.div
          key="pokemon-results-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {displayedList.map((pokemon, index) => (
            <motion.div key={pokemon.id} variants={cardVariants}>
              <Link
                href={getPokemonUrl(pokemon.name)}
                className="group bg-zinc-900/50 border border-zinc-800/70 hover:border-zinc-600/80 rounded-2xl p-4 flex flex-col items-center transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 h-full"
              >
                <span className="self-end text-xs font-mono text-zinc-500 group-hover:text-zinc-400">
                  #{String(pokemon.id).padStart(4, "0")}
                </span>
                <div className="relative w-28 h-28 my-2">
                  <Image
                    src={pokemon.image}
                    alt={pokemon.name}
                    fill
                    sizes="112px"
                    priority={index < 6}
                    className="object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <h2 className="font-bold text-zinc-100 text-sm mb-2 text-center tracking-wide">
                  {formatPokemonDisplayName(pokemon.name)}
                </h2>
                <div className="flex gap-1 flex-wrap justify-center mt-auto">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        TYPE_COLORS[type.toLowerCase()] ||
                        "bg-zinc-700 text-white"
                      }`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        !isSearchPending && (
          <div className="text-center py-16 px-4 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            {isSearching ? (
              <>
                <p className="text-zinc-400 text-sm">
                  {isEs
                    ? `No se encontraron Pokémon para "${query}" en la Pokédex Nacional.`
                    : `No Pokémon found matching "${query}" in the National Pokédex.`}
                </p>
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="mt-3 text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                >
                  {isEs ? "Limpiar búsqueda" : "Clear search query"}
                </button>
              </>
            ) : (
              <>
                <p className="text-zinc-400 text-sm">
                  {isEs
                    ? "No se encontraron Pokémon con los filtros seleccionados."
                    : "No Pokémon found matching the selected filter criteria."}
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-3 text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                >
                  {isEs ? "Restablecer filtros" : "Reset advanced filters"}
                </button>
              </>
            )}
          </div>
        )
      )}

      {/* Botón Load More */}
      {isSearching && hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-black/20"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEs ? "Cargando más..." : "Loading more..."}</span>
              </>
            ) : (
              <span>
                {isEs
                  ? `Cargar más (${searchResults.length} de ${totalFound})`
                  : `Load more (${searchResults.length} of ${totalFound})`}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Paginación regular */}
      {!isSearching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-800/80">
          {prevPageHref ? (
            <Link
              href={prevPageHref}
              className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </span>
          )}

          <div className="flex items-center gap-1 font-mono text-sm px-4">
            <span className="text-white font-bold">{currentPage}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-400">{totalPages}</span>
          </div>

          {nextPageHref ? (
            <Link
              href={nextPageHref}
              className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
