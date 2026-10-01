"use client";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPokemonDisplayName, PokemonSummary } from "@/lib/pokeapi";

export default function GlobalSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detectar plataforma para el shortcut
  const isMac = useSyncExternalStore(
    () => () => {}, // Subscribe vacío (la plataforma no cambia en caliente)
    () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent), // Valor en cliente
    () => false, // Valor por defecto en servidor (SSR)
  );
  // Shortcut global Ctrl+K / Cmd+K
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Cerrar y limpiar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setQuery("");
        setResults([]);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll automático en navegación con flechas
  useEffect(() => {
    if (selectedIndex >= 0 && resultsListRef.current) {
      const activeEl = resultsListRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Debounce de búsqueda asíncrona (sin setStates sincrónicos en el cuerpo del efecto)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=20`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelect = (pokemonName: string) => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/pokemon/${pokemonName.toLowerCase()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex].name);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Pokémon..."
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-14 py-1.5 text-base sm:text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/50 transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded select-none pointer-events-none">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            ref={resultsListRef}
            className="absolute left-0 right-0 top-full mt-2 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto overscroll-contain custom-scrollbar z-50 py-1.5 divide-y divide-zinc-800/40"
          >
            {results.map((p, idx) => (
              <motion.button
                key={p.name}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.15,
                  delay: Math.min(idx * 0.02, 0.2),
                }}
                type="button"
                onClick={() => handleSelect(p.name)}
                className={`w-full flex items-center justify-between px-3.5 py-2 transition-colors text-left cursor-pointer ${
                  idx === selectedIndex
                    ? "bg-rose-500/20 text-white"
                    : "hover:bg-zinc-800/60 text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="32px"
                      className="object-contain transition-opacity duration-300 opacity-0"
                      onLoad={(e) => {
                        (e.target as HTMLElement).classList.remove("opacity-0");
                        (e.target as HTMLElement).classList.add("opacity-100");
                      }}
                    />
                  </div>
                  <span className="font-semibold text-xs truncate">
                    {formatPokemonDisplayName(p.name)}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500 shrink-0 ml-2">
                  #{String(p.id).padStart(4, "0")}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
