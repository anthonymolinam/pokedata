"use client";

import { motion } from "framer-motion";
import { PokemonDetail, PokemonVariety } from "@/lib/pokeapi";
import { TYPE_COLORS, TYPE_GLOWS } from "@/constants/typeColors";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import PokemonArtworkViewer from "./PokemonArtworkViewer";

interface PokemonHeroSectionProps {
  pokemon: PokemonDetail;
  selectedVariant: PokemonVariety | null;
  onVariantChange: (variant: PokemonVariety) => void;
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

const STAT_LABELS_ES: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Atq. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

function formatPokemonHeroName(name: string, locale: string): string {
  if (!name) return "";
  const lower = name.toLowerCase();

  if (locale === "es" && CANONICAL_TO_SPANISH[lower]) {
    const esName = CANONICAL_TO_SPANISH[lower];
    return esName
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  if (POKEMON_SPECIAL_NAMES[lower]) {
    return POKEMON_SPECIAL_NAMES[lower];
  }

  const REGIONAL_SUFFIXES = ["-alola", "-galar", "-hisui", "-paldea"];
  for (const suffix of REGIONAL_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      const base = lower.slice(0, -suffix.length);
      const region = suffix.replace("-", "");
      const formattedBase =
        POKEMON_SPECIAL_NAMES[base] || formatPokemonHeroName(base, locale);
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      return `${formattedBase} (${formattedRegion})`;
    }
  }

  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatVariantLabel(label: string, isEs: boolean): string {
  if (!label) return "";
  if (!isEs) return label;

  const lower = label.trim().toLowerCase();

  const exactMatches: Record<string, string> = {
    default: "Por defecto",
    base: "Forma base",
    "base form": "Forma base",
    "base forme": "Forma base",
    standard: "Estándar",
    normal: "Normal",
    "alolan form": "Forma de Alola",
    "alola form": "Forma de Alola",
    alola: "Alola",
    "galarian form": "Forma de Galar",
    "galar form": "Forma de Galar",
    galar: "Galar",
    "hisuian form": "Forma de Hisui",
    "hisui form": "Forma de Hisui",
    hisui: "Hisui",
    "paldean form": "Forma de Paldea",
    "paldea form": "Forma de Paldea",
    paldea: "Paldea",
    origin: "Forma Origen",
    "origin form": "Forma Origen",
    "origin forme": "Forma Origen",
    altered: "Forma Modificada",
    "altered form": "Forma Modificada",
    "altered forme": "Forma Modificada",
    therian: "Forma Tótem",
    "therian form": "Forma Tótem",
    "therian forme": "Forma Tótem",
    incarnate: "Forma Avatar",
    "incarnate form": "Forma Avatar",
    "incarnate forme": "Forma Avatar",
    gmax: "Gigamax",
    gigantamax: "Gigamax",
    mega: "Mega",
    "mega x": "Mega X",
    "mega y": "Mega Y",
    hero: "Guerrero avezado",
    "hero form": "Guerrero avezado",
    "hero of many battles": "Guerrero avezado",
    crowned: "Forma Suprema",
    "crowned sword": "Espada suprema",
    "crowned shield": "Escudo supremo",
    blade: "Forma Filo",
    "blade forme": "Forma Filo",
    shield: "Forma Escudo",
    "shield forme": "Forma Escudo",
    attack: "Forma Ataque",
    "attack forme": "Forma Ataque",
    defense: "Forma Defensa",
    "defense forme": "Forma Defensa",
    speed: "Forma Velocidad",
    "speed forme": "Forma Velocidad",
  };

  if (exactMatches[lower]) {
    return exactMatches[lower];
  }

  // Si termina en "Form" o "Forme" (ej: "X Form"), lo invierte a "Forma X"
  const formMatch = label.match(/^(.*?)\s+(form|forme)$/i);
  if (formMatch) {
    const modifier = formMatch[1];
    const modLower = modifier.toLowerCase();

    if (modLower === "base") return "Forma base";
    if (modLower === "alolan" || modLower === "alola") return "Forma de Alola";
    if (modLower === "galarian" || modLower === "galar")
      return "Forma de Galar";
    if (modLower === "hisuian" || modLower === "hisui") return "Forma de Hisui";
    if (modLower === "paldean" || modLower === "paldea")
      return "Forma de Paldea";

    return `Forma ${modifier}`;
  }

  return label;
}

export default function PokemonHeroSection({
  pokemon,
  selectedVariant,
  onVariantChange,
  locale = "es",
}: PokemonHeroSectionProps) {
  const isEs = locale === "es";

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

  const primaryType = activeTypes[0]?.toLowerCase() || "normal";
  const glowGradient =
    TYPE_GLOWS[primaryType] || "from-zinc-800/20 to-transparent";

  const statLabels = isEs ? STAT_LABELS_ES : STAT_LABELS_EN;

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
            {isEs ? "Formas y Variantes:" : "Forms & Variants:"}
          </span>
          {pokemon.varieties.map((variant) => {
            const isSelected =
              (selectedVariant?.name ?? pokemon.name) === variant.name;
            return (
              <button
                key={variant.name}
                type="button"
                onClick={() => onVariantChange(variant)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-rose-500 border-transparent text-white shadow-md shadow-rose-500/20"
                    : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {formatVariantLabel(variant.label, isEs)}
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
            {formatPokemonHeroName(activeName, locale)}
          </h1>

          <div className="flex gap-2">
            {activeTypes.map((t) => {
              const lowerType = t.toLowerCase();
              const displayType =
                isEs && TYPE_TRANSLATIONS_ES[lowerType]
                  ? TYPE_TRANSLATIONS_ES[lowerType]
                  : t;

              return (
                <span
                  key={t}
                  className={`text-xs uppercase font-bold px-3 py-1 rounded-full transition-colors ${
                    TYPE_COLORS[lowerType] || "bg-zinc-700 text-white"
                  }`}
                >
                  {displayType}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right side: Vitals & Base Stats */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/30 text-sm">
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">
                {isEs ? "Altura" : "Height"}
              </p>
              <p className="font-semibold text-zinc-200">{activeHeight} m</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">
                {isEs ? "Peso" : "Weight"}
              </p>
              <p className="font-semibold text-zinc-200">{activeWeight} kg</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              {isEs ? "Estadísticas Base" : "Base Stats"}
            </h3>
            <div className="space-y-2.5">
              {activeStats.map((stat) => {
                const percentage = Math.min((stat.value / 255) * 100, 100);
                const label =
                  statLabels[stat.name.toLowerCase()] ||
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
