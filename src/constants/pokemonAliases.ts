export const MULTILINGUAL_ALIASES: Record<string, string> = {
  // Nombres especiales
  "codigo cero": "type-null",
  "codigo-cero": "type-null",

  // Paradojas Pasado (Gen 9)
  colmilargo: "great-tusk",
  colagrito: "scream-tail",
  furioseta: "brute-bonnet",
  melenaleteo: "flutter-mane",
  reptalada: "slither-wing",
  peliarena: "sandy-shocks",
  bramaluna: "roaring-moon",
  ondulagua: "walking-wake",
  flamalariete: "gouging-fire",
  electrofuror: "raging-bolt",

  // Paradojas Futuro (Gen 9)
  ferrodada: "iron-treads",
  ferrosaco: "iron-bundle",
  ferropalmas: "iron-hands",
  ferrocuello: "iron-jugulis",
  ferropolilla: "iron-moth",
  ferropuas: "iron-thorns",
  ferropaladin: "iron-valiant",
  ferroverdor: "iron-leaves",
  ferromole: "iron-boulder",
  ferrotesta: "iron-crown",
};

export function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Resuelve cualquier slug (sea en español o inglés) al nombre canónico de PokéAPI
export function resolveCanonicalPokemonName(name: string): string {
  const clean = normalizeQuery(name);
  return MULTILINGUAL_ALIASES[clean] || clean;
}

// Mapa inverso: canonical -> slug en español (ej: "great-tusk" -> "colmilargo")
export const CANONICAL_TO_SPANISH: Record<string, string> = Object.fromEntries(
  Object.entries(MULTILINGUAL_ALIASES).map(([es, en]) => [en, es]),
);
