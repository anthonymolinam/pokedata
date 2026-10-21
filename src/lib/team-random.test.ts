import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { PokemonIndex } from "@/lib/daily";
import { pickRandomMembers } from "@/lib/team-random";

const index: PokemonIndex = JSON.parse(
  readFileSync(new URL("../data/pokemon-index.json", import.meta.url), "utf8"),
);

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

const typesOf = (name: string) => index.find((row) => row[0] === name)!.slice(1);

test("un equipo vacío se llena con seis especies sin repetir especie ni tipo", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const picked = pickRandomMembers(index, [], 6, seeded(seed));
    assert.equal(picked.length, 6);
    assert.equal(new Set(picked).size, 6);
    const types = picked.flatMap(typesOf);
    assert.equal(new Set(types).size, types.length);
  }
});

test("rellena solo los huecos y no repite las especies ni los tipos que ya hay", () => {
  // Charizard (6) y Gyarados (130)
  const kept = [
    { id: 6, types: ["fire", "flying"] },
    { id: 130, types: ["water", "flying"] },
  ];
  const picked = pickRandomMembers(index, kept, 4, seeded(7));
  assert.equal(picked.length, 4);
  assert.ok(!picked.includes("charizard") && !picked.includes("gyarados"));
  for (const type of picked.flatMap(typesOf)) {
    assert.ok(!["fire", "flying", "water"].includes(type));
  }
});

test("solo devuelve especies, es decir, formas base", () => {
  const picked = pickRandomMembers(index, [], 6, seeded(3));
  for (const name of picked) assert.ok(index.some((row) => row[0] === name));
});
