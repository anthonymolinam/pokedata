"use client";

import { motion } from "framer-motion";
import { PokemonDetail, PokemonVariety } from "@/lib/pokeapi";
import { TYPE_COLORS, TYPE_GLOWS } from "@/constants/typeColors";
import PokemonArtworkViewer from "./PokemonArtworkViewer";

interface PokemonHeroSectionProps {
  pokemon: PokemonDetail;
  selectedVariant: PokemonVariety | null;
  onVariantChange: (variant: PokemonVariety) => void;
}

const POKEMON_SPECIAL_NAMES: Record<string, string> = {
  "ho-oh": "Ho-Oh",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  "porygon-z": "Porygon-Z",
  "wo-chien": "Wo-Chien",
  "chien-pao": "Chien-Pao",
  "ting-lu": "Ting-Lu",
  "chi-yu": "Chi-Yu",
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mr-rime": "Mr. Rime",
  "type-null": "Type: Null",
  "tapu-koko": "Tapu Koko",
  "tapu-lele": "Tapu Lele",
  "tapu-bulu": "Tapu Bulu",
  "tapu-fini": "Tapu Fini",
  "great-tusk": "Great Tusk",
  "scream-tail": "Scream Tail",
  "brute-bonnet": "Brute Bonnet",
  "flutter-mane": "Flutter Mane",
  "slither-wing": "Slither Wing",
  "sandy-shocks": "Sandy Shocks",
  "iron-treads": "Iron Treads",
  "iron-bundle": "Iron Bundle",
  "iron-hands": "Iron Hands",
  "iron-jugulis": "Iron Jugulis",
  "iron-moth": "Iron Moth",
  "iron-thorns": "Iron Thorns",
  "roaring-moon": "Roaring Moon",
  "iron-valiant": "Iron Valiant",
  "walking-wake": "Walking Wake",
  "iron-leaves": "Iron Leaves",
  "gouging-fire": "Gouging Fire",
  "raging-bolt": "Raging Bolt",
  "iron-boulder": "Iron Boulder",
  "iron-crown": "Iron Crown",
};

const STAT_LABELS_EN: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function formatPokemonHeroName(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase();

  if (POKEMON_SPECIAL_NAMES[lower]) {
    return POKEMON_SPECIAL_NAMES[lower];
  }

  const REGIONAL_SUFFIXES = ["-alola", "-galar", "-hisui", "-paldea"];
  for (const suffix of REGIONAL_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      const base = lower.slice(0, -suffix.length);
      const region = suffix.replace("-", "");
      const formattedBase =
        POKEMON_SPECIAL_NAMES[base] || formatPokemonHeroName(base);
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      return `${formattedBase} (${formattedRegion})`;
    }
  }

  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PokemonHeroSection({
  pokemon,
  selectedVariant,
  onVariantChange,
}: PokemonHeroSectionProps) {
  const activeTypes = selectedVariant ? selectedVariant.types : pokemon.types;
  const activeStats = selectedVariant ? selectedVariant.stats : pokemon.stats;
  const activeHeight = selectedVariant
    ? selectedVariant.height
    : pokemon.height;
  const activeWeight = selectedVariant
    ? selectedVariant.weight
    : pokemon.weight;
  const activeImage = selectedVariant ? selectedVariant.image : pokemon.image;
  const activeShinyImage = selectedVariant
    ? selectedVariant.shinyImage
    : pokemon.shinyImage;
  const activeName = selectedVariant ? selectedVariant.name : pokemon.name;

  const primaryType = activeTypes[0] || "normal";
  const glowGradient =
    TYPE_GLOWS[primaryType] || "from-zinc-800/20 to-transparent";

  return (
    <div className="relative bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
      {/* Glow */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full bg-radial ${glowGradient} blur-3xl pointer-events-none transition-colors duration-500`}
      />

      {/* Forms & Variants selector */}
      {pokemon.varieties && pokemon.varieties.length > 1 && (
        <div className="relative z-10 flex flex-wrap items-center gap-2 pb-4 border-b border-zinc-800/80">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">
            Forms & Variants:
          </span>
          {pokemon.varieties.map((variant) => {
            const isSelected =
              (selectedVariant?.name ?? pokemon.name) === variant.name;
            return (
              <button
                key={variant.name}
                type="button"
                onClick={() => onVariantChange(variant)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-105"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {variant.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side: Artwork viewer */}
        <div className="relative flex flex-col items-center justify-center p-6 bg-zinc-950/40 rounded-2xl border border-zinc-800/50">
          <span className="text-zinc-500 font-mono text-sm self-start">
            #{String(pokemon.id).padStart(4, "0")}
          </span>

          <PokemonArtworkViewer
            name={activeName}
            defaultImage={activeImage}
            shinyImage={activeShinyImage}
          />

          <h1 className="text-3xl font-black mb-3 text-white text-center tracking-wide">
            {formatPokemonHeroName(activeName)}
          </h1>

          <div className="flex gap-2">
            {activeTypes.map((t) => (
              <span
                key={t}
                className={`text-xs uppercase font-bold px-3 py-1 rounded-full transition-colors ${
                  TYPE_COLORS[t] || "bg-zinc-700 text-white"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right side: Vitals & Base Stats */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/30 text-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">
                Height
              </p>
              <p className="font-semibold text-zinc-200">{activeHeight} m</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">
                Weight
              </p>
              <p className="font-semibold text-zinc-200">{activeWeight} kg</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              Base Stats
            </h3>
            <div className="space-y-2.5">
              {activeStats.map((stat) => {
                const percentage = Math.min((stat.value / 255) * 100, 100);
                const label =
                  STAT_LABELS_EN[stat.name.toLowerCase()] ||
                  stat.name.replace("-", " ");

                return (
                  <div key={stat.name} className="text-xs space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="capitalize text-zinc-400">{label}</span>
                      <span className="font-bold text-zinc-200">
                        {stat.value}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                      <motion.div
                        key={`${activeName}-${stat.name}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
