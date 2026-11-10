import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  allowedTypos,
  buildSearchEntries,
  prefixDistance,
  rankSearch,
} from "@/lib/fuzzy-search";
import { MULTILINGUAL_ALIASES, normalizeQuery } from "@/constants/pokemonAliases";

// Los 1025 nombres reales (en orden de número) y los alias en español
const index: string[][] = JSON.parse(
  readFileSync(new URL("../data/pokemon-index.json", import.meta.url), "utf8"),
);
const entries = buildSearchEntries(
  index.map((row, i) => ({ id: i + 1, name: row[0] })),
  MULTILINGUAL_ALIASES,
  normalizeQuery,
);
const search = (q: string) => rankSearch(normalizeQuery(q), entries).map((e) => e.name);

test("erratas según el largo: 0 hasta 3 letras, 1 hasta 6 y 2 desde 7", () => {
  assert.deepEqual([1, 3, 4, 6, 7, 12].map(allowedTypos), [0, 0, 1, 1, 2, 2]);
});

test("distancia con el principio del nombre, y el intercambio cuenta uno", () => {
  assert.equal(prefixDistance("pikachu", "pikachu", 2), 0);
  assert.equal(prefixDistance("pikahcu", "pikachu", 2), 1);
  assert.equal(prefixDistance("sucune", "suicune", 1), 1);
  assert.equal(prefixDistance("pikak", "pikachu", 1), 1);
  assert.equal(prefixDistance("charizrd", "charizard", 2), 1);
  assert.equal(prefixDistance("bulbasaur", "pikachu", 2), 3);
});

test("lo que ya funcionaba sigue igual: empieza por, y luego contiene", () => {
  assert.deepEqual(search("suic"), ["suicune"]);
  assert.deepEqual(search("char").slice(0, 3), ["charmander", "charmeleon", "charizard"]);
  assert.deepEqual(search("saur"), ["bulbasaur", "ivysaur", "venusaur"]);
  // Primero los que empiezan por «pi», después los que lo contienen
  const pi = search("pi");
  const firstContains = pi.findIndex((n) => !n.startsWith("pi"));
  assert.ok(firstContains > 0 && pi.slice(firstContains).every((n) => !n.startsWith("pi")));
});

test("con erratas, el más parecido primero", () => {
  for (const [typo, name] of [
    ["pikahcu", "pikachu"],
    ["sucune", "suicune"],
    ["charizrd", "charizard"],
    ["bulbsaur", "bulbasaur"],
    ["gyrados", "gyarados"],
    ["garchmop", "garchomp"],
    ["lucraio", "lucario"],
    ["gengr", "gengar"],
    ["pikak", "pikachu"],
    ["mr mime", "mr-mime"],
  ]) {
    assert.equal(search(typo)[0], name, typo);
  }
});

test("los alias en español también aceptan erratas", () => {
  assert.equal(search("colmilargo")[0], "great-tusk");
  assert.equal(search("colmilrgo")[0], "great-tusk");
  assert.equal(search("codigo cero")[0], "type-null");
});

test("las búsquedas cortas o sin parecido no inventan nada", () => {
  assert.deepEqual(search("pkc"), []);
  assert.deepEqual(search("xq"), []);
  assert.deepEqual(search("zzzzzz"), []);
  assert.deepEqual(search("qwertyuiop"), []);
});
