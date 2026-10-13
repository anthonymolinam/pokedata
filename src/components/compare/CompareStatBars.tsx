"use client";

import { motion } from "framer-motion";
import { PokemonDetail } from "@/lib/pokeapi";
import { getDictionary } from "@/constants/translations";

interface CompareStatBarsProps {
  pokemon1: PokemonDetail;
  pokemon2: PokemonDetail;
  locale?: string;
}

const STAT_CONFIG = [
  { key: "hp", dictKey: "hp" as const },
  { key: "attack", dictKey: "attack" as const },
  { key: "defense", dictKey: "defense" as const },
  { key: "special-attack", dictKey: "specialAttack" as const },
  { key: "special-defense", dictKey: "specialDefense" as const },
  { key: "speed", dictKey: "speed" as const },
];

export default function CompareStatBars({
  pokemon1,
  pokemon2,
  locale = "es",
}: CompareStatBarsProps) {
  const dict = getDictionary(locale);

  const p1Map = new Map(
    pokemon1.stats.map((s) => [s.name.toLowerCase(), s.value]),
  );
  const p2Map = new Map(
    pokemon2.stats.map((s) => [s.name.toLowerCase(), s.value]),
  );

  const p1Total = pokemon1.stats.reduce((acc, s) => acc + s.value, 0);
  const p2Total = pokemon2.stats.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
          {dict.common.baseStats}
        </h3>
        <span className="text-[11px] font-mono text-zinc-500">
          {dict.compare.maxRef}
        </span>
      </div>

      <div className="space-y-4">
        {STAT_CONFIG.map(({ key, dictKey }) => {
          const val1 = p1Map.get(key) || 0;
          const val2 = p2Map.get(key) || 0;
          const diff = val1 - val2;

          const p1Wins = diff > 0;
          const p2Wins = diff < 0;

          const pct1 = Math.min((val1 / 255) * 100, 100);
          const pct2 = Math.min((val2 / 255) * 100, 100);

          const label = dict.stats[dictKey];

          return (
            <div
              key={key}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs"
            >
              {/* Pokémon 1 */}
              <div className="flex items-center justify-end gap-2">
                {p1Wins && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                    +{Math.abs(diff)}
                  </span>
                )}
                <span
                  className={`font-mono font-bold w-7 text-right shrink-0 ${
                    p1Wins ? "text-emerald-400" : "text-zinc-200"
                  }`}
                >
                  {val1}
                </span>
                <div className="w-full max-w-30 sm:max-w-45 h-2 bg-zinc-800/80 rounded-full overflow-hidden flex justify-end p-0.5">
                  <motion.div
                    key={`${pokemon1.name}-${key}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct1}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      p1Wins
                        ? "bg-linear-to-r from-teal-400 to-emerald-500"
                        : "bg-zinc-600"
                    }`}
                  />
                </div>
              </div>

              {/* Etiqueta Central */}
              <div className="w-20 text-center font-bold text-zinc-400 uppercase tracking-wider text-[11px] select-none">
                {label}
              </div>

              {/* Pokémon 2 */}
              <div className="flex items-center justify-start gap-2">
                <div className="w-full max-w-30 sm:max-w-45 h-2 bg-zinc-800/80 rounded-full overflow-hidden flex justify-start p-0.5">
                  <motion.div
                    key={`${pokemon2.name}-${key}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct2}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      p2Wins
                        ? "bg-linear-to-r from-emerald-500 to-teal-400"
                        : "bg-zinc-600"
                    }`}
                  />
                </div>
                <span
                  className={`font-mono font-bold w-7 text-left shrink-0 ${
                    p2Wins ? "text-emerald-400" : "text-zinc-200"
                  }`}
                >
                  {val2}
                </span>
                {p2Wins && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                    +{Math.abs(diff)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BST */}
      <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center justify-end gap-2">
          {p1Total > p2Total && (
            <span className="text-xs font-mono font-bold text-emerald-400">
              +{p1Total - p2Total}
            </span>
          )}
          <span
            className={`text-base font-mono font-black ${
              p1Total > p2Total ? "text-emerald-400" : "text-zinc-200"
            }`}
          >
            {p1Total}
          </span>
        </div>

        <div className="w-20 text-center font-bold text-zinc-400 uppercase tracking-wider text-[11px] select-none">
          {dict.stats.total}
        </div>

        <div className="flex items-center justify-start gap-2">
          <span
            className={`text-base font-mono font-black ${
              p2Total > p1Total ? "text-emerald-400" : "text-zinc-200"
            }`}
          >
            {p2Total}
          </span>
          {p2Total > p1Total && (
            <span className="text-xs font-mono font-bold text-emerald-400">
              +{p2Total - p1Total}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
