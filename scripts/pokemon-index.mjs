// Índice ligero id → nombre y tipos de los 1025 Pokémon (formas por defecto),
// para el Pokémon del día y el dado (DESIGN.md §4.2). Se guarda en
// src/data/pokemon-index.json como una lista en orden de id:
// [["bulbasaur", "grass", "poison"], ["ivysaur", "grass", "poison"], …]
//
// Uso: npm run pokemon-index
// Son 19 peticiones a PokéAPI: la lista de especies y los 18 tipos.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/pokemon-index.json");
const API = "https://pokeapi.co/api/v2";
const MAX_ID = 1025;

// El mismo orden que POKEMON_TYPES en src/constants/typeChart.ts
const TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
];

const idFromUrl = (url) => Number(url.split("/").filter(Boolean).pop());

async function getJson(path) {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

async function main() {
  const species = await getJson(`pokemon-species?limit=${MAX_ID}`);
  const index = Array.from({ length: MAX_ID }, () => null);
  for (const { name, url } of species.results) {
    const id = idFromUrl(url);
    if (id <= MAX_ID) index[id - 1] = { name, types: [] };
  }

  // Cada tipo lista sus Pokémon con el hueco que ocupa (primer o segundo tipo)
  const typeLists = await Promise.all(TYPES.map((type) => getJson(`type/${type}`)));
  typeLists.forEach((data, i) => {
    for (const { pokemon, slot } of data.pokemon) {
      const id = idFromUrl(pokemon.url);
      if (id <= MAX_ID && index[id - 1]) index[id - 1].types[slot - 1] = TYPES[i];
    }
  });

  const missing = index.flatMap((entry, i) =>
    !entry || entry.types.filter(Boolean).length === 0 ? [i + 1] : [],
  );
  if (missing.length) throw new Error(`Sin datos para: ${missing.join(", ")}`);

  const rows = index.map(({ name, types }) => [name, ...types.filter(Boolean)]);
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `[\n${rows.map((r) => JSON.stringify(r)).join(",\n")}\n]\n`);
  console.log(`${rows.length} Pokémon en ${OUT}`);
}

main();
