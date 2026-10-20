"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Artwork from "@/components/common/Artwork";
import { Search, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPokemonDisplayName, PokemonSummary } from "@/lib/pokeapi";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { isHeroSearchVisible } from "@/lib/hero-search-visibility";

// El desplegable es una capa flotante: la única sombra permitida en la barra (DESIGN.md §4.1)
const OVERLAY_SHADOW = "shadow-(--shadow-overlay)";

interface GlobalSearchBarProps {
  locale?: string;
  placeholder?: string;
  label?: string;
  // compact: pastilla de 40px de la cabecera · overlay: buscador a pantalla completa en móvil
  variant?: "compact" | "overlay";
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export default function GlobalSearchBar({
  locale = "es",
  placeholder = "Search Pokémon...",
  label = placeholder,
  variant = "compact",
  autoFocus = false,
  onNavigate,
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
  const isOverlay = variant === "overlay";

  // Detección segura en cliente de Mac sin useEffect síncrono
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    () => false,
  );

  // Atajo global Ctrl+K / Cmd+K: solo lo atiende el buscador que se ve. En la
  // portada, mientras el del hero está en pantalla, es suyo (§4.1)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        const input = inputRef.current;
        if (!input || input.getClientRects().length === 0) return;
        if (!isOverlay && isHeroSearchVisible()) return;
        e.preventDefault();
        input.focus({ preventScroll: true });
        input.select();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOverlay]);

  // Foco al montar sin desplazar la página (el autoFocus nativo sí lo hace)
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

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
    inputRef.current?.focus({ preventScroll: true });
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
    onNavigate?.();
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
          strokeWidth={2.5}
          className="absolute left-3.5 w-4 h-4 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label}
          className={`w-full rounded-pill bg-surface focus:bg-step text-ink placeholder:text-ink-soft pl-10 font-semibold [&::-webkit-search-cancel-button]:appearance-none ${
            isOverlay ? "h-12 pr-12 text-body" : "h-10 pr-10 lg:pr-20 text-small"
          }`}
        />

        <div className="absolute right-3 flex items-center gap-1 text-small font-extrabold">
          {loading ? (
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer p-1 rounded-pill active:scale-[0.96] transition-transform duration-150 after:absolute after:-inset-2"
              aria-label={locale === "es" ? "Borrar búsqueda" : "Clear search"}
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          ) : (
            // Pista del atajo como texto secundario, sin caja (§4.1)
            <kbd
              className={`select-none pointer-events-none font-sans text-ink-soft ${
                isOverlay ? "hidden" : "hidden lg:inline"
              }`}
            >
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          // Capa flotante sobre blanco: el único sitio de la barra con sombra (§4.1)
          <motion.div
            data-field="raised"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            ref={resultsListRef}
            className={`bg-raised text-ink overflow-y-auto overscroll-contain custom-scrollbar py-2 ${
              isOverlay
                ? "mt-3 max-h-[calc(100svh-7rem)]"
                : `absolute right-0 w-[max(100%,24rem)] top-full mt-2 rounded-[1.375rem] ${OVERLAY_SHADOW} max-h-[min(24rem,60svh)] z-50`
            }`}
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
                className={`w-full flex items-center gap-3 px-4 py-1.5 text-left cursor-pointer focus-visible:-outline-offset-3 ${
                  idx === selectedIndex
                    ? "bg-ink text-bone"
                    : "hover:bg-step"
                }`}
              >
                <span className="relative w-10 h-10 shrink-0">
                  <Artwork
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
