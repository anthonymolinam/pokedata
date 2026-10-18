export type Locale = "en" | "es";

export const translations = {
  en: {
    nav: {
      pokedex: "Pokédex",
      typeChart: "Type Chart",
      compare: "Compare",
      searchPlaceholder: "Search Pokémon...",
    },
    footer: {
      disclaimer:
        "PokéData is an unofficial fan-made project created for educational and recreational purposes.",
      trademark:
        "Pokémon, character names, trademarks and associated imagery are intellectual property of Nintendo, Creatures Inc. and GAME FREAK Inc. This website is not affiliated with, endorsed or sponsored by any of them.",
      data: "Data from PokéAPI",
      repo: "GitHub repository",
      commitTitle: "View commit on GitHub",
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
    compare: {
      title: "Pokémon Comparator",
      subtitle: "Compare base stats, types, and matchups head-to-head.",
      selectTitle: "Select Pokémon",
      selectPlaceholder: "Type a name or number (#006, Great Tusk)...",
      selectEmpty: "Start typing to search for a Pokémon.",
      selectPrompt1: "Select Pokémon 1",
      selectPrompt2: "Select Pokémon 2",
      activeBadge: "Active",
      swapTooltip: "Swap sides",
      maxRef: "Max 255",
    },
  },
  es: {
    nav: {
      pokedex: "Pokédex",
      typeChart: "Tabla de tipos",
      compare: "Comparador",
      searchPlaceholder: "Buscar Pokémon...",
    },
    footer: {
      disclaimer:
        "PokéData es un proyecto no oficial hecho por fans con fines educativos y recreativos.",
      trademark:
        "Pokémon, los nombres de personajes, las marcas y las imágenes asociadas son propiedad intelectual de Nintendo, Creatures Inc. y GAME FREAK Inc. Esta web no está afiliada, respaldada ni patrocinada por ninguna de ellas.",
      data: "Datos de PokéAPI",
      repo: "Repositorio en GitHub",
      commitTitle: "Ver el commit en GitHub",
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
    compare: {
      title: "Comparador de Pokémon",
      subtitle: "Compara estadísticas base, tipos y ventajas frente a frente.",
      selectTitle: "Seleccionar Pokémon",
      selectPlaceholder: "Escribe un nombre o número (#006, Colmilargo)...",
      selectEmpty: "Escribe en el buscador para ver sugerencias.",
      selectPrompt1: "Seleccionar Pokémon 1",
      selectPrompt2: "Seleccionar Pokémon 2",
      activeBadge: "Activo",
      swapTooltip: "Invertir posiciones",
      maxRef: "Máx 255",
    },
  },
} as const;

export function getDictionary(locale: string) {
  return translations[locale === "en" ? "en" : "es"];
}
