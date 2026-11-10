import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  countResults,
  getFilteredIds,
  getSearchMatches,
  homeQueryKey,
  homeQueryParams,
  needsBrowserFavorites,
  parseBrowserFavoritesQuery,
  parseHomeQuery,
  type HomeQueryDeps,
  type Query,
} from "@/lib/home-query";
import { encodeFavoritesCookie } from "@/lib/favorites";
import { GENERATIONS } from "@/constants/generations";

// Datos sin red: el índice local (nombre y tipos, en orden de número) hace de
// PokéAPI para los tipos y la búsqueda
const index: string[][] = JSON.parse(
  readFileSync(new URL("../data/pokemon-index.json", import.meta.url), "utf8"),
);

const deps: HomeQueryDeps = {
  async searchPokemonMatches(q) {
    const clean = q.toLowerCase();
    if (/^\d+$/.test(clean)) {
      const id = Number(clean);
      return index[id - 1] ? [{ id, name: index[id - 1][0] }] : [];
    }
    return index
      .map((row, i) => ({ id: i + 1, name: row[0] }))
      .filter((p) => p.name.includes(clean));
  },
  async getFilteredPokemonIds({ types, genId }) {
    const gen = GENERATIONS.find((g) => g.id === genId);
    return index
      .map((row, i) => ({ id: i + 1, types: row.slice(1) }))
      .filter((p) => types.every((t) => p.types.includes(t)))
      .filter((p) => !gen || (p.id >= gen.startId && p.id <= gen.endId))
      .map((p) => p.id);
  },
};

// Bulbasaur, Charizard, Pikachu, Mewtwo, Typhlosion, Garchomp, Gholdengo
const FAVORITES = [1, 6, 25, 150, 157, 445, 1000];

const query = (over: Partial<Query> = {}): Query => ({
  types: [],
  genId: null,
  q: "",
  fav: true,
  favorites: FAVORITES,
  ...over,
});

const ids = (list: { id: number }[]) => list.map((m) => m.id);

// --- Lectura de la URL y la cookie ---

test("la cookie solo se lee con ?fav=1", async () => {
  let reads = 0;
  const read = async () => {
    reads++;
    return encodeFavoritesCookie(FAVORITES);
  };
  const without = await parseHomeQuery({ gen: "1", fav: "true" }, read);
  assert.equal(reads, 0);
  assert.equal(without.fav, false);
  assert.equal(without.favorites, null);

  const withFav = await parseHomeQuery({ gen: "1", fav: "1" }, read);
  assert.equal(reads, 1);
  assert.equal(withFav.fav, true);
  assert.deepEqual(withFav.favorites, FAVORITES);
  assert.equal(withFav.genId, 1);
});

test("con ?fav=1 y la cookie ausente o inválida no se filtra y pasa al navegador", async () => {
  for (const cookie of [undefined, null, "", "2.AQ", "1.%%", "1." + "A".repeat(4000)]) {
    const q = await parseHomeQuery({ fav: "1" }, async () => cookie);
    assert.equal(q.favorites, null, String(cookie).slice(0, 10));
    assert.equal(needsBrowserFavorites(q), true);
  }
  // "1." es una lista vacía válida: el servidor filtra y da 0
  const empty = await parseHomeQuery({ fav: "1" }, async () => "1.");
  assert.deepEqual(empty.favorites, []);
  assert.equal(needsBrowserFavorites(empty), false);
  assert.equal(await countResults(empty, deps), 0);
});

// --- Intersecciones ---

test("solo favoritos: sus números en orden", async () => {
  assert.deepEqual(await getFilteredIds(query(), deps), FAVORITES);
  assert.equal(await countResults(query(), deps), FAVORITES.length);
});

test("favoritos con región", async () => {
  assert.deepEqual(await getFilteredIds(query({ genId: 1 }), deps), [1, 6, 25, 150]);
  assert.deepEqual(await getFilteredIds(query({ genId: 2 }), deps), [157]);
});

test("favoritos con tipos", async () => {
  assert.deepEqual(await getFilteredIds(query({ types: ["fire"] }), deps), [6, 157]);
  assert.deepEqual(await getFilteredIds(query({ types: ["fire", "flying"] }), deps), [6]);
  assert.deepEqual(
    await getFilteredIds(query({ types: ["dragon"], genId: 4 }), deps),
    [445],
  );
});

test("favoritos con búsqueda", async () => {
  // «char» da Charmander, Charmeleon, Charizard…; de los favoritos solo Charizard
  assert.deepEqual(ids(await getSearchMatches(query({ q: "char" }), deps)), [6]);
  assert.deepEqual(ids(await getSearchMatches(query({ q: "25" }), deps)), [25]);
  assert.equal(await countResults(query({ q: "char" }), deps), 1);
  // Búsqueda, tipos y región a la vez
  assert.deepEqual(
    ids(await getSearchMatches(query({ q: "o", types: ["fire"], genId: 2 }), deps)),
    [157],
  );
});

test("la intersección vacía da 0, no todos", async () => {
  assert.deepEqual(await getFilteredIds(query({ genId: 3 }), deps), []);
  assert.deepEqual(await getFilteredIds(query({ types: ["ice"] }), deps), []);
  assert.deepEqual(await getSearchMatches(query({ q: "squirtle" }), deps), []);
  assert.equal(await countResults(query({ q: "squirtle" }), deps), 0);
  assert.equal(await countResults(query({ favorites: [] }), deps), 0);
  assert.equal(await countResults(query({ favorites: [], types: ["fire"] }), deps), 0);
});

test("sin ?fav=1 todo sigue como antes", async () => {
  const none = query({ fav: false, favorites: null });
  assert.equal(await getFilteredIds(none, deps), null);
  assert.equal(await countResults(none, deps), 1025);
  assert.equal(await countResults({ ...none, genId: 1 }, deps), 151);
  assert.equal(
    (await getSearchMatches({ ...none, q: "char" }, deps)).length,
    (await deps.searchPokemonMatches("char")).length,
  );
});

// --- Paginación y Suspense ---

test("la paginación lleva ?fav=1 y nunca la lista", () => {
  const params = homeQueryParams(query({ genId: 1, types: ["fire"], q: "char" }));
  assert.equal(params.get("fav"), "1");
  assert.equal(params.get("gen"), "1");
  assert.equal(params.get("types"), "fire");
  assert.equal(params.get("q"), "char");
  assert.equal([...params.keys()].length, 4);
  assert.equal(homeQueryParams(query({ fav: false, favorites: null })).has("fav"), false);
});

test("la clave de Suspense cambia con ?fav=1 y con los favoritos", () => {
  const keys = new Set([
    homeQueryKey(query({ fav: false, favorites: null })),
    homeQueryKey(query()),
    homeQueryKey(query({ favorites: [25] })),
    homeQueryKey(query({ favorites: null })),
    homeQueryKey(query({ genId: 1 })),
  ]);
  assert.equal(keys.size, 5);
  assert.equal(homeQueryKey(query()), homeQueryKey(query({ favorites: [...FAVORITES] })));
});

// --- Modo navegador: GET /api/home?fav=<mapa de bits> ---

test("modo navegador: la lista llega en ?fav= y da lo mismo que la cookie", async () => {
  const fav = encodeFavoritesCookie(FAVORITES);
  const combos: [string, Partial<Query>][] = [
    ["", {}],
    ["gen=1", { genId: 1 }],
    ["types=fire", { types: ["fire"] }],
    ["q=char", { q: "char" }],
    ["gen=9&types=water", { genId: 9, types: ["water"] }],
  ];
  for (const [extra, over] of combos) {
    const browser = parseBrowserFavoritesQuery(new URLSearchParams(`fav=${fav}&${extra}`));
    assert.ok(browser);
    assert.deepEqual(browser, query(over));
    assert.equal(await countResults(browser, deps), await countResults(query(over), deps));
  }
});

test("modo navegador: ?fav= que falta o no es válido no se adivina", () => {
  for (const fav of ["", "1", "2.AQ", "1.@@", "1." + "A".repeat(4000), "1." + "_".repeat(200)]) {
    assert.equal(parseBrowserFavoritesQuery(new URLSearchParams({ fav })), null, fav.slice(0, 12));
  }
  assert.equal(parseBrowserFavoritesQuery(new URLSearchParams("gen=1")), null);
  assert.deepEqual(parseBrowserFavoritesQuery(new URLSearchParams("fav=1."))?.favorites, []);
});
