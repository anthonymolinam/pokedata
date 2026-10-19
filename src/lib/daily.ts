import type { PokemonType } from "@/constants/typeChart";

// Pokémon del día (DESIGN.md §4.2): tres Pokémon iguales para todos durante el
// día UTC y siempre de tipos distintos. Este archivo no importa el índice para
// que el cliente lo cargue solo al usar el dado; el servidor lo pasa desde
// daily-server.ts.

// Fila del índice src/data/pokemon-index.json: [nombre, tipo1, tipo2?]
export type PokemonIndex = string[][];

export interface DailyPokemon {
  id: number;
  name: string;
  types: PokemonType[];
}

export const DAILY_COUNT = 3;

// AAAA-MM-DD del día UTC: la semilla del día
export function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Hash FNV-1a de 32 bits: convierte la fecha en la semilla del generador
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// Generador determinista: la misma semilla da la misma secuencia
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Recorre los Pokémon en el orden que marca el generador y se queda con los
// tres primeros que no repiten ningún tipo: Charizard (Fuego/Volador) deja
// fuera a cualquier otro Pokémon de Fuego o de Volador
export function pickDistinctTypes(
  index: PokemonIndex,
  random: () => number,
): DailyPokemon[] {
  const picked: DailyPokemon[] = [];
  const usedTypes = new Set<string>();

  while (picked.length < DAILY_COUNT) {
    const id = 1 + Math.floor(random() * index.length);
    const [name, ...types] = index[id - 1];
    if (picked.some((p) => p.id === id) || types.some((t) => usedTypes.has(t))) {
      continue;
    }
    types.forEach((t) => usedTypes.add(t));
    picked.push({ id, name, types: types as PokemonType[] });
  }

  return picked;
}

export function getDailyPokemonFor(index: PokemonIndex, date: Date): DailyPokemon[] {
  return pickDistinctTypes(index, mulberry32(hashString(utcDateKey(date))));
}
