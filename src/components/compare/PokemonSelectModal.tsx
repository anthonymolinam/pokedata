"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { PokemonSummary } from "@/lib/pokeapi";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";

interface PokemonSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemonSlug: string) => void;
  currentPokemonSlug?: string;
  locale?: string;
}

export default function PokemonSelectModal({
  isOpen,
  onClose,
  onSelect,
  currentPokemonSlug,
  locale = "es",
}: PokemonSelectModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PokemonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dict = getDictionary(locale);
  const isEs = locale === "es";
  const cleanQuery = searchTerm.trim();
  const results = cleanQuery === "" ? [] : searchResults;

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!cleanQuery) return;

    let ignore = false;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(cleanQuery)}&limit=30`,
          { signal: controller.signal },
        );
        if (res.ok && !ignore) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error al buscar Pokémon:", err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [cleanQuery]);

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    onClose();
  };

  const handleSelect = (slug: string) => {
    setSearchTerm("");
    setSearchResults([]);
    onSelect(slug);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {dict.compare.selectTitle}
            </h3>
            <button
              onClick={handleClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            {isLoading ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={dict.compare.selectPlaceholder}
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto p-3 sm:p-4 divide-y divide-zinc-800/40 min-h-55">
          {cleanQuery === "" ? (
            <div className="py-14 text-center text-xs text-zinc-500">
              {dict.compare.selectEmpty}
            </div>
          ) : !isLoading && results.length === 0 ? (
            <div className="py-14 text-center text-xs text-zinc-500">
              {dict.common.noResults}
            </div>
          ) : (
            results.map((item) => {
              const displayName =
                isEs && CANONICAL_TO_SPANISH[item.name.toLowerCase()]
                  ? CANONICAL_TO_SPANISH[item.name.toLowerCase()]
                  : item.name;

              const isSelected =
                currentPokemonSlug?.toLowerCase() === item.name.toLowerCase();

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                    isSelected
                      ? "bg-zinc-800/90 border border-rose-500/50"
                      : "hover:bg-zinc-800/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-contain group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-zinc-200 group-hover:text-white capitalize block">
                        {displayName.replace(/-/g, " ")}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        #{String(item.id).padStart(4, "0")}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {dict.compare.activeBadge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
