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

// El equipo guardado en memoria es la fuente: se carga del almacenamiento en la
// primera lectura y cada cambio se guarda después. Así la página funciona igual
// cuando localStorage falla, y la instantánea es la misma lista mientras no
// cambie.
//
// Un enlace compartido no pisa el equipo guardado: si la URL trae ?t= y es
// distinto del guardado, se muestra ese equipo y la página ofrece guardarlo o
// volver al propio. El equipo compartido se deduce de la URL y del guardado,
// así que «Volver al mío» solo quita ?t= y «Compartir enlace» puede escribirlo
// sin que aparezca la banda (es igual al guardado).
const TEAM_EVENT = "pokedata-team";
let savedTeam: string[] | null = null;
let shared: { search: string; saved: string[]; team: string[] | null } | null = null;

function getSavedTeam(): string[] {
  if (savedTeam === null) savedTeam = readStoredTeam();
  return savedTeam;
}

// El equipo del enlace, o null si no hay ?t= o es el guardado. Se recalcula
// solo cuando cambia la URL o el guardado, para devolver la misma lista
function getSharedTeam(): string[] | null {
  const search = window.location.search;
  const saved = getSavedTeam();
  if (shared?.search !== search || shared.saved !== saved) {
    const fromUrl = readTeamParam(search);
    shared = { search, saved, team: fromUrl && !sameTeam(fromUrl, saved) ? fromUrl : null };
  }
  return shared.team;
}

function notify() {
  window.dispatchEvent(new Event(TEAM_EVENT));
}

function replaceUrl(href: string) {
  if (href !== window.location.href) window.history.replaceState(null, "", href);
}

// El equipo que se ve: el del enlace compartido o el guardado
export function getTeamSnapshot(): string[] {
  return getSharedTeam() ?? getSavedTeam();
}

export function isViewingSharedTeam(): boolean {
  return getSharedTeam() !== null;
}

// El servidor no conoce localStorage ni la URL del navegador: pinta los campos
// fantasma y ninguna banda
export function getTeamServerSnapshot(): null {
  return null;
}

export function getSharedServerSnapshot(): boolean {
  return false;
}

// Guarda el equipo como propio. Quita ?t= de la URL: editar un equipo
// compartido lo convierte en el propio, y un ?t= viejo de «Compartir enlace»
// mostraría al recargar un equipo que ya no es el tuyo.
export function setTeam(slugs: readonly string[]) {
  const next = sanitizeTeam(slugs);
  const hadParam = readTeamParam(window.location.search) !== null;
  if (hadParam) replaceUrl(withoutTeamParam(window.location.href));
  if (!sameTeam(getSavedTeam(), next)) {
    savedTeam = next;
    writeStoredTeam(next);
  } else if (!hadParam) {
    return;
  }
  notify();
}

// Sustituye el equipo que se ve sin convertirlo en propio: si es un enlace
// compartido, solo cambia ?t= (lo usa la limpieza de slugs al cargar)
export function replaceShownTeam(slugs: readonly string[]) {
  const next = sanitizeTeam(slugs);
  if (sameTeam(getTeamSnapshot(), next)) return;
  if (!isViewingSharedTeam()) return setTeam(next);
  replaceUrl(teamParamUrl(window.location.href, next));
  notify();
}

// «Volver al mío»: deja de ver el equipo compartido
export function leaveSharedTeam() {
  replaceUrl(withoutTeamParam(window.location.href));
  notify();
}

// Escribe ?t= con el equipo que se ve y devuelve el enlace para compartirlo
export function shareTeamUrl(): string {
  const href = teamParamUrl(window.location.href, getTeamSnapshot());
  replaceUrl(href);
  notify();
  return href;
}

// Cambios desde esta pestaña, desde otras (evento storage, que recarga el
// equipo guardado sin volver a escribirlo) y al moverse por el historial
export function subscribeToTeam(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== TEAM_STORAGE_KEY && e.key !== null) return;
    const stored = readStoredTeam();
    if (savedTeam !== null && sameTeam(savedTeam, stored)) return;
    savedTeam = stored;
    onChange();
  };
  window.addEventListener(TEAM_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(TEAM_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("popstate", onChange);
  };
}
