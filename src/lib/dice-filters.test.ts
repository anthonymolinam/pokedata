import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { PokemonIndex } from "@/lib/daily";
import { pickRandomMembers } from "@/lib/team-random";
import {
  DEFAULT_DICE_FILTERS,
  diceAllows,
  parseDiceFilters,
  serializeDiceFilters,
  type DiceFilters,
} from "@/lib/dice-filters";
import { PARADOX, SPECIES_CLASS_KEYS, ULTRA_BEASTS, speciesClass } from "@/constants/speciesClasses";

const index: PokemonIndex = JSON.parse(
  readFileSync(new URL("../data/pokemon-index.json", import.meta.url), "utf8"),
);
const idOf = new Map(index.map((row, i) => [row[0], i + 1]));

// Generador fijo para que la prueba no dependa de la suerte
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Las 16 combinaciones de las cuatro opciones
const combinations: DiceFilters[] = Array.from({ length: 16 }, (_, mask) =>
  Object.fromEntries(SPECIES_CLASS_KEYS.map((key, bit) => [key, Boolean(mask & (1 << bit))])) as DiceFilters,
);

test("las listas propias apuntan a las especies que dicen", () => {
  assert.deepEqual(
    ULTRA_BEASTS.map((id) => index[id - 1][0]),
    ["nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon"],
  );
  for (const id of PARADOX) assert.match(index[id - 1][0], /^(iron-|great-tusk|scream-tail|brute-bonnet|flutter-mane|slither-wing|sandy-shocks|roaring-moon|walking-wake|gouging-fire|raging-bolt)/);
  assert.equal(speciesClass(idOf.get("mewtwo")!), "legendary");
  assert.equal(speciesClass(idOf.get("mew")!), "mythical");
  assert.equal(speciesClass(idOf.get("koraidon")!), "legendary");
  assert.equal(speciesClass(idOf.get("pikachu")!), null);
});

test("cientos de equipos con cada combinación de opciones las respetan", () => {
  for (const filters of combinations) {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 150; seed++) {
      const picked = pickRandomMembers(index, [], 6, seeded(seed), (id) => diceAllows(id, filters));
      assert.equal(picked.length, 6);
      assert.equal(new Set(picked).size, 6);
      for (const name of picked) {
        const kind = speciesClass(idOf.get(name)!);
        if (kind) seen.add(kind);
        assert.ok(kind === null || filters[kind], `${name} (${kind}) con ${JSON.stringify(filters)}`);
      }
    }
    // Con un filtro abierto, el dado puede sacar esa clase: con tantos
    // equipos, aparece al menos una vez
    for (const key of SPECIES_CLASS_KEYS) {
      if (filters[key]) assert.ok(seen.has(key), `nunca salió ${key} con ${JSON.stringify(filters)}`);
    }
  }
});

test("también al rellenar huecos de un equipo a medias", () => {
  // Mewtwo, metido a mano, se queda aunque el dado no saque legendarios
  const kept = [{ id: idOf.get("mewtwo")!, types: ["psychic"] }];
  for (let seed = 1; seed <= 100; seed++) {
    const picked = pickRandomMembers(index, kept, 5, seeded(seed), (id) => diceAllows(id, DEFAULT_DICE_FILTERS));
    assert.equal(picked.length, 5);
    assert.ok(!picked.includes("mewtwo"));
    for (const name of picked) assert.ok(diceAllows(idOf.get(name)!, DEFAULT_DICE_FILTERS), name);
  }
});

test("con muy pocas especies permitidas devuelve las que haya, sin fallar", () => {
  const few = new Set([idOf.get("bulbasaur")!, idOf.get("charmander")!, idOf.get("squirtle")!]);
  const picked = pickRandomMembers(index, [], 6, seeded(1), (id) => few.has(id));
  assert.deepEqual([...picked].sort(), ["bulbasaur", "charmander", "squirtle"]);
  // Las tres ya en el equipo: no queda ninguna
  const kept = [...few].map((id) => ({ id, types: index[id - 1].slice(1) }));
  assert.deepEqual(pickRandomMembers(index, kept, 3, seeded(2), (id) => few.has(id)), []);
  assert.deepEqual(pickRandomMembers(index, [], 6, seeded(3), () => false), []);
});

test("las opciones guardadas se leen con los valores por defecto de respaldo", () => {
  assert.deepEqual(parseDiceFilters(null), DEFAULT_DICE_FILTERS);
  assert.deepEqual(parseDiceFilters("{roto"), DEFAULT_DICE_FILTERS);
  assert.deepEqual(parseDiceFilters(JSON.stringify({ v: 9, include: {} })), DEFAULT_DICE_FILTERS);
  assert.deepEqual(parseDiceFilters(JSON.stringify({ v: 1, include: { legendary: true, paradox: "sí" } })), {
    ...DEFAULT_DICE_FILTERS,
    legendary: true,
  });
  for (const filters of combinations) assert.deepEqual(parseDiceFilters(serializeDiceFilters(filters)), filters);
});
