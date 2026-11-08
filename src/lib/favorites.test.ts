import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  FAVORITES_COOKIE_MAX_VALUE,
  LAST_SPECIES,
  decodeFavoritesCookie,
  encodeFavoritesCookie,
  favoritesCookieString,
  normalizeFavorites,
  parseStoredFavorites,
  readFavoritesCookieValue,
  serializeFavorites,
} from "@/lib/favorites";

const index: unknown[] = JSON.parse(
  readFileSync(new URL("../data/pokemon-index.json", import.meta.url), "utf8"),
);
const all = Array.from({ length: LAST_SPECIES }, (_, i) => i + 1);

test("la última especie coincide con el índice", () => {
  assert.equal(LAST_SPECIES, index.length);
});

test("normalizar: de 1 a la última, ordenados y sin repetir", () => {
  assert.deepEqual(
    normalizeFavorites([448, 6, 25, 6, 0, -3, 1026, 2.5, NaN, "7", null, 1, LAST_SPECIES]),
    [1, 6, 25, 448, LAST_SPECIES],
  );
});

test("guardado: ida y vuelta y versión", () => {
  assert.equal(serializeFavorites([448, 25, 6, 25]), '{"v":1,"ids":[6,25,448]}');
  assert.deepEqual(parseStoredFavorites(serializeFavorites([448, 25, 6])), [6, 25, 448]);
  assert.deepEqual(parseStoredFavorites('{"v":1,"ids":[25,"x",9999,25]}'), [25]);
  assert.deepEqual(parseStoredFavorites('{"v":2,"ids":[25]}'), []);
  assert.deepEqual(parseStoredFavorites("{roto"), []);
  assert.deepEqual(parseStoredFavorites(null), []);
});

test("cookie sin favoritos: «1.» y lista vacía válida", () => {
  assert.equal(encodeFavoritesCookie([]), "1.");
  assert.deepEqual(decodeFavoritesCookie("1."), []);
});

test("cookie con Pikachu: 4 bytes", () => {
  const value = encodeFavoritesCookie([25]);
  const data = value.slice(2);
  assert.equal(Buffer.from(data, "base64url").length, 4);
  assert.deepEqual(decodeFavoritesCookie(value), [25]);
});

test("cookie con los 1025: 172 caracteres y cabecera de menos de 260 bytes", () => {
  const value = encodeFavoritesCookie(all);
  assert.equal(value.length - 2, 172);
  assert.deepEqual(decodeFavoritesCookie(value), all);
  assert.ok(Buffer.byteLength(favoritesCookieString(all)) < 260);
});

test("cookie: ida y vuelta con listas variadas", () => {
  for (const ids of [[1], [8], [9], [6, 25, 448], [LAST_SPECIES], all.filter((n) => n % 3 === 0)]) {
    assert.deepEqual(decodeFavoritesCookie(encodeFavoritesCookie(ids)), ids);
  }
  // Los números inválidos se descartan al codificar
  assert.deepEqual(decodeFavoritesCookie(encodeFavoritesCookie([0, 25, 2000, 25])), [25]);
});

test("cookie inválida cuenta como ausente, no como «sin favoritos»", () => {
  const pikachu = encodeFavoritesCookie([25]).slice(2);
  // Versión desconocida o sin versión
  assert.equal(decodeFavoritesCookie(`2.${pikachu}`), null);
  assert.equal(decodeFavoritesCookie(pikachu), null);
  // Base64 roto: caracteres fuera de base64url, relleno, longitud imposible,
  // bits sobrantes en el último carácter
  assert.equal(decodeFavoritesCookie("1.AAA+"), null);
  assert.equal(decodeFavoritesCookie("1.AA=="), null);
  assert.equal(decodeFavoritesCookie("1.AAAAA"), null);
  assert.equal(decodeFavoritesCookie("1.AB"), null);
  // Más de 3.900 caracteres de valor
  assert.equal(decodeFavoritesCookie("1." + "A".repeat(FAVORITES_COOKIE_MAX_VALUE)), null);
  // Bits por encima de la última especie: el bit 1025 (especie 1026)
  const bytes = new Uint8Array(129);
  bytes[128] = 0b10;
  assert.equal(decodeFavoritesCookie("1." + Buffer.from(bytes).toString("base64url")), null);
  assert.equal(decodeFavoritesCookie(null), null);
  assert.equal(decodeFavoritesCookie(undefined), null);
});

test("leer la cookie de una cabecera Cookie", () => {
  assert.equal(readFavoritesCookieValue("a=1; pokedata-favorites=1.AAAAAQ; b=2"), "1.AAAAAQ");
  assert.equal(readFavoritesCookieValue("pokedata-team=x"), null);
  assert.equal(readFavoritesCookieValue(""), null);
});
