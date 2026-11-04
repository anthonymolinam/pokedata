import { SPECIES_CLASS_KEYS, speciesClass, type SpeciesClass } from "@/constants/speciesClasses";

// Opciones del dado del equipo (DESIGN.md §4.9): qué clases de especie puede
// sacar. Solo afectan al dado; a mano se puede añadir cualquier Pokémon. Se
// guardan en localStorage con la clave pokedata-dice:
// { "v": 1, "include": { "legendary": false, "mythical": false, "ultraBeast": false, "paradox": true } }

export type DiceFilters = Record<SpeciesClass, boolean>;

export const DICE_STORAGE_KEY = "pokedata-dice";
const DICE_VERSION = 1;

// Por defecto, fuera los legendarios, los singulares y los ultraentes; los
// paradoja, dentro
export const DEFAULT_DICE_FILTERS: DiceFilters = Object.freeze({
  legendary: false,
  mythical: false,
  ultraBeast: false,
  paradox: true,
});

// ¿Puede el dado sacar esta especie con estas opciones?
export function diceAllows(id: number, filters: DiceFilters): boolean {
  const kind = speciesClass(id);
  return kind === null || filters[kind];
}

// Lo guardado, completado con los valores por defecto; cualquier cosa rara
// cuenta como no guardado
export function parseDiceFilters(raw: string | null): DiceFilters {
  try {
    const data = raw ? JSON.parse(raw) : null;
    if (data?.v !== DICE_VERSION || typeof data.include !== "object" || !data.include) {
      return DEFAULT_DICE_FILTERS;
    }
    const filters = { ...DEFAULT_DICE_FILTERS };
    for (const key of SPECIES_CLASS_KEYS) {
      if (typeof data.include[key] === "boolean") filters[key] = data.include[key];
    }
    return filters;
  } catch {
    return DEFAULT_DICE_FILTERS;
  }
}

export function serializeDiceFilters(filters: DiceFilters): string {
  return JSON.stringify({ v: DICE_VERSION, include: filters });
}

// --- Almacén para useSyncExternalStore ---

// Como el equipo (src/lib/team.ts): la copia en memoria es la fuente, se carga
// en la primera lectura y cada cambio se guarda después, así que sin
// localStorage las opciones duran lo que la visita
const DICE_EVENT = "pokedata-dice";
let current: DiceFilters | null = null;

export function getDiceFilters(): DiceFilters {
  if (current === null) {
    try {
      current = parseDiceFilters(localStorage.getItem(DICE_STORAGE_KEY));
    } catch {
      current = DEFAULT_DICE_FILTERS;
    }
  }
  return current;
}

// El servidor no conoce localStorage: pinta los valores por defecto
export function getDiceFiltersServer(): DiceFilters {
  return DEFAULT_DICE_FILTERS;
}

export function setDiceFilter(key: SpeciesClass, on: boolean) {
  current = { ...getDiceFilters(), [key]: on };
  try {
    localStorage.setItem(DICE_STORAGE_KEY, serializeDiceFilters(current));
  } catch {
    // Sin almacenamiento las opciones viven solo en memoria durante esta visita
  }
  window.dispatchEvent(new Event(DICE_EVENT));
}

export function subscribeToDiceFilters(onChange: () => void): () => void {
  // Otra pestaña cambió las opciones: se vuelven a leer
  const onStorage = (e: StorageEvent) => {
    if (e.key !== DICE_STORAGE_KEY && e.key !== null) return;
    current = null;
    onChange();
  };
  window.addEventListener(DICE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DICE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
