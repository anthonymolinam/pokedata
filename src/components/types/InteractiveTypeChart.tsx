"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { POKEMON_TYPES, PokemonType, TYPE_CHART } from "@/constants/typeChart";
import { TYPE_COLORS } from "@/constants/typeColors";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

export default function InteractiveTypeChart() {
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    atk: PokemonType;
    def: PokemonType;
  } | null>(null);

  const renderCellBadge = (val: number, isDimmed: boolean) => {
    if (val === 2) {
      return (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/40 transition-opacity ${
            isDimmed ? "opacity-20" : "opacity-100"
          }`}
        >
          2×
        </span>
      );
    }
    if (val === 0.5) {
      return (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 font-extrabold text-[10px] border border-amber-500/40 transition-opacity ${
            isDimmed ? "opacity-20" : "opacity-100"
          }`}
        >
          ½
        </span>
      );
    }
    if (val === 0) {
      return (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-md bg-zinc-800 text-zinc-500 font-extrabold text-[11px] border border-zinc-700 transition-opacity ${
            isDimmed ? "opacity-15" : "opacity-100"
          }`}
        >
          0
        </span>
      );
    }
    return (
      <span
        className={`text-zinc-600 text-xs transition-opacity leading-none select-none ${
          isDimmed ? "opacity-15" : "opacity-100"
        }`}
      >
        ·
      </span>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col justify-start gap-3 min-h-0"
    >
      {/* 1. Type Selector & Matchup Summary */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">Inspect Type:</span>
          {selectedType && (
            <button
              onClick={() => setSelectedType(null)}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
            >
              Clear filter ({selectedType})
            </button>
          )}
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          {POKEMON_TYPES.map((t) => {
            const isSelected = selectedType === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(isSelected ? null : t)}
                className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  TYPE_COLORS[t] || "bg-zinc-700 text-white"
                } ${
                  isSelected
                    ? "ring-2 ring-white scale-105 opacity-100 shadow-md brightness-125 z-10"
                    : selectedType
                      ? "opacity-35 hover:opacity-90"
                      : "opacity-80 hover:opacity-100"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Offensive / Defensive Summary */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-2.5 border-t border-zinc-800/70 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Offensive */}
                <div className="bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/40 flex items-center gap-2.5 overflow-hidden">
                  <span className="text-emerald-400 font-bold uppercase whitespace-nowrap text-[11px] shrink-0">
                    Attacking (2×):
                  </span>
                  <div className="flex flex-wrap gap-1 items-center">
                    {POKEMON_TYPES.filter(
                      (def) => TYPE_CHART[selectedType][def] === 2,
                    ).map((def) => (
                      <span
                        key={def}
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold leading-tight ${TYPE_COLORS[def]}`}
                      >
                        {def}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Defensive */}
                <div className="bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/40 flex items-center gap-2.5 overflow-hidden">
                  <span className="text-rose-400 font-bold uppercase whitespace-nowrap text-[11px] shrink-0">
                    Weak to (2×):
                  </span>
                  <div className="flex flex-wrap gap-1 items-center">
                    {POKEMON_TYPES.filter(
                      (atk) => TYPE_CHART[atk][selectedType] === 2,
                    ).map((atk) => (
                      <span
                        key={atk}
                        className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold leading-tight ${TYPE_COLORS[atk]}`}
                      >
                        {atk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. 18x18 Matchup Matrix */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-start">
        {/* Header bar with fixed height to prevent layout shifts */}
        <div className="h-7 flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/60 mb-1">
          <span className="font-mono text-[11px] select-none whitespace-nowrap">
            Row = Attacker | Column = Defender
          </span>

          <div className="h-6 flex items-center justify-end min-w-[210px]">
            {hoveredCell ? (
              <div className="text-xs font-mono bg-zinc-950 px-2.5 py-0.5 rounded-lg border border-zinc-800 text-zinc-300 flex items-center gap-1">
                <span className="capitalize">{hoveredCell.atk}</span>
                <span className="text-zinc-600">→</span>
                <span className="capitalize">{hoveredCell.def}</span>
                <span className="text-zinc-600">:</span>
                <strong className="text-rose-400 text-sm font-bold">
                  {TYPE_CHART[hoveredCell.atk][hoveredCell.def]}×
                </strong>
              </div>
            ) : (
              <span className="text-[11px] text-zinc-500 whitespace-nowrap hidden sm:inline select-none">
                Hover over a cell to view damage
              </span>
            )}
          </div>
        </div>

        {/* Matrix table */}
        <div className="overflow-x-auto pb-1">
          <table className="border-collapse text-center w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="p-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-bold text-left sticky left-0 top-0 bg-zinc-900 z-30 min-w-[85px]">
                  ATK \ DEF
                </th>
                {POKEMON_TYPES.map((def) => {
                  const isColActive = selectedType === def;
                  const isColDimmed = selectedType !== null && !isColActive;

                  return (
                    <th
                      key={def}
                      className="p-1 sticky top-0 bg-zinc-900 z-20 min-w-[32px]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedType(selectedType === def ? null : def)
                        }
                        title={def}
                        className={`inline-block w-6 h-6 leading-6 rounded-md text-[9px] uppercase font-black cursor-pointer transition-all ${
                          TYPE_COLORS[def]
                        } ${
                          isColActive
                            ? "ring-2 ring-white scale-110 opacity-100 shadow-lg z-10"
                            : isColDimmed
                              ? "opacity-25"
                              : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {def.slice(0, 3)}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {POKEMON_TYPES.map((atk) => {
                const isRowActive = selectedType === atk;
                const isRowDimmed = selectedType !== null && !isRowActive;

                return (
                  <tr
                    key={atk}
                    className={`border-t border-zinc-800/40 transition-colors ${
                      isRowActive ? "bg-zinc-800/40" : "hover:bg-zinc-800/20"
                    }`}
                  >
                    <td className="p-1 text-left sticky left-0 bg-zinc-900 z-10">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedType(selectedType === atk ? null : atk)
                        }
                        className={`inline-block w-full text-left px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all truncate ${
                          TYPE_COLORS[atk]
                        } ${
                          isRowActive
                            ? "ring-1 ring-white opacity-100 shadow-md"
                            : isRowDimmed
                              ? "opacity-25"
                              : "opacity-85 hover:opacity-100"
                        }`}
                      >
                        {atk}
                      </button>
                    </td>

                    {POKEMON_TYPES.map((def) => {
                      const val = TYPE_CHART[atk][def];
                      const isColActive = selectedType === def;
                      const isCellActive =
                        selectedType === null || isRowActive || isColActive;
                      const isDimmed = !isCellActive;

                      return (
                        <td
                          key={def}
                          onMouseEnter={() => setHoveredCell({ atk, def })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`p-1 transition-colors ${
                            isColActive && !isRowActive ? "bg-zinc-800/20" : ""
                          } ${
                            isRowActive && isColActive ? "bg-zinc-700/40" : ""
                          }`}
                        >
                          {renderCellBadge(val, isDimmed)}
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
