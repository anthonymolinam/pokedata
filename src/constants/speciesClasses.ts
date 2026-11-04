import SPECIES_CLASSES from "@/data/species-classes.json";

// Clases de especie que el dado del equipo puede dejar fuera (DESIGN.md §4.9).
// Legendarios y singulares salen de PokéAPI (npm run species-classes);
// ultraentes y paradoja no los marca PokéAPI y van aquí a mano, por número de
// especie. Las cuatro clases no se solapan: Koraidon y Miraidon cuentan como
// legendarios, como los marca PokéAPI, y Necrozma no es un ultraente.

export const SPECIES_CLASS_KEYS = ["legendary", "mythical", "ultraBeast", "paradox"] as const;
export type SpeciesClass = (typeof SPECIES_CLASS_KEYS)[number];

// Nihilego … Guzzlord, y Poipole, Naganadel, Stakataka y Blacephalon
export const ULTRA_BEASTS: readonly number[] = [793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806];

// Antiguos (Great Tusk … Roaring Moon, Walking Wake, Gouging Fire, Raging
// Bolt) y futuros (Iron Treads … Iron Valiant, Iron Leaves, Iron Boulder,
// Iron Crown)
export const PARADOX: readonly number[] = [
  984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021,
  1022, 1023,
];

const CLASS_OF = new Map<number, SpeciesClass>([
  ...SPECIES_CLASSES.legendary.map((id): [number, SpeciesClass] => [id, "legendary"]),
  ...SPECIES_CLASSES.mythical.map((id): [number, SpeciesClass] => [id, "mythical"]),
  ...ULTRA_BEASTS.map((id): [number, SpeciesClass] => [id, "ultraBeast"]),
  ...PARADOX.map((id): [number, SpeciesClass] => [id, "paradox"]),
]);

// La clase de una especie, o null si es un Pokémon corriente
export function speciesClass(id: number): SpeciesClass | null {
  return CLASS_OF.get(id) ?? null;
}
