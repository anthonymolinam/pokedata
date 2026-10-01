export type Locale = "en" | "es";

export const translations = {
  en: {
    nav: {
      pokedex: "Pokédex",
      typeChart: "Type Chart",
      searchPlaceholder: "Search Pokémon...",
    },
    common: {
      forms: "Forms:",
      height: "Height",
      weight: "Weight",
      types: "Types",
      baseStats: "Base Stats",
      evolutionChain: "Evolution Chain",
      loading: "Loading...",
      noResults: "No Pokémon found.",
    },
    stats: {
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      specialAttack: "Sp. Atk",
      specialDefense: "Sp. Def",
      speed: "Speed",
      total: "Total",
    },
  },
  es: {
    nav: {
      pokedex: "Pokédex",
      typeChart: "Tabla de Tipos",
      searchPlaceholder: "Buscar Pokémon...",
    },
    common: {
      forms: "Formas:",
      height: "Altura",
      weight: "Peso",
      types: "Tipos",
      baseStats: "Estadísticas Base",
      evolutionChain: "Línea Evolutiva",
      loading: "Cargando...",
      noResults: "No se encontraron Pokémon.",
    },
    stats: {
      hp: "PS",
      attack: "Ataque",
      defense: "Defensa",
      specialAttack: "Atq. Esp",
      specialDefense: "Def. Esp",
      speed: "Velocidad",
      total: "Total",
    },
  },
} as const;

export function getDictionary(locale: string) {
  return translations[locale === "en" ? "en" : "es"];
}
