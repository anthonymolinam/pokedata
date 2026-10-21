import type { PokemonIndex } from "@/lib/daily";

// Equipo aleatorio (DESIGN.md §4.9): rellena los huecos con especies que no
// están en el equipo, en su forma base (el índice solo tiene especies), y con
// tipos variados: cada una entra solo si no repite ningún tipo del equipo. Si
// tras muchos intentos no aparece ninguna así (el equipo ya usa casi todos los
// tipos), entra la que menos tipos repite de una tanda de candidatas.

const STRICT_TRIES = 400;
const LOOSE_TRIES = 40;

// Lo que ya hay en el equipo: el número de especie y los tipos de cada miembro
export interface KeptMember {
  id: number;
  types: readonly string[];
}

// Devuelve los nombres de las especies nuevas, `count` como mucho
export function pickRandomMembers(
  index: PokemonIndex,
  kept: readonly KeptMember[],
  count: number,
  random: () => number,
): string[] {
  const usedIds = new Set(kept.map((m) => m.id));
  const usedTypes = new Set(kept.flatMap((m) => m.types));
  const picked: string[] = [];
  const overlap = (types: string[]) => types.filter((t) => usedTypes.has(t)).length;

  while (picked.length < count && usedIds.size < index.length) {
    let choice: number | null = null;
    for (let i = 0; i < STRICT_TRIES && choice === null; i++) {
      const id = 1 + Math.floor(random() * index.length);
      if (!usedIds.has(id) && overlap(index[id - 1].slice(1)) === 0) choice = id;
    }
    if (choice === null) {
      let best = Infinity;
      for (let i = 0; i < LOOSE_TRIES; i++) {
        const id = 1 + Math.floor(random() * index.length);
        if (usedIds.has(id)) continue;
        const score = overlap(index[id - 1].slice(1));
        if (score < best) {
          best = score;
          choice = id;
        }
      }
    }
    if (choice === null) continue;
    const [name, ...types] = index[choice - 1];
    usedIds.add(choice);
    types.forEach((t) => usedTypes.add(t));
    picked.push(name);
  }

  return picked;
}
