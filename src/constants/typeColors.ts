import type { PokemonType } from "@/constants/typeChart";

// Tokens de color de los 18 tipos (DESIGN.md §2.2). Son los mismos valores
// que las variables --type-* de globals.css; si cambias uno, cambia ambos.
//   field: color del tipo, fondo de tarjetas, columnas y escenario de la ficha
//   ink:   tinta sobre el campo (negra o hueso, la de más contraste)
//   step:  campo oscurecido un 14 %, superficie secundaria dentro del campo
//   deep:  el tipo como texto sobre blanco (≥ 4.9:1 sobre --surface; sobre
//          --ground, Agua, Hielo y Psíquico bajan de 4.5:1, ver §2.3)
export interface TypeTokens {
  field: string;
  ink: string;
  step: string;
  deep: string;
}

export const GROUND = "#F3F4F8";
export const SURFACE = "#FFFFFF";
export const INK = "#15161C";
export const BONE = "#F7F5F0";

export const TYPE_TOKENS: Record<PokemonType, TypeTokens> = {
  normal: { field: "#A8A77A", ink: INK, step: "#909069", deep: "#727253" },
  fire: { field: "#EE8130", ink: INK, step: "#CD6F29", deep: "#A95C22" },
  water: { field: "#6390F0", ink: INK, step: "#557CCE", deep: "#4C6FB9" },
  electric: { field: "#F7D02C", ink: INK, step: "#D4B326", deep: "#836E17" },
  grass: { field: "#7AC74C", ink: INK, step: "#69AB41", deep: "#4C7B2F" },
  ice: { field: "#96D9D6", ink: INK, step: "#81BBB8", deep: "#527776" },
  fighting: { field: "#C22E28", ink: BONE, step: "#A72822", deep: "#C22E28" },
  // taste-skill-ignore: Veneno, Fantasma y Dragón son violetas canónicos
  poison: { field: "#A33EA1", ink: BONE, step: "#8C358A", deep: "#A33EA1" },
  ground: { field: "#E2BF65", ink: INK, step: "#C2A457", deep: "#816D3A" },
  flying: { field: "#A98FF3", ink: INK, step: "#917BD1", deep: "#7664AA" },
  psychic: { field: "#F95587", ink: INK, step: "#D64974", deep: "#C24269" },
  bug: { field: "#A6B91A", ink: INK, step: "#8F9F16", deep: "#6A7611" },
  rock: { field: "#B6A136", ink: INK, step: "#9D8A2E", deep: "#7E6F25" },
  ghost: { field: "#735797", ink: BONE, step: "#634B82", deep: "#735797" }, // taste-skill-ignore
  dragon: { field: "#6F35FC", ink: BONE, step: "#5F2ED9", deep: "#6F35FC" }, // taste-skill-ignore
  dark: { field: "#705746", ink: BONE, step: "#604B3C", deep: "#705746" },
  steel: { field: "#B7B7CE", ink: INK, step: "#9D9DB1", deep: "#6E6E7C" },
  fairy: { field: "#D685AD", ink: INK, step: "#B87295", deep: "#985E7B" },
};

export function isPokemonType(value: string): value is PokemonType {
  return value in TYPE_TOKENS;
}

// Etiqueta de tipo: bloque en field con el nombre en field-ink. Las clases van
// escritas enteras para que Tailwind las detecte.
export const TYPE_COLORS: Record<string, string> = {
  normal: "bg-type-normal text-type-normal-ink",
  fire: "bg-type-fire text-type-fire-ink",
  water: "bg-type-water text-type-water-ink",
  grass: "bg-type-grass text-type-grass-ink",
  electric: "bg-type-electric text-type-electric-ink",
  ice: "bg-type-ice text-type-ice-ink",
  fighting: "bg-type-fighting text-type-fighting-ink",
  poison: "bg-type-poison text-type-poison-ink",
  ground: "bg-type-ground text-type-ground-ink",
  flying: "bg-type-flying text-type-flying-ink",
  psychic: "bg-type-psychic text-type-psychic-ink",
  bug: "bg-type-bug text-type-bug-ink",
  rock: "bg-type-rock text-type-rock-ink",
  ghost: "bg-type-ghost text-type-ghost-ink",
  dragon: "bg-type-dragon text-type-dragon-ink",
  steel: "bg-type-steel text-type-steel-ink",
  dark: "bg-type-dark text-type-dark-ink",
  fairy: "bg-type-fairy text-type-fairy-ink",
};

/**
 * @deprecated Los halos degradados desaparecen en el rediseño (DESIGN.md §7).
 * Solo sigue aquí hasta que se rehaga PokemonHeroSection (paso 9, la ficha); entonces se borra.
 */
export const TYPE_GLOWS: Record<string, string> = {
  normal: "from-zinc-500/20 to-transparent",
  fire: "from-orange-500/25 to-transparent",
  water: "from-blue-500/25 to-transparent",
  grass: "from-emerald-500/25 to-transparent",
  electric: "from-amber-400/25 to-transparent",
  ice: "from-cyan-400/25 to-transparent",
  fighting: "from-red-600/25 to-transparent",
  poison: "from-purple-600/25 to-transparent",
  ground: "from-amber-600/25 to-transparent",
  flying: "from-indigo-400/25 to-transparent",
  psychic: "from-pink-500/25 to-transparent",
  bug: "from-lime-500/25 to-transparent",
  rock: "from-stone-500/25 to-transparent",
  ghost: "from-violet-600/25 to-transparent",
  dragon: "from-indigo-600/25 to-transparent",
  steel: "from-slate-400/25 to-transparent",
  dark: "from-neutral-700/30 to-transparent",
  fairy: "from-rose-400/25 to-transparent",
};
