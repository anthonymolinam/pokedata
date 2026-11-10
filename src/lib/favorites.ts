// Favoritos (DESIGN.md §4.10): números de especie (1–1025) guardados en el
// navegador. Se guardan por especie, no por forma: Rotom Lavado y Rotom
// comparten corazón. Aquí viven el guardado en localStorage, el almacén para
// useSyncExternalStore y la copia para el servidor en una cookie con un mapa
// de bits. Sin interfaz.

export const FAVORITES_STORAGE_KEY = "pokedata-favorites";
export const FAVORITES_COOKIE = "pokedata-favorites";
const FAVORITES_VERSION = 1;

// Última especie conocida. Debe coincidir con la longitud de
// src/data/pokemon-index.json (lo comprueba favorites.test.ts); no se importa
// el índice para no meterlo en el paquete del cliente.
export const LAST_SPECIES = 1025;

// Tope del valor de la cookie: el límite es de unos 4 KB contando nombre,
// valor y atributos
export const FAVORITES_COOKIE_MAX_VALUE = 3900;
const COOKIE_PREFIX = `${FAVORITES_VERSION}.`;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// --- Normalización ---

// Limpia una lista llegada de fuera: enteros de 1 a LAST_SPECIES, ordenados y
// sin repetir. Lo demás se descarta.
export function normalizeFavorites(values: readonly unknown[]): number[] {
  const ids = new Set<number>();
  for (const v of values) {
    if (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= LAST_SPECIES) ids.add(v);
  }
  return [...ids].sort((a, b) => a - b);
}

export function sameFavorites(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

// --- Guardado: { "v": 1, "ids": [6, 25, 448] } ---

export function parseStoredFavorites(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || (data as { v?: unknown }).v !== FAVORITES_VERSION) {
      return [];
    }
    const ids = (data as { ids?: unknown }).ids;
    return Array.isArray(ids) ? normalizeFavorites(ids) : [];
  } catch {
    return [];
  }
}

export function serializeFavorites(ids: readonly number[]): string {
  return JSON.stringify({ v: FAVORITES_VERSION, ids: normalizeFavorites(ids) });
}

// --- Cookie: "1." + mapa de bits en base64url ---

// Un bit por especie: el bit n − 1 para el número n, del menos significativo
// al más significativo de cada byte. Los bytes se cortan tras el último
// favorito, así que el tamaño depende del número más alto, no de cuántos haya.
function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function encodeFavoritesCookie(ids: readonly number[]): string {
  const clean = normalizeFavorites(ids);
  const last = clean.at(-1);
  const bytes = new Uint8Array(last === undefined ? 0 : Math.floor((last - 1) / 8) + 1);
  for (const id of clean) bytes[(id - 1) >> 3] |= 1 << ((id - 1) & 7);
  return COOKIE_PREFIX + toBase64Url(bytes);
}

// La lista de la cookie, o null si no es válida. null quiere decir «ausente»,
// no «sin favoritos» ("1." sí es una lista vacía válida): con una cookie rara
// el servidor no filtra y nunca muestra un vacío falso.
export function decodeFavoritesCookie(value: string | null | undefined): number[] | null {
  if (typeof value !== "string" || value.length > FAVORITES_COOKIE_MAX_VALUE) return null;
  if (!value.startsWith(COOKIE_PREFIX)) return null;
  const data = value.slice(COOKIE_PREFIX.length);
  // Base64url sin relleno: un resto de 1 carácter no puede salir de ningún byte
  if (!/^[A-Za-z0-9_-]*$/.test(data) || data.length % 4 === 1) return null;
  let binary: string;
  try {
    binary = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return null;
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  // Solo la forma canónica: atob tolera bits sobrantes en el último carácter
  if (toBase64Url(bytes) !== data) return null;
  const ids: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    for (let bit = 0; bit < 8; bit++) {
      if (bytes[i] & (1 << bit)) {
        const id = i * 8 + bit + 1;
        // Un bit por encima de la última especie: la cookie no es de este índice
        if (id > LAST_SPECIES) return null;
        ids.push(id);
      }
    }
  }
  return ids;
}

// La cookie completa para document.cookie: nombre, valor y atributos
export function favoritesCookieString(ids: readonly number[]): string {
  return `${FAVORITES_COOKIE}=${encodeFavoritesCookie(ids)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// El valor de la cookie dentro de una cabecera Cookie o de document.cookie, o
// null si no está
export function readFavoritesCookieValue(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq !== -1 && part.slice(0, eq).trim() === FAVORITES_COOKIE) return part.slice(eq + 1).trim();
  }
  return null;
}

// --- Almacén para useSyncExternalStore ---

// Como el equipo (src/lib/team.ts): la copia en memoria es la fuente, se carga
// de localStorage en la primera lectura y cada cambio se guarda después, en
// localStorage y en la cookie. Sin localStorage los favoritos viven en memoria
// durante la visita. La instantánea es la misma lista mientras no cambie.
const FAVORITES_EVENT = "pokedata-favorites";
let current: number[] | null = null;

function readStoredFavorites(): number[] {
  try {
    return parseStoredFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeFavoritesCookie(ids: readonly number[]) {
  try {
    document.cookie = favoritesCookieString(ids);
  } catch {
    // Sin cookies el filtro se calcula en el navegador (§4.10, modo navegador)
  }
}

// Al cargar la portada manda localStorage: si la cookie no coincide (se borró,
// caducó o la cambió otra cosa), se reescribe. Devuelve si hubo que hacerlo,
// para que la portada con ?fav=1 pida de nuevo el resultado al servidor.
export function syncFavoritesCookie(): boolean {
  let cookie: string | null;
  try {
    cookie = readFavoritesCookieValue(document.cookie);
  } catch {
    return false;
  }
  const expected = encodeFavoritesCookie(getFavoritesSnapshot());
  if (cookie === expected) return false;
  writeFavoritesCookie(getFavoritesSnapshot());
  return true;
}

export function getFavoritesSnapshot(): number[] {
  if (current === null) current = readStoredFavorites();
  return current;
}

// El servidor no conoce los favoritos: el corazón no se pinta hasta hidratar
export function getFavoritesServerSnapshot(): null {
  return null;
}

export function isFavorite(id: number): boolean {
  return getFavoritesSnapshot().includes(id);
}

export function setFavorites(ids: readonly number[]) {
  const next = normalizeFavorites(ids);
  if (sameFavorites(getFavoritesSnapshot(), next)) return;
  current = next;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(next));
  } catch {
    // Sin almacenamiento los favoritos viven solo en memoria durante esta visita
  }
  writeFavoritesCookie(next);
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

// Marca o desmarca una especie; devuelve si queda marcada
export function toggleFavorite(id: number): boolean {
  const ids = getFavoritesSnapshot();
  const on = !ids.includes(id);
  setFavorites(on ? [...ids, id] : ids.filter((x) => x !== id));
  return on;
}

// Cambios desde esta pestaña y desde otras (evento storage, que recarga la
// lista sin volver a escribirla: la otra pestaña ya escribió la cookie)
export function subscribeToFavorites(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== FAVORITES_STORAGE_KEY && e.key !== null) return;
    const stored = readStoredFavorites();
    if (current !== null && sameFavorites(current, stored)) return;
    current = stored;
    onChange();
  };
  window.addEventListener(FAVORITES_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
