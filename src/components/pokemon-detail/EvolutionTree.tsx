import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { EvolutionStage } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/constants/typeColors";

interface EvolutionTreeProps {
  currentPokemonName: string;
  chain: EvolutionStage | null;
}

// 1. Dictionary of official evolution items in English (Bulbapedia / Serebii standard)
const EVOLUTION_ITEMS_EN: Record<string, string> = {
  // Porygon family (with official hyphenation)
  upgrade: "Up-Grade",
  dubiousdisc: "Dubious Disc",

  // Trade with held item
  metalcoat: "Metal Coat",
  kingsrock: "King's Rock",
  dragonscale: "Dragon Scale",
  deepseatooth: "Deep Sea Tooth",
  deepseascale: "Deep Sea Scale",
  protector: "Protector",
  electirizer: "Electirizer",
  magmarizer: "Magmarizer",
  reapercloth: "Reaper Cloth",
  prismscale: "Prism Scale",
  whippeddream: "Whipped Dream",
  sachet: "Sachet",

  // Evolution Stones
  firestone: "Fire Stone",
  waterstone: "Water Stone",
  thunderstone: "Thunder Stone",
  leafstone: "Leaf Stone",
  moonstone: "Moon Stone",
  sunstone: "Sun Stone",
  shinystone: "Shiny Stone",
  duskstone: "Dusk Stone",
  dawnstone: "Dawn Stone",
  icestone: "Ice Stone",

  // Special Items
  ovalstone: "Oval Stone",
  razorclaw: "Razor Claw",
  razorfang: "Razor Fang",
  sweetapple: "Sweet Apple",
  tartapple: "Tart Apple",
  syrupyapple: "Syrupy Apple",
  crackedpot: "Cracked Pot",
  chippedpot: "Chipped Pot",
  unremarkableteacup: "Unremarkable Teacup",
  masterpieceteacup: "Masterpiece Teacup",
  auspiciousarmor: "Auspicious Armor",
  maliciousarmor: "Malicious Armor",
  scrollofdarkness: "Scroll of Darkness",
  scrollofwaters: "Scroll of Waters",
  blackaugurite: "Black Augurite",
  peatblock: "Peat Block",
};

// Clean and format any item name in standard English
function formatItemName(rawItem: string): string {
  if (!rawItem) return "";
  const normalizedKey = rawItem.toLowerCase().replace(/[\s_-]+/g, "");

  if (EVOLUTION_ITEMS_EN[normalizedKey]) {
    return EVOLUTION_ITEMS_EN[normalizedKey];
  }

  // Capitalization in case it's not found in the list
  return rawItem
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// 2. Special official names with hyphens or punctuation
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

function formatEvolutionPokemonName(name: string): string {
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
        POKEMON_SPECIAL_NAMES[base] || formatEvolutionPokemonName(base);
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      return `${formattedBase} (${formattedRegion})`;
    }
  }

  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 3. Safe link resolution
function getEvolutionHref(pokemonName: string): string {
  const REGIONAL_SUFFIXES = ["-alola", "-galar", "-hisui", "-paldea"];
  const lowerName = pokemonName.toLowerCase();

  const matchedSuffix = REGIONAL_SUFFIXES.find((suffix) =>
    lowerName.endsWith(suffix),
  );

  if (matchedSuffix) {
    const baseSpecies = pokemonName.slice(0, -matchedSuffix.length);
    return `/pokemon/${baseSpecies}?variant=${pokemonName}`;
  }

  return `/pokemon/${pokemonName}`;
}

// 4. Official English evolution requirements formatter
function EvolutionArrowWithDetails({
  details,
}: {
  details?: EvolutionStage["triggerDetails"];
}) {
  if (!details) return null;

  const requirements: string[] = [];

  // A. Main methods
  if (details.trigger === "trade") {
    requirements.push(
      details.heldItem
        ? `Trade holding ${formatItemName(details.heldItem)}`
        : "Trade",
    );
  } else if (details.trigger === "use-item" && details.item) {
    requirements.push(`Use ${formatItemName(details.item)}`);
  }

  // B. Level up and conditions
  if (details.minLevel) requirements.push(`Level ${details.minLevel}`);
  if (details.happiness) requirements.push(`Friendship ≥ ${details.happiness}`);
  if (details.heldItem && details.trigger !== "trade") {
    requirements.push(`Hold ${formatItemName(details.heldItem)}`);
  }

  // C. Moves and special conditions
  if (details.knownMove) {
    const moveFormatted = details.knownMove
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    requirements.push(`Learn ${moveFormatted}`);
  }

  if (details.otherCondition) {
    requirements.push(details.otherCondition);
  }

  if (details.timeOfDay) {
    const timeEn = details.timeOfDay === "day" ? "Day" : "Night";
    requirements.push(`(${timeEn})`);
  }

  if (details.gender === 1) requirements.push("(Female)");
  if (details.gender === 2) requirements.push("(Male)");
  if (details.partySpecies) {
    const partyName = formatEvolutionPokemonName(details.partySpecies);
    requirements.push(`With ${partyName} in party`);
  }
  if (details.needsOverworldRain) requirements.push("During Rain");

  if (details.relativeStats === 1) requirements.push("Attack > Defense");
  if (details.relativeStats === -1) requirements.push("Attack < Defense");
  if (details.relativeStats === 0) requirements.push("Attack = Defense");

  // Fallbacks
  if (requirements.length === 0 && details.item) {
    requirements.push(`Use ${formatItemName(details.item)}`);
  }
  if (requirements.length === 0) {
    requirements.push("Special Evolution");
  }

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
      <ArrowRight className="w-5 h-5 text-zinc-600 rotate-90 md:rotate-0" />

      <div className="flex flex-col gap-1 w-full items-center">
        {requirements.map((req, index) => (
          <span
            key={`${req}-${index}`}
            className="px-2.5 py-0.5 bg-zinc-800/80 border border-zinc-700/80 rounded-lg text-center text-[10px] font-semibold text-amber-300 whitespace-nowrap"
          >
            {req}
          </span>
        ))}
      </div>
    </div>
  );
}

function EvolutionBranch({
  node,
  currentPokemonName,
}: {
  node: EvolutionStage;
  currentPokemonName: string;
}) {
  const isCurrent =
    node.name.toLowerCase() === currentPokemonName.toLowerCase();

  const targetHref = getEvolutionHref(node.name);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Pokémon Card */}
      <Link
        href={targetHref}
        className={`group flex flex-col items-center p-3 rounded-2xl border transition-all ${
          isCurrent
            ? "bg-zinc-800/80 border-rose-500/80 shadow-lg shadow-rose-500/10"
            : "bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/40"
        }`}
      >
        <span className="text-[10px] font-mono text-zinc-500">
          #{String(node.id).padStart(4, "0")}
        </span>
        <div className="relative w-20 h-20 my-1">
          <Image
            src={node.image}
            alt={node.name}
            fill
            sizes="80px"
            className="object-contain group-hover:scale-110 transition-transform duration-200"
          />
        </div>
        <span className="font-bold text-xs text-zinc-200 mb-1 text-center">
          {formatEvolutionPokemonName(node.name)}
        </span>
        <div className="flex gap-1">
          {node.types.map((t) => (
            <span
              key={t}
              className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                TYPE_COLORS[t] || "bg-zinc-700 text-white"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </Link>

      {/* Evolution arrows and branches */}
      {node.evolvesTo.length > 0 && (
        <div className="flex flex-col gap-6 items-center">
          {node.evolvesTo.map((child) => (
            <div
              key={child.id}
              className="flex flex-col md:flex-row items-center gap-4"
            >
              <EvolutionArrowWithDetails details={child.triggerDetails} />
              <EvolutionBranch
                node={child}
                currentPokemonName={currentPokemonName}
              />
            </div>
          ))}
        </div>
      )}
      </div>
      );
      }

export default function EvolutionTree({
  currentPokemonName,
  chain,
}: EvolutionTreeProps) {
  if (!chain || chain.evolvesTo.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-2">
        <h3 className="text-base font-bold text-white tracking-tight">
          Evolution Chain
        </h3>
        <p className="text-xs text-zinc-400">
          This Pokémon does not have any known evolutions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Evolution Chain
        </h3>
        <p className="text-xs text-zinc-400">
          Methods and conditions for evolution.
        </p>
      </div>

      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-fit flex justify-center">
          <EvolutionBranch
            node={chain}
            currentPokemonName={currentPokemonName}
          />
        </div>
      </div>
    </div>
  );
}
