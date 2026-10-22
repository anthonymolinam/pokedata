import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { FORM_LABELS } from "@/constants/formNames";
import type { FormName } from "@/lib/team";

// Nombres de la ficha: el nombre de la especie traducido (Colmilargo en
// español) y la etiqueta de cada forma, que va en una línea aparte (§3).

const POKEMON_SPECIAL_NAMES: Record<string, string> = {
  "ho-oh": "Ho-Oh",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  "porygon-z": "Porygon-Z",
  "wo-chien": "Wo-Chien",
  "chien-pao": "Chien-Pao",
  "ting-lu": "Ting-Lu",
  "chi-yu": "Chi-Yu",
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mr-rime": "Mr. Rime",
  "type-null": "Type: Null",
  "tapu-koko": "Tapu Koko",
  "tapu-lele": "Tapu Lele",
  "tapu-bulu": "Tapu Bulu",
  "tapu-fini": "Tapu Fini",
  "great-tusk": "Great Tusk",
  "scream-tail": "Scream Tail",
  "brute-bonnet": "Brute Bonnet",
  "flutter-mane": "Flutter Mane",
  "slither-wing": "Slither Wing",
  "sandy-shocks": "Sandy Shocks",
  "iron-treads": "Iron Treads",
  "iron-bundle": "Iron Bundle",
  "iron-hands": "Iron Hands",
  "iron-jugulis": "Iron Jugulis",
  "iron-moth": "Iron Moth",
  "iron-thorns": "Iron Thorns",
  "roaring-moon": "Roaring Moon",
  "iron-valiant": "Iron Valiant",
  "walking-wake": "Walking Wake",
  "iron-leaves": "Iron Leaves",
  "gouging-fire": "Gouging Fire",
  "raging-bolt": "Raging Bolt",
  "iron-boulder": "Iron Boulder",
  "iron-crown": "Iron Crown",
};

export function formatPokemonHeroName(name: string, locale: string): string {
  if (!name) return "";
  const lower = name.toLowerCase();

  if (locale === "es" && CANONICAL_TO_SPANISH[lower]) {
    const esName = CANONICAL_TO_SPANISH[lower];
    return esName
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  if (POKEMON_SPECIAL_NAMES[lower]) {
    return POKEMON_SPECIAL_NAMES[lower];
  }

  const REGIONAL_SUFFIXES = ["-alola", "-galar", "-hisui", "-paldea"];
  for (const suffix of REGIONAL_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      const base = lower.slice(0, -suffix.length);
      const region = suffix.replace("-", "");
      const formattedBase =
        POKEMON_SPECIAL_NAMES[base] || formatPokemonHeroName(base, locale);
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      return `${formattedBase} (${formattedRegion})`;
    }
  }

  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Etiqueta en inglés de una forma, a partir de su slug de PokéAPI y el de su
// especie: «rotom-wash» → «Wash». formatVariantLabel la traduce
export function formatVarietyLabel(name: string, baseName: string): string {
  if (name === baseName) return "Base Form";

  const lower = name.toLowerCase();
  const suffix = lower.replace(`${baseName}-`, "");
  const known = FORM_LABELS[lower] ?? FORM_LABELS[suffix];
  if (known) return known[0];

  return suffix
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Nombre de un slug que puede ser una forma, para los títulos de página:
// «rotom-wash» → «Rotom (Lavado)». Busca el corte entre especie y forma
// que la tabla conoce; sin él, es una especie («great-tusk»)
export function formatPokemonSlugName(slug: string, locale: string): string {
  const lower = slug.toLowerCase();
  const parts = lower.split("-");
  for (let i = 1; i < parts.length; i++) {
    const known = FORM_LABELS[lower] ?? FORM_LABELS[parts.slice(i).join("-")];
    if (known) {
      const species = formatPokemonHeroName(parts.slice(0, i).join("-"), locale);
      return `${species} (${known[locale === "es" ? 1 : 0]})`;
    }
  }
  return formatPokemonHeroName(lower, locale);
}

// Etiqueta en inglés → nombre oficial en español, de la misma tabla
const FORM_LABELS_ES = new Map(
  Object.values(FORM_LABELS).map(([en, es]) => [en.toLowerCase(), es]),
);

export function formatVariantLabel(label: string, isEs: boolean): string {
  if (!label) return "";
  if (!isEs) return label;

  const lower = label.trim().toLowerCase();

  const official = FORM_LABELS_ES.get(lower);
  if (official) return official;

  // Etiquetas que no salen de la tabla: la forma base y los nombres completos
  // de las regionales
  const exactMatches: Record<string, string> = {
    default: "Por defecto",
    base: "Forma base",
    "base form": "Forma base",
    "base forme": "Forma base",
    "alolan form": "Forma de Alola",
    "galarian form": "Forma de Galar",
    "hisuian form": "Forma de Hisui",
    "paldean form": "Forma de Paldea",
  };

  if (exactMatches[lower]) {
    return exactMatches[lower];
  }

  // Si termina en "Form" o "Forme" (ej: "X Form"), lo invierte a "Forma X"
  const formMatch = label.match(/^(.*?)\s+(form|forme)$/i);
  if (formMatch) {
    const modifier = formMatch[1];
    const modLower = modifier.toLowerCase();

    if (modLower === "base") return "Forma base";
    if (modLower === "alolan" || modLower === "alola") return "Forma de Alola";
    if (modLower === "galarian" || modLower === "galar")
      return "Forma de Galar";
    if (modLower === "hisuian" || modLower === "hisui") return "Forma de Hisui";
    if (modLower === "paldean" || modLower === "paldea")
      return "Forma de Paldea";

    return `Forma ${modifier}`;
  }

  return label;
}

// Nombre de una forma para el equipo (DESIGN.md §4.9), a partir de la etiqueta
// en inglés de PokéAPI: el corto va en la ficha del campo («Alola», «Mega X»);
// el completo, en title y en el nombre accesible («Forma de Alola»). Solo las
// regionales tienen un nombre completo distinto.
const REGIONAL_FORMS: Record<string, { en: string; es: string }> = {
  alola: { en: "Alolan Form", es: "Forma de Alola" },
  galar: { en: "Galarian Form", es: "Forma de Galar" },
  hisui: { en: "Hisuian Form", es: "Forma de Hisui" },
  paldea: { en: "Paldean Form", es: "Forma de Paldea" },
};

export function formatFormName(label: string, isEs: boolean): FormName {
  const short = formatVariantLabel(label, isEs);
  const regional = REGIONAL_FORMS[label.trim().toLowerCase()];
  return { short, full: regional ? regional[isEs ? "es" : "en"] : short };
}
