"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { EvolutionStage } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/constants/typeColors";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";

interface EvolutionTreeProps {
  currentPokemonName: string;
  chain: EvolutionStage | null;
  locale?: string;
}

// 1. Diccionario de objetos evolutivos en inglés
const EVOLUTION_ITEMS_EN: Record<string, string> = {
  upgrade: "Up-Grade",
  dubiousdisc: "Dubious Disc",
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

// 2. Diccionario de objetos evolutivos en español
const EVOLUTION_ITEMS_ES: Record<string, string> = {
  upgrade: "Mejora",
  dubiousdisc: "Disco Extraño",
  metalcoat: "Revestimiento Metálico",
  kingsrock: "Roca del Rey",
  dragonscale: "Escama Dragón",
  deepseatooth: "Diente Marino",
  deepseascale: "Escama Marina",
  protector: "Protector",
  electirizer: "Electrizador",
  magmarizer: "Magmatizador",
  reapercloth: "Tela Terrible",
  prismscale: "Escama Bella",
  whippeddream: "Dulce de Nata",
  sachet: "Saquito Fragante",
  firestone: "Piedra Fuego",
  waterstone: "Piedra Agua",
  thunderstone: "Piedra Trueno",
  leafstone: "Piedra Hoja",
  moonstone: "Piedra Lunar",
  sunstone: "Piedra Solar",
  shinystone: "Piedra Día",
  duskstone: "Piedra Noche",
  dawnstone: "Piedra Alba",
  icestone: "Piedra Hielo",
  ovalstone: "Piedra Oval",
  razorclaw: "Garra Afilada",
  razorfang: "Colmillo Agudo",
  sweetapple: "Manzana Dulce",
  tartapple: "Manzana Ácida",
  syrupyapple: "Manzana Melosa",
  crackedpot: "Tetera Agrietada",
  chippedpot: "Tetera Rota",
  unremarkableteacup: "Cuenco Mediocre",
  masterpieceteacup: "Cuenco Exquisito",
  auspiciousarmor: "Armadura Auspiciosa",
  maliciousarmor: "Armadura Maldita",
  scrollofdarkness: "Manuscrito Sombrío",
  scrollofwaters: "Manuscrito Aguas",
  blackaugurite: "Mineral Negro",
  peatblock: "Bloque de Turba",
};

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

function formatItemName(rawItem: string, isEs: boolean): string {
  if (!rawItem) return "";
  const normalizedKey = rawItem.toLowerCase().replace(/[\s_-]+/g, "");

  if (isEs && EVOLUTION_ITEMS_ES[normalizedKey]) {
    return EVOLUTION_ITEMS_ES[normalizedKey];
  }

  if (EVOLUTION_ITEMS_EN[normalizedKey]) {
    return EVOLUTION_ITEMS_EN[normalizedKey];
  }

  return rawItem
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

function formatEvolutionPokemonName(name: string, locale: string): string {
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
        POKEMON_SPECIAL_NAMES[base] || formatEvolutionPokemonName(base, locale);
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      return `${formattedBase} (${formattedRegion})`;
    }
  }

  const DEFAULT_FORM_SUFFIXES = [
    "-zero",
    "-disguised",
    "-shield",
    "-solo",
    "-red-meteor",
  ];
  for (const suffix of DEFAULT_FORM_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      const base = lower.slice(0, -suffix.length);
      return formatEvolutionPokemonName(base, locale);
    }
  }

  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getEvolutionHref(node: EvolutionStage, locale: string): string {
  const resolveSlug = (rawName: string) => {
    const clean = rawName.toLowerCase();
    return locale === "es" && CANONICAL_TO_SPANISH[clean]
      ? CANONICAL_TO_SPANISH[clean]
      : clean;
  };

  if (node.speciesName) {
    return `/${locale}/pokemon/${resolveSlug(node.speciesName)}`;
  }

  const pokemonName = node.name.toLowerCase();

  const REGIONAL_SUFFIXES = ["-alola", "-galar", "-hisui", "-paldea"];
  const matchedSuffix = REGIONAL_SUFFIXES.find((suffix) =>
    pokemonName.endsWith(suffix),
  );

  if (matchedSuffix) {
    const baseSpecies = pokemonName.slice(0, -matchedSuffix.length);
    return `/${locale}/pokemon/${resolveSlug(baseSpecies)}?variant=${pokemonName}`;
  }

  const DEFAULT_FORM_SUFFIXES = [
    "-zero",
    "-disguised",
    "-shield",
    "-solo",
    "-red-meteor",
    "-full-belly",
    "-standard",
  ];
  for (const suffix of DEFAULT_FORM_SUFFIXES) {
    if (pokemonName.endsWith(suffix)) {
      const baseSpecies = pokemonName.slice(0, -suffix.length);
      return `/${locale}/pokemon/${resolveSlug(baseSpecies)}`;
    }
  }

  return `/${locale}/pokemon/${resolveSlug(pokemonName)}`;
}

function EvolutionArrowWithDetails({
  details,
  locale,
}: {
  details?: EvolutionStage["triggerDetails"];
  locale: string;
}) {
  if (!details) return null;
  const isEs = locale === "es";

  const requirements: string[] = [];

  // A. Métodos principales
  if (details.trigger === "trade") {
    if (details.heldItem) {
      const itemName = formatItemName(details.heldItem, isEs);
      requirements.push(
        isEs
          ? `Intercambio equipando ${itemName}`
          : `Trade holding ${itemName}`,
      );
    } else {
      requirements.push(isEs ? "Intercambio" : "Trade");
    }
  } else if (details.trigger === "use-item" && details.item) {
    const itemName = formatItemName(details.item, isEs);
    requirements.push(isEs ? `Usar ${itemName}` : `Use ${itemName}`);
  }

  // B. Subida de nivel, amistad y requisitos con horario integrado
  const timeSuffix = details.timeOfDay
    ? ` (${isEs ? (details.timeOfDay === "day" ? "Día" : "Noche") : details.timeOfDay === "day" ? "Day" : "Night"})`
    : "";

  let hasHandledTime = false;

  if (details.minLevel) {
    requirements.push(
      `${isEs ? `Nivel ${details.minLevel}` : `Level ${details.minLevel}`}${timeSuffix}`,
    );
    if (details.timeOfDay) hasHandledTime = true;
  } else if (details.happiness) {
    requirements.push(
      `${isEs ? `Amistad ≥ ${details.happiness}` : `Friendship ≥ ${details.happiness}`}${timeSuffix}`,
    );
    if (details.timeOfDay) hasHandledTime = true;
  }

  if (details.heldItem && details.trigger !== "trade") {
    const itemName = formatItemName(details.heldItem, isEs);
    requirements.push(
      `${isEs ? `Equipar ${itemName}` : `Hold ${itemName}`}${!hasHandledTime ? timeSuffix : ""}`,
    );
    if (details.timeOfDay) hasHandledTime = true;
  }

  if (details.timeOfDay && !hasHandledTime) {
    requirements.push(
      isEs
        ? details.timeOfDay === "day"
          ? "De día"
          : "De noche"
        : details.timeOfDay === "day"
          ? "During day"
          : "During night",
    );
  }

  // C. Movimientos y condiciones especiales
  if (details.knownMove) {
    const moveFormatted = details.knownMove
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    requirements.push(
      isEs ? `Aprender ${moveFormatted}` : `Learn ${moveFormatted}`,
    );
  }

  if (details.otherCondition) {
    requirements.push(details.otherCondition);
  }

  if (details.gender === 1) requirements.push(isEs ? "(Hembra)" : "(Female)");
  if (details.gender === 2) requirements.push(isEs ? "(Macho)" : "(Male)");

  if (details.partySpecies) {
    const partyName = formatEvolutionPokemonName(details.partySpecies, locale);
    requirements.push(
      isEs ? `Con ${partyName} en equipo` : `With ${partyName} in party`,
    );
  }
  if (details.needsOverworldRain) {
    requirements.push(isEs ? "Durante la lluvia" : "During Rain");
  }

  if (details.relativeStats === 1)
    requirements.push(isEs ? "Ataque > Defensa" : "Attack > Defense");
  if (details.relativeStats === -1)
    requirements.push(isEs ? "Ataque < Defensa" : "Attack < Defense");
  if (details.relativeStats === 0)
    requirements.push(isEs ? "Ataque = Defensa" : "Attack = Defense");

  // Fallbacks
  if (requirements.length === 0 && details.item) {
    const itemName = formatItemName(details.item, isEs);
    requirements.push(isEs ? `Usar ${itemName}` : `Use ${itemName}`);
  }
  if (requirements.length === 0) {
    requirements.push(isEs ? "Evolución especial" : "Special Evolution");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 w-44 shrink-0">
      {/* Requisitos arriba */}
      <div className="flex flex-col gap-1 w-full items-center justify-center">
        {requirements.map((req, index) => (
          <span
            key={`${req}-${index}`}
            className="w-full max-w-36.25 px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/80 rounded-lg text-center text-[10px] font-semibold text-amber-300 leading-snug whitespace-normal text-balance"
          >
            {req}
          </span>
        ))}
      </div>

      {/* Flecha debajo centrada */}
      <ArrowRight className="w-5 h-5 text-zinc-500 rotate-90 md:rotate-0 shrink-0" />
    </div>
  );
}

function EvolutionBranch({
  node,
  currentPokemonName,
  locale,
}: {
  node: EvolutionStage;
  currentPokemonName: string;
  locale: string;
}) {
  const isEs = locale === "es";
  const currentLower = currentPokemonName.toLowerCase();
  const isCurrent =
    node.name.toLowerCase() === currentLower ||
    (node.speciesName && node.speciesName.toLowerCase() === currentLower) ||
    node.name.toLowerCase().startsWith(`${currentLower}-`);

  const targetHref = getEvolutionHref(node, locale);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Tarjeta del Pokémon */}
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
          {formatEvolutionPokemonName(node.speciesName || node.name, locale)}
        </span>
        <div className="flex gap-1">
          {node.types.map((t) => {
            const rawType = t.toLowerCase();
            const displayType =
              isEs && TYPE_TRANSLATIONS_ES[rawType]
                ? TYPE_TRANSLATIONS_ES[rawType]
                : t;

            return (
              <span
                key={t}
                className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                  TYPE_COLORS[rawType] || "bg-zinc-700 text-white"
                }`}
              >
                {displayType}
              </span>
            );
          })}
        </div>
      </Link>

      {/* Flechas y ramas evolutivas */}
      {node.evolvesTo.length > 0 && (
        <div className="flex flex-col gap-6 items-center justify-center">
          {node.evolvesTo.map((child) => (
            <div
              key={child.id}
              className="flex flex-col md:flex-row items-center justify-start gap-4 w-full"
            >
              <EvolutionArrowWithDetails
                details={child.triggerDetails}
                locale={locale}
              />
              <EvolutionBranch
                node={child}
                currentPokemonName={currentPokemonName}
                locale={locale}
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
  locale = "es",
}: EvolutionTreeProps) {
  const isEs = locale === "es";

  if (!chain || chain.evolvesTo.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-2">
        <h3 className="text-base font-bold text-white tracking-tight">
          {isEs ? "Cadena Evolutiva" : "Evolution Chain"}
        </h3>
        <p className="text-xs text-zinc-400">
          {isEs
            ? "Este Pokémon no tiene evoluciones conocidas."
            : "This Pokémon does not have any known evolutions."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {isEs ? "Cadena Evolutiva" : "Evolution Chain"}
        </h3>
        <p className="text-xs text-zinc-400">
          {isEs
            ? "Métodos y condiciones para evolucionar."
            : "Methods and conditions for evolution."}
        </p>
      </div>

      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-fit flex justify-center">
          <EvolutionBranch
            node={chain}
            currentPokemonName={currentPokemonName}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
