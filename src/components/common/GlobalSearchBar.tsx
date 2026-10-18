"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPokemonDisplayName, PokemonSummary } from "@/lib/pokeapi";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";

// El desplegable es una capa flotante: la única sombra permitida en la barra (DESIGN.md §4.1)
const OVERLAY_SHADOW = "shadow-[0_12px_32px_rgb(10_10_10/0.18)]"; // taste-skill-ignore

interface GlobalSearchBarProps {
  locale?: string;
  placeholder?: string;
}

export default function GlobalSearchBar({
  locale = "es",
  placeholder = "Search Pokémon...",
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detección segura en cliente de Mac sin useEffect síncrono
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    () => false,
  );

  // Atajo global Ctrl+K / Cmd+K
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

  // Auto-scroll al navegar con flechas
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

  // Debounce de búsqueda asíncrona
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

    const cleanName = pokemonName.toLowerCase();
    // Si estamos navegando en español y existe un slug traducido, lo priorizamos en la URL
    const slug =
      locale === "es" && CANONICAL_TO_SPANISH[cleanName]
        ? CANONICAL_TO_SPANISH[cleanName]
        : cleanName;

    router.push(`/${locale}/pokemon/${slug}`);
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
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search
          aria-hidden="true"
          className="absolute left-3 w-4 h-4 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full h-11 bg-field-step text-field-ink placeholder:text-field-ink pl-10 pr-10 lg:pr-20 text-body [&::-webkit-search-cancel-button]:appearance-none"
        />

        <div className="absolute right-3 flex items-center gap-1 text-small font-bold">
          {loading ? (
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer p-1 active:scale-[0.97] transition-transform duration-150"
              aria-label={locale === "es" ? "Borrar búsqueda" : "Clear search"}
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden lg:inline select-none pointer-events-none font-sans">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          // Capa flotante sobre papel: el único sitio de la barra con sombra (§4.1)
          <motion.div
            data-field="paper"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            ref={resultsListRef}
            className={`absolute left-0 right-0 md:right-auto md:w-[max(100%,24rem)] top-full mt-2 bg-paper text-ink ${OVERLAY_SHADOW} max-h-[min(24rem,60svh)] overflow-y-auto overscroll-contain custom-scrollbar z-50 py-1`}
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
                className={`w-full flex items-center gap-3 px-3 py-1.5 text-left cursor-pointer focus-visible:-outline-offset-3 ${
                  idx === selectedIndex
                    ? "bg-ink text-bone"
                    : "hover:bg-paper-step"
                }`}
              >
                <span className="relative w-10 h-10 shrink-0">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-contain transition-opacity duration-300 opacity-0"
                    onLoad={(e) => {
                      (e.target as HTMLElement).classList.remove("opacity-0");
                      (e.target as HTMLElement).classList.add("opacity-100");
                    }}
                  />
                </span>
                <span className="flex-1 min-w-0 font-bold text-body truncate">
                  {formatPokemonDisplayName(p.name)}
                </span>
                <span className="num font-bold text-small shrink-0">
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
