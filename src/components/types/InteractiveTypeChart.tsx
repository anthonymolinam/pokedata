"use client";

import { useState, useRef, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { POKEMON_TYPES, PokemonType, TYPE_CHART } from "@/constants/typeChart";
import { TYPE_COLORS } from "@/constants/typeColors";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

interface InteractiveTypeChartProps {
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

const TYPE_ABBR_ES: Record<string, string> = {
  normal: "NOR",
  fire: "FUE",
  water: "AGU",
  grass: "PLA",
  electric: "ELE",
  ice: "HIE",
  fighting: "LUC",
  poison: "VEN",
  ground: "TIE",
  flying: "VOL",
  psychic: "PSI",
  bug: "BIC",
  rock: "ROC",
  ghost: "FAN",
  dragon: "DRA",
  steel: "ACE",
  dark: "SIN",
  fairy: "HAD",
};

export default function InteractiveTypeChart({
  locale = "es",
}: InteractiveTypeChartProps) {
  const isEs = locale === "es";

  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    atk: PokemonType;
    def: PokemonType;
  } | null>(null);

  const rafRef = useRef<number | null>(null);

  const handleCellHover = useCallback((atk: PokemonType, def: PokemonType) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setHoveredCell({ atk, def });
    });
  }, []);

  const handleCellLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setHoveredCell(null);
    });
  }, []);

  const getTypeName = (type: string) => {
    return isEs && TYPE_TRANSLATIONS_ES[type.toLowerCase()]
      ? TYPE_TRANSLATIONS_ES[type.toLowerCase()]
      : type;
  };

  const getTypeAbbr = (type: string) => {
    if (isEs && TYPE_ABBR_ES[type.toLowerCase()]) {
      return TYPE_ABBR_ES[type.toLowerCase()];
    }
    return type.slice(0, 3).toUpperCase();
  };

  const renderBadge = (val: number, isDimmed: boolean) => {
    if (val === 2) {
      return (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 font-black text-xs border border-emerald-500/30 transition-opacity duration-300 ease-in-out ${
            isDimmed
              ? "opacity-15"
              : "opacity-100 shadow-xs shadow-emerald-500/10"
          }`}
        >
          2×
        </span>
      );
    }
    if (val === 0.5) {
      return (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 font-extrabold text-[11px] border border-amber-500/30 transition-opacity duration-300 ease-in-out ${
            isDimmed
              ? "opacity-15"
              : "opacity-100 shadow-xs shadow-amber-500/10"
          }`}
        >
          ½
        </span>
      );
    }
    if (val === 0) {
      return (
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800/80 text-zinc-400 font-black text-xs border border-zinc-700/60 transition-opacity duration-300 ease-in-out ${
            isDimmed ? "opacity-10" : "opacity-100"
          }`}
        >
          0
        </span>
      );
    }
    return (
      <span
        className={`text-zinc-600 text-xs font-mono select-none transition-opacity duration-300 ease-in-out ${
          isDimmed ? "opacity-10" : "opacity-35"
        }`}
      >
        —
      </span>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col justify-start min-h-0"
    >
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 flex flex-col justify-start shadow-xl shadow-black/20">
        {/* Barra superior de estado */}
        <div className="h-8 flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80 mb-2 px-1">
          <div className="flex items-center gap-2 font-mono text-[11px] select-none text-zinc-400">
            <span className="font-semibold text-zinc-300">
              {isEs ? "Fila" : "Row"}
            </span>
            <span className="text-zinc-600">=</span>
            <span>{isEs ? "Atacante" : "Attacker"}</span>
            <span className="text-zinc-700">|</span>
            <span className="font-semibold text-zinc-300">
              {isEs ? "Columna" : "Column"}
            </span>
            <span className="text-zinc-600">=</span>
            <span>{isEs ? "Defensor" : "Defender"}</span>
          </div>

          <div className="h-7 flex items-center justify-end min-w-55">
            {hoveredCell ? (
              <div className="text-xs font-mono bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800 text-zinc-200 flex items-center gap-1.5 shadow-sm">
                <span className="font-bold text-zinc-100">
                  {getTypeName(hoveredCell.atk)}
                </span>
                <span className="text-zinc-500">→</span>
                <span className="font-bold text-zinc-100">
                  {getTypeName(hoveredCell.def)}
                </span>
                <span className="text-zinc-600">:</span>
                <strong
                  className={`text-xs font-extrabold ${
                    TYPE_CHART[hoveredCell.atk][hoveredCell.def] === 2
                      ? "text-emerald-400"
                      : TYPE_CHART[hoveredCell.atk][hoveredCell.def] === 0.5
                        ? "text-amber-400"
                        : TYPE_CHART[hoveredCell.atk][hoveredCell.def] === 0
                          ? "text-zinc-400"
                          : "text-zinc-300"
                  }`}
                >
                  {TYPE_CHART[hoveredCell.atk][hoveredCell.def]}×
                </strong>
              </div>
            ) : (
              <span className="text-[11px] text-zinc-500 whitespace-nowrap hidden sm:inline select-none">
                {isEs
                  ? "Haz clic en un tipo o pasa el cursor"
                  : "Click a type or hover a cell"}
              </span>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950">
          <table className="border-collapse text-center w-full min-w-195">
            <thead>
              <tr className="border-b border-zinc-800/80">
                <th className="p-2 text-[10px] uppercase font-mono font-bold text-zinc-400 text-center sticky left-0 top-0 bg-zinc-950 z-30 w-27.5 min-w-27.5 border-r border-zinc-800/80">
                  {isEs ? "ATQ \\ DEF" : "ATK \\ DEF"}
                </th>
                {POKEMON_TYPES.map((def) => {
                  const isColFiltered = selectedType === def;
                  const isDimmed = selectedType !== null && !isColFiltered;

                  return (
                    <th
                      key={def}
                      className="p-1.5 sticky top-0 z-20 bg-zinc-950 border-r border-zinc-800/40 last:border-r-0"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedType(selectedType === def ? null : def)
                        }
                        title={getTypeName(def)}
                        className={`w-7 h-7 flex items-center justify-center mx-auto rounded-lg text-[9px] uppercase font-black cursor-pointer transition-all duration-300 ease-in-out ${
                          TYPE_COLORS[def]
                        } ${
                          isColFiltered
                            ? "ring-2 ring-white opacity-100 shadow-md z-10"
                            : isDimmed
                              ? "opacity-25"
                              : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {getTypeAbbr(def)}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {POKEMON_TYPES.map((atk) => {
                const isRowFiltered = selectedType === atk;
                const isDimmed = selectedType !== null && !isRowFiltered;

                return (
                  <tr
                    key={atk}
                    className={`group/row border-b border-zinc-800/40 last:border-b-0 transition-colors duration-100 hover:bg-zinc-900/60 ${
                      isRowFiltered ? "bg-zinc-900/40" : ""
                    }`}
                  >
                    {/* Botón tipo atacante (Sticky Left) */}
                    <td className="p-1.5 text-left sticky left-0 bg-zinc-950 z-10 border-r border-zinc-800/80 group-hover/row:bg-zinc-900/90 transition-colors duration-100">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedType(selectedType === atk ? null : atk)
                        }
                        className={`w-full text-center py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-300 ease-in-out truncate ${
                          TYPE_COLORS[atk]
                        } ${
                          isRowFiltered
                            ? "ring-1.5 ring-white opacity-100 shadow-md"
                            : isDimmed
                              ? "opacity-25"
                              : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {getTypeName(atk)}
                      </button>
                    </td>

                    {/* Celdas con valores */}
                    {POKEMON_TYPES.map((def) => {
                      const val = TYPE_CHART[atk][def];
                      const isCellActive =
                        selectedType === null ||
                        selectedType === atk ||
                        selectedType === def;
                      const isCellDimmed = !isCellActive;

                      return (
                        <td
                          key={def}
                          onMouseEnter={() => handleCellHover(atk, def)}
                          onMouseLeave={handleCellLeave}
                          className="p-1 border-r border-zinc-800/30 last:border-r-0 hover:bg-zinc-800/80 hover:ring-1 hover:ring-inset hover:ring-white/40 cursor-default transition-colors duration-75"
                        >
                          <div className="flex items-center justify-center">
                            {renderBadge(val, isCellDimmed)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
