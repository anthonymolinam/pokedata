import type { PokemonType } from "@/constants/typeChart";

// Equipo (DESIGN.md §4.9): hasta seis Pokémon guardados en el navegador por su
// slug de PokéAPI (el mismo de /pokemon/[name]), que puede ser una forma:
// "ninetales-alola", "charizard-mega-x". Aquí viven el tipo de cada miembro,
// el guardado en localStorage, el parámetro ?t= del enlace y el almacén para
// useSyncExternalStore. Los datos de cada miembro llegan de /api/team.

export const TEAM_SIZE = 6;
export const TEAM_STORAGE_KEY = "pokedata-team";
export const TEAM_PARAM = "t";
const TEAM_VERSION = 1;

export type StatKey =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

// En el orden de PokéAPI, que es el de las filas del panel de estadísticas
export const STAT_KEYS: readonly StatKey[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

// Nombre de una forma en el idioma de la página: el corto va en la ficha del
// campo («Alola», «Mega X») y el completo en title y en el nombre accesible
// («Forma de Alola»). null es la forma base.
export interface FormName {
  short: string;
  full: string;
}

export interface TeamForm {
  slug: string;
  name: FormName | null;
}

export interface TeamMember {
  slug: string;
  // Número de la especie (0006), igual para todas sus formas
  id: number;
  name: string;
  form: FormName | null;
  types: PokemonType[];
  stats: Record<StatKey, number>;
  // Id del artwork oficial: el de la forma, que no coincide con el de la especie
  artworkId: number;
  // Todas las formas de la especie, la base incluida; una sola si no tiene otras
  forms: TeamForm[];
}

// --- Slugs ---

// Solo el formato de un slug de PokéAPI: minúsculas, cifras y guiones sueltos.
// Si el Pokémon existe lo decide /api/team, que descarta los que no conoce.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Limpia una lista llegada de fuera (almacenamiento o enlace): descarta lo que
// no tiene forma de slug y se queda con seis como mucho. Se permiten repetidos.
export function sanitizeTeam(values: readonly unknown[]): string[] {
  return values
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => SLUG_PATTERN.test(v))
    .slice(0, TEAM_SIZE);
}

export function sameTeam(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((slug, i) => slug === b[i]);
}

// --- Guardado: { "v": 1, "members": [...] } ---

export function parseStoredTeam(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (
      typeof data !== "object" ||
      data === null ||
      (data as { v?: unknown }).v !== TEAM_VERSION
    ) {
      return [];
    }
    const members = (data as { members?: unknown }).members;
    return Array.isArray(members) ? sanitizeTeam(members) : [];
  } catch {
    return [];
  }
}

export function serializeTeam(slugs: readonly string[]): string {
  return JSON.stringify({ v: TEAM_VERSION, members: slugs.slice(0, TEAM_SIZE) });
}

function readStoredTeam(): string[] {
  try {
    return parseStoredTeam(localStorage.getItem(TEAM_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeStoredTeam(slugs: readonly string[]) {
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, serializeTeam(slugs));
  } catch {
    // Sin almacenamiento el equipo vive solo en memoria durante esta visita
  }
}

// --- Enlace: ?t=charizard,gyarados,scizor ---

// null si la URL no trae ?t=; una lista (quizá vacía) si lo trae
export function readTeamParam(search: string): string[] | null {
  const value = new URLSearchParams(search).get(TEAM_PARAM);
  return value === null ? null : sanitizeTeam(value.split(","));
}

// La URL con ?t= del equipo, para history.replaceState y para copiar. Las
// comas se dejan sin escapar para que el enlace se lea.
export function teamParamUrl(href: string, slugs: readonly string[]): string {
  const url = new URL(href);
  url.searchParams.set(TEAM_PARAM, slugs.join(","));
  return url.toString().replace(/%2C/gi, ",");
}

export function withoutTeamParam(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(TEAM_PARAM);
  return url.toString();
}

// --- Almacén para useSyncExternalStore ---

// El equipo en memoria es la fuente: se carga del almacenamiento en la primera
// lectura y cada cambio se guarda después. Así la página funciona igual cuando
// localStorage falla, y la instantánea es la misma lista mientras no cambie.
const TEAM_EVENT = "pokedata-team";
let currentTeam: string[] | null = null;

export function getTeamSnapshot(): string[] {
  if (currentTeam === null) currentTeam = readStoredTeam();
  return currentTeam;
}

// El servidor no conoce localStorage: pinta los campos fantasma
export function getTeamServerSnapshot(): null {
  return null;
}

export function setTeam(slugs: readonly string[]) {
  const next = sanitizeTeam(slugs);
  if (currentTeam !== null && sameTeam(currentTeam, next)) return;
  currentTeam = next;
  writeStoredTeam(next);
  window.dispatchEvent(new Event(TEAM_EVENT));
}

// Cambios desde esta pestaña (setTeam) y desde otras (evento storage, que
// recarga el equipo guardado sin volver a escribirlo)
export function subscribeToTeam(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== TEAM_STORAGE_KEY && e.key !== null) return;
    const stored = readStoredTeam();
    if (currentTeam !== null && sameTeam(currentTeam, stored)) return;
    currentTeam = stored;
    onChange();
  };
  window.addEventListener(TEAM_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(TEAM_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
