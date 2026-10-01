"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { GENERATIONS } from "@/constants/generations";
import { POKEMON_TYPES } from "@/constants/typeChart";
import { TYPE_COLORS } from "@/constants/typeColors";

interface PokemonFiltersBarProps {
  locale?: string;
}

const TYPE_TRANSLATIONS_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  steel: "Acero",
  dark: "Siniestro",
  fairy: "Hada",
};

export default function PokemonFiltersBar({
  locale = "es",
}: PokemonFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEs = locale === "es";

  const urlTypes = searchParams.get("types")
    ? searchParams.get("types")!.split(",").filter(Boolean)
    : [];
  const urlGen = searchParams.get("gen")
    ? Number(searchParams.get("gen"))
    : null;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedGen, setSelectedGen] = useState<number | null>(urlGen);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(urlTypes);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      if (selectedTypes.length >= 2) {
        setSelectedTypes([selectedTypes[0], type]);
      } else {
        setSelectedTypes([...selectedTypes, type]);
      }
    }
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (selectedTypes.length > 0) {
      params.set("types", selectedTypes.join(","));
    }
    if (selectedGen !== null) {
      params.set("gen", String(selectedGen));
    }
    params.set("page", "1");
    router.push(`/${locale}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedGen(null);
    setSelectedTypes([]);
    router.push(`/${locale}`);
    setIsOpen(false);
  };

  const activeFiltersCount = (urlGen !== null ? 1 : 0) + urlTypes.length;

  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden transition-colors">
      {/* Main trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-zinc-900/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-bold text-zinc-200">
            {isEs ? "Filtros Avanzados" : "Advanced Filters"}
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount} {isEs ? "activos" : "active"}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </motion.div>
      </button>

      {/* Expandable animated filter controls */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="filters-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden border-t border-zinc-800/80 bg-zinc-950/40"
          >
            <div className="p-5 space-y-5">
              {/* 1. Region / Generation selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {isEs ? "Región / Generación:" : "Region / Generation:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedGen(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                      selectedGen === null
                        ? "bg-rose-500 border-transparent text-white shadow-md shadow-rose-500/20"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {isEs ? "Todas" : "All"}
                  </button>
                  {GENERATIONS.map((gen) => {
                    const isSelected = selectedGen === gen.id;
                    return (
                      <button
                        key={gen.id}
                        type="button"
                        onClick={() =>
                          setSelectedGen(isSelected ? null : gen.id)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-rose-500 border-transparent text-white shadow-md shadow-rose-500/20"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {gen.name}{" "}
                        <span className="opacity-60 text-[10px]">
                          ({gen.region})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Elemental types selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {isEs ? "Tipos Elementales:" : "Elemental Types:"}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {isEs
                      ? `Seleccionados (${selectedTypes.length}/2)`
                      : `Selected (${selectedTypes.length}/2)`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {POKEMON_TYPES.map((type) => {
                    const isSelected = selectedTypes.includes(type);
                    const badgeBg =
                      TYPE_COLORS[type.toLowerCase()] ||
                      "bg-zinc-800 text-white";
                    const displayType =
                      isEs && TYPE_TRANSLATIONS_ES[type.toLowerCase()]
                        ? TYPE_TRANSLATIONS_ES[type.toLowerCase()]
                        : type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`text-[11px] uppercase font-bold px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${badgeBg} ${
                          isSelected
                            ? "opacity-100 ring-2 ring-white/90 shadow-lg shadow-white/20 brightness-110 z-10"
                            : "opacity-40 hover:opacity-80 hover:brightness-105"
                        }`}
                      >
                        {displayType}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/60">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  {isEs ? "Restablecer" : "Reset"}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/25 transition-colors cursor-pointer"
                >
                  {isEs ? "Aplicar Filtros" : "Apply Filters"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
