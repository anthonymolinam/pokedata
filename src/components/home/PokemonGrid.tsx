"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { PokemonSummary, formatPokemonDisplayName } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/constants/typeColors";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Animation Variants ---
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
}

export default function PokemonGrid({ initialList = [] }: PokemonGridProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PokemonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);

  const cleanQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const isSearching = cleanQuery.length > 0;

  // Search logic with 300ms debounce
  useEffect(() => {
    if (!isSearching) return;

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(cleanQuery)}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        if (data.results) {
          setSearchResults(data.results);
          setTotalFound(data.totalMatches || 0);
        } else {
          setSearchResults([]);
          setTotalFound(0);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error searching Pokémon:", error);
          setSearchResults([]);
          setTotalFound(0);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cleanQuery, isSearching]);

  // Fallback to initial paginated list when no search query is active
  const displayedList = isSearching ? searchResults : initialList;

  const handleClearQuery = () => {
    setQuery("");
    setSearchResults([]);
    setTotalFound(0);
    setIsLoading(false);
  };

  const handleClearAll = () => {
    handleClearQuery();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <form onSubmit={(e) => e.preventDefault()} className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entire Pokédex (e.g. Lucario, 448)..."
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
        />

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
          )}
          {query && !isLoading && (
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
          ? isLoading
            ? "Searching entire Pokédex..."
            : `Found ${totalFound} Pokémon (showing first ${displayedList.length})`
          : `Showing ${initialList.length} Pokémon on this page`}
      </p>

      {/* Animated Grid */}
      <AnimatePresence mode="wait">
        {displayedList.length > 0 ? (
          <motion.div
            key={
              isSearching
                ? `search-${cleanQuery}`
                : initialList.length > 0
                  ? `page-${initialList[0].id}`
                  : "empty"
            }
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {displayedList.map((pokemon, index) => (
              <motion.div key={pokemon.id} variants={cardVariants}>
                <Link
                  href={`/pokemon/${pokemon.name}`}
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
                          TYPE_COLORS[type] || "bg-zinc-700 text-white"
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
          !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16 px-4 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
            >
              {isSearching ? (
                <>
                  <p className="text-zinc-400 text-sm">
                    No Pokémon found matching &quot;{query}&quot; in the
                    National Pokédex.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearQuery}
                    className="mt-3 text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                  >
                    Clear search query
                  </button>
                </>
              ) : (
                <>
                  <p className="text-zinc-400 text-sm">
                    No Pokémon found matching the selected filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="mt-3 text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                  >
                    Reset advanced filters
                  </button>
                </>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
