"use client";

import { EvolutionStage } from "@/lib/pokeapi";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface EvolutionTreeProps {
  currentPokemonName: string;
  chain: EvolutionStage | null;
  locale: Locale;
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

// 3. Fallbacks de condiciones especiales de especies (Gen 8/9 y Leyendas Arceus)
const SPECIAL_EVOLUTION_OVERRIDES: Record<string, { es: string; en: string }> =
  {
    pawmot: {
      es: "1000 pasos en modo 'Enviar Pokémon'",
      en: "Walk 1,000 steps in 'Let's Go'",
    },
    brambleghast: {
      es: "1000 pasos en modo 'Enviar Pokémon'",
      en: "Walk 1,000 steps in 'Let's Go'",
    },
    rabsca: {
      es: "1000 pasos en modo 'Enviar Pokémon'",
      en: "Walk 1,000 steps in 'Let's Go'",
    },
    gholdengo: {
      es: "Subir de nivel con 999 Monedas de Gimmighoul",
      en: "Level up with 999 Gimmighoul Coins",
    },
    maushold: {
      es: "Nivel 25 (en combate)",
      en: "Level 25 (in battle)",
    },
    "urshifu-single-strike": {
      es: "Torre de las Sombras",
      en: "Tower of Darkness",
    },
    "urshifu-rapid-strike": {
      es: "Torre de las Aguas",
      en: "Tower of Waters",
    },
    urshifu: {
      es: "Torre de las Sombras / Aguas",
      en: "Tower of Darkness / Waters",
    },
    basculegion: {
      es: "Recibir 294+ daño de retroceso sin debilitarse",
      en: "Lose 294+ HP from recoil without fainting",
    },
    overqwil: {
      es: "Usar Mil Púas Tóxicas en estilo fuerte 20 veces",
      en: "Use Barb Barrage in Strong Style 20 times",
    },
    wyrdeer: {
      es: "Usar Escudo Psíquico en estilo ágil 20 veces",
      en: "Use Psyshield Bash in Agile Style 20 times",
    },
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

function formatSpecialCondition(
  rawCondition: string,
  minLevel: number | null | undefined,
  isEs: boolean,
): { label: string; absorbsLevel: boolean } {
  const lower = rawCondition.toLowerCase();

  // 1. Finizen -> Palafin (Círculo Unión)
  if (lower.includes("union circle")) {
    const lvl = minLevel || 38;
    return {
      label: isEs
        ? `Nivel ${lvl}+ en Círculo Unión`
        : `Level ${lvl}+ in Union Circle`,
      absorbsLevel: true,
    };
  }

  // 2. Inkay -> Malamar (Girar consola)
  if (lower.includes("upside") || lower.includes("turn")) {
    const lvl = minLevel || 30;
    return {
      label: isEs
        ? `Nivel ${lvl}+ consola invertida`
        : `Level ${lvl}+ upside down`,
      absorbsLevel: true,
    };
  }

  // 3. Pawmo, Bramblin, Rellor (1000 pasos en Let's Go)
  if (
    lower.includes("1000 steps") ||
    lower.includes("walk 1000") ||
    lower.includes("let's go")
  ) {
    return {
      label: isEs
        ? "1000 pasos en modo 'Enviar Pokémon'"
        : "1000 steps in 'Let's Go'",
      absorbsLevel: true,
    };
  }

  // 4. Primeape -> Annihilape (Puño Furia)
  if (lower.includes("rage fist") || lower.includes("20 times")) {
    return {
      label: isEs ? "Usar Puño Furia 20 veces" : "Use Rage Fist 20 times",
      absorbsLevel: true,
    };
  }

  // 5. Bisharp -> Kingambit (3 Bisharp con Distintivo de Líder)
  if (lower.includes("defeat 3") || lower.includes("leader")) {
    return {
      label: isEs
        ? "Derrotar a 3 Bisharp equipando Distintivo de Líder"
        : "Defeat 3 Bisharp holding Leader's Crest",
      absorbsLevel: true,
    };
  }

  // 6. Girar (Milcery -> Alcremie)
  if (lower.includes("spin")) {
    return {
      label: isEs ? "Girar sobre sí mismo" : "Spin around",
      absorbsLevel: false,
    };
  }

  // 7. Daño recibido (Yamask Galariano -> Runerigus)
  if (lower.includes("damage") || lower.includes("49")) {
    return {
      label: isEs
        ? "Recibir 49+ de daño bajo el arco"
        : "Take 49+ damage under stone arch",
      absorbsLevel: true,
    };
  }

  return { label: rawCondition, absorbsLevel: false };
}

// Condiciones para evolucionar, en frases cortas («Nivel 16», «Usar Piedra
// Fuego»)
function evolutionRequirements(
  details: EvolutionStage["triggerDetails"],
  locale: string,
  targetPokemonName?: string,
): string[] {
  if (!details) return [];
  const isEs = locale === "es";

  const requirements: string[] = [];

  // 0. Si el Pokémon de destino tiene condición fija en el mapa de overrides
  const targetKey = targetPokemonName?.toLowerCase() || "";
  if (SPECIAL_EVOLUTION_OVERRIDES[targetKey]) {
    requirements.push(
      isEs
        ? SPECIAL_EVOLUTION_OVERRIDES[targetKey].es
        : SPECIAL_EVOLUTION_OVERRIDES[targetKey].en,
    );
  }

  // A. Analizar condiciones especiales primero para saber si absorben el nivel
  let specialConditionLabel: string | null = null;
  let levelAbsorbed = false;

  if (requirements.length === 0 && details.otherCondition) {
    const parsed = formatSpecialCondition(
      details.otherCondition,
      details.minLevel,
      isEs,
    );
    specialConditionLabel = parsed.label;
    levelAbsorbed = parsed.absorbsLevel;
  }

  // B. Métodos principales: Trade / Use-Item (si no se cubrió en overrides)
  if (requirements.length === 0) {
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

    // C. Nivel y Horario (Día / Noche)
    const timeSuffix = details.timeOfDay
      ? ` (${isEs ? (details.timeOfDay === "day" ? "Día" : "Noche") : details.timeOfDay === "day" ? "Day" : "Night"})`
      : "";

    let hasHandledTime = false;

    if (specialConditionLabel) {
      requirements.push(specialConditionLabel);
    }

    if (details.minLevel && !levelAbsorbed) {
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

    // D. Objeto equipado sin intercambio (ej. Sneasel, Gligar)
    if (details.heldItem && details.trigger !== "trade") {
      const itemName = formatItemName(details.heldItem, isEs);
      requirements.push(
        `${isEs ? `Equipar ${itemName}` : `Hold ${itemName}`}${!hasHandledTime ? timeSuffix : ""}`,
      );
      if (details.timeOfDay) hasHandledTime = true;
    }

    if (details.timeOfDay && !hasHandledTime && requirements.length === 0) {
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

    // E. Movimiento conocido
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

    // F. Género y otros requisitos de campo
    if (details.gender === 1) requirements.push(isEs ? "(Hembra)" : "(Female)");
    if (details.gender === 2) requirements.push(isEs ? "(Macho)" : "(Male)");

    if (details.partySpecies) {
      const partyName = formatEvolutionPokemonName(
        details.partySpecies,
        locale,
      );
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

    // Fallback de objeto si no se añadió antes
    if (requirements.length === 0 && details.item) {
      const itemName = formatItemName(details.item, isEs);
      requirements.push(isEs ? `Usar ${itemName}` : `Use ${itemName}`);
    }
  }

  // Fallback genérico final
  if (requirements.length === 0) {
    requirements.push(isEs ? "Evolución especial" : "Special Evolution");
  }

  return requirements;
}

interface PlacedStage {
  node: EvolutionStage;
  parent: EvolutionStage | null;
  depth: number;
}

// El árbol en orden de etapas: primero la forma inicial, luego todas sus
// evoluciones directas, y así. Eevee y sus ocho evoluciones caben en la misma
// rejilla que una cadena de tres.
function flattenChain(
  node: EvolutionStage,
  parent: EvolutionStage | null = null,
  depth = 0,
  out: PlacedStage[] = [],
): PlacedStage[] {
  out.push({ node, parent, depth });
  node.evolvesTo.forEach((child) => flattenChain(child, node, depth + 1, out));
  return out;
}

const REGIONAL_FORM = /-(alola|galar|hisui|paldea)$/;

// Cadena evolutiva (DESIGN.md §4.4): mini tarjetas con la anatomía de las de
// la portada y, debajo de cada una, la condición para llegar a ella. El
// Pokémon que se está viendo lleva el aro de selección en tinta.
export default function EvolutionTree({
  currentPokemonName,
  chain,
  locale,
}: EvolutionTreeProps) {
  const { detail } = getDictionary(locale);
  const currentLower = currentPokemonName.toLowerCase();

  const stages = chain ? flattenChain(chain).sort((a, b) => a.depth - b.depth) : [];

  // Si una etapa sale de más de un Pokémon (Silcoon y Cascoon), cada
  // condición dice de cuál viene
  const parentsPerDepth = new Map<number, Set<string>>();
  for (const { parent, depth } of stages) {
    if (!parent) continue;
    const parents = parentsPerDepth.get(depth) ?? new Set<string>();
    parents.add(parent.name);
    parentsPerDepth.set(depth, parents);
  }

  return (
    <section
      aria-labelledby="evolution-title"
      className="rounded-surface bg-surface p-6 md:p-10 text-ink"
    >
      <h2 id="evolution-title" className="text-head font-black">
        {detail.evolution}
      </h2>

      {stages.length < 2 ? (
        <p className="mt-3 text-body">{detail.noEvolution}</p>
      ) : (
        <ol className="mt-16 md:mt-20 grid grid-cols-2 gap-x-3 gap-y-[52px] md:grid-cols-3 md:gap-x-5 md:gap-y-[72px] lg:grid-cols-4">
          {stages.map(({ node, parent, depth }, index) => {
            const nodeLower = node.name.toLowerCase();
            const isCurrent =
              nodeLower === currentLower ||
              node.speciesName?.toLowerCase() === currentLower ||
              nodeLower.startsWith(`${currentLower}-`);

            const requirements = parent
              ? evolutionRequirements(
                  node.triggerDetails,
                  locale,
                  node.speciesName || node.name,
                )
              : [];
            if (parent && (parentsPerDepth.get(depth)?.size ?? 0) > 1) {
              requirements.unshift(
                `${detail.from} ${formatEvolutionPokemonName(parent.speciesName || parent.name, locale)}`,
              );
            }

            return (
              <li key={`${node.name}-${index}`} className="flex flex-col gap-3">
                <PokemonCard
                  pokemon={{
                    id: node.id,
                    // Las formas regionales conservan su nombre (Vulpix de Alola)
                    name: REGIONAL_FORM.test(nodeLower)
                      ? node.name
                      : node.speciesName || node.name,
                    image: node.image,
                    types: node.types,
                  }}
                  href={getEvolutionHref(node, locale)}
                  locale={locale}
                  current={isCurrent}
                />
                {requirements.length > 0 && (
                  <p className="text-small font-bold">{requirements.join(" · ")}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
