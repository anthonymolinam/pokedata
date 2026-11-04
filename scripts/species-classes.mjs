// Legendarios y singulares de los 1025 Pokémon, para las opciones del dado del
// equipo (DESIGN.md §4.9). Salen de is_legendary e is_mythical de cada especie
// de PokéAPI y se guardan en src/data/species-classes.json como dos listas de
// ids: { "legendary": [144, 145, …], "mythical": [151, …] }. Ultraentes y
// paradoja no los marca PokéAPI: van en src/constants/speciesClasses.ts.
//
// Uso: npm run species-classes
// Son 1025 peticiones a PokéAPI, de 20 en 20.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/species-classes.json");
const API = "https://pokeapi.co/api/v2";
const MAX_ID = 1025;
const BATCH = 20;

async function getJson(path) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${API}/${path}`);
    if (res.ok) return res.json();
    if (attempt === 3) throw new Error(`HTTP ${res.status} en ${path}`);
  }
}

async function main() {
  const legendary = [];
  const mythical = [];
  for (let start = 1; start <= MAX_ID; start += BATCH) {
    const ids = Array.from({ length: Math.min(BATCH, MAX_ID - start + 1) }, (_, i) => start + i);
    const species = await Promise.all(ids.map((id) => getJson(`pokemon-species/${id}`)));
    species.forEach((s, i) => {
      if (s.is_legendary) legendary.push(ids[i]);
      if (s.is_mythical) mythical.push(ids[i]);
    });
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify({ legendary, mythical })}\n`);
  console.log(`${legendary.length} legendarios y ${mythical.length} singulares en ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
