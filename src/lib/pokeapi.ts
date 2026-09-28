import { GENERATIONS } from "@/constants/generations";

const BASE_URL = "https://pokeapi.co/api/v2";
const DEFAULT_REVALIDATE = 86400; // 24 hours

// --- PokéAPI Response Interfaces ---
interface ApiNamedResource {
  name: string;
  url: string;
}

interface ApiPokemonType {
  slot: number;
  type: ApiNamedResource;
}

interface ApiPokemonStat {
  base_stat: number;
  effort: number;
  stat: ApiNamedResource;
}

interface ApiPokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: ApiNamedResource;
}

interface ApiPokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  species?: ApiNamedResource;
  types: ApiPokemonType[];
  stats: ApiPokemonStat[];
  abilities: ApiPokemonAbility[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
}

interface ApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiNamedResource[];
}

interface ApiPokemonSpeciesResponse {
  varieties?: {
    is_default: boolean;
    pokemon: ApiNamedResource;
  }[];
  evolution_chain?: ApiNamedResource;
}

interface ApiEvolutionNode {
  species: { name: string };
  evolution_details?: {
    min_level?: number;
    item?: ApiNamedResource;
    trigger?: ApiNamedResource;
    min_happiness?: number;
    time_of_day?: string;
    held_item?: ApiNamedResource;
    known_move?: ApiNamedResource;
    gender?: number;
    relative_physical_stats?: number;
    party_species?: ApiNamedResource;
    needs_overworld_rain?: boolean;
  }[];
  evolves_to: ApiEvolutionNode[];
}

interface ApiEvolutionChainResponse {
  chain: ApiEvolutionNode;
}

interface ApiTypeResponse {
  pokemon: { pokemon: ApiNamedResource }[];
}

// --- Application Interfaces ---
export interface PokemonSummary {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface PokemonDetail extends PokemonSummary {
  height: number;
  weight: number;
  stats: { name: string; value: number }[];
  abilities: string[];
  shinyImage?: string | null;
  varieties?: PokemonVariety[];
}

export interface EvolutionStage {
  id: number;
  name: string;
  speciesName: string;
  image: string;
  types: string[];
  triggerDetails?: {
    minLevel?: number;
    item?: string;
    trigger: string;
    happiness?: number;
    timeOfDay?: string;
    heldItem?: string;
    knownMove?: string;
    gender?: number;
    relativeStats?: number;
    partySpecies?: string;
    needsOverworldRain?: boolean;
    otherCondition?: string;
  };
  evolvesTo: EvolutionStage[];
}

export interface PokemonVariety {
  name: string;
  label: string;
  isDefault: boolean;
  types: string[];
  image: string;
  shinyImage: string | null;
  stats: { name: string; value: number }[];
  height: number;
  weight: number;
}

export interface AdjacentPokemon {
  id: number;
  name: string;
  image: string;
}

/**
 * Standardized fetch helper for PokéAPI with Next.js caching
 */
async function pokeFetch<T>(
  endpoint: string,
  revalidate = DEFAULT_REVALIDATE,
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}/${endpoint}`;
  const res = await fetch(url, { next: { revalidate } });

  if (!res.ok) {
    throw new Error(`PokéAPI error: ${res.status} at ${url}`);
  }

  return res.json();
}

// 1. Paginated Pokémon list for home grid
export async function getPaginatedPokemonList(
  page: number = 1,
  pageSize: number = 24,
) {
  const MAX_BASE_POKEMON = 1025;
  const offset = (page - 1) * pageSize;
  const currentLimit = Math.min(
    pageSize,
    Math.max(0, MAX_BASE_POKEMON - offset),
  );

  const data = await pokeFetch<ApiListResponse>(
    `pokemon?limit=${currentLimit}&offset=${offset}`,
  );

  const details: PokemonSummary[] = await Promise.all(
    data.results.map(async (item) => {
      const pokeData = await pokeFetch<ApiPokemonResponse>(item.url);
      return {
        id: pokeData.id,
        name: pokeData.name,
        image:
          pokeData.sprites.other?.["official-artwork"]?.front_default ??
          pokeData.sprites.front_default ??
          "/placeholder.png",
        types: pokeData.types.map((t) => t.type.name),
      };
    }),
  );

  return {
    pokemon: details,
    totalCount: MAX_BASE_POKEMON,
    totalPages: Math.ceil(MAX_BASE_POKEMON / pageSize),
    currentPage: page,
  };
}

// 2. Standardized form / variety labeling in English
const VARIETY_SUFFIX_MAP: Record<string, string> = {
  // Regional
  alola: "Alola",
  galar: "Galar",
  hisui: "Hisui",
  paldea: "Paldea",
  "galar-zen": "Galar (Zen Mode)",
  "paldea-combat": "Paldea (Combat Breed)",
  "paldea-blaze": "Paldea (Blaze Breed)",
  "paldea-aqua": "Paldea (Aqua Breed)",

  // Megas / Gigantamax
  mega: "Mega",
  "mega-x": "Mega X",
  "mega-y": "Mega Y",
  gmax: "Gigantamax",

  // Battle Formes
  origin: "Origin Forme",
  therian: "Therian Forme",
  incarnate: "Incarnate Forme",
  zen: "Zen Mode",
  blade: "Blade Forme",
  shield: "Shield Forme",
  attack: "Attack Forme",
  defense: "Defense Forme",
  speed: "Speed Forme",

  // Special Gen 7, 8, 9 forms
  zero: "Zero Form",
  hero: "Hero Form",
  "red-meteor": "Meteor Form (Red)",
  meteor: "Meteor Form",
  disguised: "Disguised Form",
  busted: "Busted Form",
  solo: "Solo Form",
  school: "School Form",
  "full-belly": "Full Belly Mode",
  hangry: "Hangry Mode",
  ice: "Ice Face",
  noice: "Noice Face",
};

function formatVarietyLabel(name: string, baseName: string): string {
  if (name === baseName) return "Base Form";

  const suffix = name.replace(`${baseName}-`, "").toLowerCase();

  if (VARIETY_SUFFIX_MAP[suffix]) return VARIETY_SUFFIX_MAP[suffix];

  return suffix
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Fallbacks para especies cuya forma base requiere un sufijo en /pokemon/
const DEFAULT_FORM_FALLBACKS: Record<string, string> = {
  palafin: "palafin-zero",
  minior: "minior-red-meteor",
  mimikyu: "mimikyu-disguised",
  aegislash: "aegislash-shield",
  wishiwashi: "wishiwashi-solo",
  morpeko: "morpeko-full-belly",
  eiscue: "eiscue-ice",
  darmanitan: "darmanitan-standard",
  "darmanitan-galar": "darmanitan-galar-standard",
};

export async function getPokemonDetail(
  nameOrId: string,
): Promise<PokemonDetail> {
  const queryName = nameOrId.toLowerCase().trim();
  const effectiveLookup = DEFAULT_FORM_FALLBACKS[queryName] || queryName;

  let data: ApiPokemonResponse;

  try {
    data = await pokeFetch<ApiPokemonResponse>(
      `pokemon/${encodeURIComponent(effectiveLookup)}`,
    );
  } catch (error) {
    try {
      const speciesFallback = await pokeFetch<ApiPokemonSpeciesResponse>(
        `pokemon-species/${encodeURIComponent(queryName)}`,
      );
      const defaultVariety =
        speciesFallback.varieties?.find((v) => v.is_default) ||
        speciesFallback.varieties?.[0];

      if (defaultVariety) {
        data = await pokeFetch<ApiPokemonResponse>(defaultVariety.pokemon.url);
      } else {
        throw error;
      }
    } catch {
      throw error;
    }
  }

  const speciesIdentifier = data.species?.name || queryName.split("-")[0];

  let varieties: PokemonVariety[] = [];
  try {
    const speciesData = await pokeFetch<ApiPokemonSpeciesResponse>(
      `pokemon-species/${encodeURIComponent(speciesIdentifier)}`,
    );

    if (speciesData.varieties && speciesData.varieties.length > 1) {
      varieties = await Promise.all(
        speciesData.varieties.map(
          async (v: {
            is_default: boolean;
            pokemon: { name: string; url: string };
          }) => {
            const vData = await pokeFetch<ApiPokemonResponse>(v.pokemon.url);
            return {
              name: vData.name,
              label: formatVarietyLabel(vData.name, speciesIdentifier),
              isDefault: v.is_default,
              types: vData.types.map((t) => t.type.name),
              image:
                vData.sprites.other?.["official-artwork"]?.front_default ??
                vData.sprites.front_default ??
                "/placeholder.png",
              shinyImage:
                vData.sprites.other?.["official-artwork"]?.front_shiny ??
                vData.sprites.front_shiny ??
                null,
              stats: vData.stats.map((s) => ({
                name: s.stat.name,
                value: s.base_stat,
              })),
              height: vData.height / 10,
              weight: vData.weight / 10,
            };
          },
        ),
      );
    }
  } catch (err) {
    console.error("Error fetching varieties:", err);
  }

  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other?.["official-artwork"]?.front_default ??
      data.sprites.front_default ??
      "/placeholder.png",
    shinyImage:
      data.sprites.other?.["official-artwork"]?.front_shiny ??
      data.sprites.front_shiny ??
      null,
    types: data.types.map((t) => t.type.name),
    height: data.height / 10,
    weight: data.weight / 10,
    stats: data.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    abilities: data.abilities.map((a) => a.ability.name),
    varieties,
  };
}

// 3. Recursive evolution tree with English special condition texts
export async function getEvolutionChain(
  pokemonNameOrId: string,
): Promise<EvolutionStage | null> {
  try {
    const speciesData = await pokeFetch<ApiPokemonSpeciesResponse>(
      `pokemon-species/${pokemonNameOrId.toLowerCase()}`,
    );

    if (!speciesData.evolution_chain?.url) return null;

    const evoData = await pokeFetch<ApiEvolutionChainResponse>(
      speciesData.evolution_chain.url,
    );

    const formatNode = async (
      node: ApiEvolutionNode,
    ): Promise<EvolutionStage> => {
      const speciesName = node.species.name.toLowerCase();
      const lookupName = DEFAULT_FORM_FALLBACKS[speciesName] || speciesName;

      let pData: ApiPokemonResponse;
      try {
        pData = await pokeFetch<ApiPokemonResponse>(`pokemon/${lookupName}`);
      } catch {
        pData = await pokeFetch<ApiPokemonResponse>(`pokemon/${speciesName}`);
      }

      let triggerDetails;
      if (node.evolution_details && node.evolution_details.length > 0) {
        const d = node.evolution_details[0];

        let otherCondition: string | undefined = undefined;
        const triggerName = d.trigger?.name;

        const SPECIAL_CONDITIONS: Record<string, string> = {
          annihilape: "Use Rage Fist 20 times",
          sirfetchd: "Land 3 critical hits in one battle",
          kingambit: "Defeat 3 Bisharp holding Leader's Crest",
          overqwil: "Use Barb Barrage in Strong Style 20 times",
          basculegion: "Receive 294+ recoil damage",
          palafin: "Union Circle level-up (Lv. 38+)",
        };

        if (SPECIAL_CONDITIONS[speciesName]) {
          otherCondition = SPECIAL_CONDITIONS[speciesName];
        } else if (triggerName === "other") {
          otherCondition = "Special method";
        }

        triggerDetails = {
          minLevel: d.min_level ?? undefined,
          item: d.item?.name ?? undefined,
          trigger: triggerName ?? "level-up",
          happiness: d.min_happiness ?? undefined,
          timeOfDay: d.time_of_day || undefined,
          heldItem: d.held_item?.name ?? undefined,
          knownMove: d.known_move?.name ?? undefined,
          gender: d.gender ?? undefined,
          relativeStats: d.relative_physical_stats ?? undefined,
          partySpecies: d.party_species?.name ?? undefined,
          needsOverworldRain: d.needs_overworld_rain ?? undefined,
          otherCondition,
        };
      }

      const evolvesTo = await Promise.all(
        node.evolves_to.map((child) => formatNode(child)),
      );

      return {
        id: pData.id,
        name: pData.name,
        speciesName: node.species.name,
        image:
          pData.sprites.other?.["official-artwork"]?.front_default ??
          pData.sprites.front_default ??
          "/placeholder.png",
        types: pData.types.map((t) => t.type.name),
        triggerDetails,
        evolvesTo,
      };
    };

    return formatNode(evoData.chain);
  } catch (error) {
    console.error("Error processing evolution chain:", error);
    return null;
  }
}

// 4. Global index for the search engine
export async function getAllPokemonIndex(): Promise<
  { id: number; name: string }[]
> {
  const data = await pokeFetch<ApiListResponse>(
    "pokemon-species?limit=1025",
    DEFAULT_REVALIDATE * 7,
  );

  return data.results.map((item) => {
    const segments = item.url.split("/").filter(Boolean);
    const id = parseInt(segments[segments.length - 1], 10);
    return { id, name: item.name };
  });
}

// 5. Global search result details with offset and limit pagination
export async function searchPokemonGlobal(
  matches: { id: number; name: string }[],
  offset: number = 0,
  limit: number = 24,
): Promise<{ results: PokemonSummary[]; hasMore: boolean }> {
  const slice = matches.slice(offset, offset + limit);

  const results = await Promise.all(
    slice.map(async (item) => {
      const data = await pokeFetch<ApiPokemonResponse>(`pokemon/${item.id}`);
      return {
        id: data.id,
        name: data.name,
        image:
          data.sprites.other?.["official-artwork"]?.front_default ??
          data.sprites.front_default ??
          "/placeholder.png",
        types: data.types.map((t) => t.type.name),
      };
    }),
  );

  return {
    results,
    hasMore: offset + limit < matches.length,
  };
}

// 6. Summary details for a specific variant
export async function getPokemonVariantSummary(nameOrId: string): Promise<{
  id: number;
  name: string;
  image: string;
  types: string[];
} | null> {
  try {
    const data = await pokeFetch<ApiPokemonResponse>(
      `pokemon/${nameOrId.toLowerCase()}`,
    );
    return {
      id: data.id,
      name: data.name,
      image:
        data.sprites.other?.["official-artwork"]?.front_default ??
        data.sprites.front_default ??
        "/placeholder.png",
      types: data.types.map((t) => t.type.name),
    };
  } catch {
    return null;
  }
}

// 7. Navigation across adjacent Pokémon
export async function getAdjacentPokemon(currentId: number): Promise<{
  prev: AdjacentPokemon | null;
  next: AdjacentPokemon | null;
}> {
  const MAX_POKEMON = 1025;
  const prevId = currentId > 1 ? currentId - 1 : null;
  const nextId = currentId < MAX_POKEMON ? currentId + 1 : null;

  const fetchSummary = async (
    id: number | null,
  ): Promise<AdjacentPokemon | null> => {
    if (!id) return null;
    try {
      const data = await pokeFetch<ApiPokemonResponse>(
        `pokemon/${id}`,
        DEFAULT_REVALIDATE * 7,
      );
      return {
        id: data.id,
        name: data.name,
        image:
          data.sprites.other?.["official-artwork"]?.front_default ??
          data.sprites.front_default ??
          "/placeholder.png",
      };
    } catch {
      return null;
    }
  };

  const [prev, next] = await Promise.all([
    fetchSummary(prevId),
    fetchSummary(nextId),
  ]);

  return { prev, next };
}

// 8. Paginated Pokémon list by Type
export async function getPokemonListByType(
  typeName: string,
  page: number,
  pageSize: number,
) {
  try {
    const data = await pokeFetch<ApiTypeResponse>(
      `type/${typeName.toLowerCase()}`,
      DEFAULT_REVALIDATE * 7,
    );

    const allOfThisType = data.pokemon
      .map((p: { pokemon: { name: string; url: string } }) => {
        const parts = p.pokemon.url.split("/").filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10);
        return { name: p.pokemon.name, id };
      })
      .filter((p: { id: number }) => p.id <= 1025);

    const totalCount = allOfThisType.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;
    const slice = allOfThisType.slice(offset, offset + pageSize);

    const pokemon = await Promise.all(
      slice.map(async (item: { id: number; name: string }) => {
        try {
          const pData = await pokeFetch<ApiPokemonResponse>(
            `pokemon/${item.id}`,
          );
          return {
            id: pData.id,
            name: pData.name,
            image:
              pData.sprites.other?.["official-artwork"]?.front_default ??
              pData.sprites.front_default ??
              "/placeholder.png",
            types: pData.types.map((t) => t.type.name),
          };
        } catch {
          return {
            id: item.id,
            name: item.name,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`,
            types: [typeName.toLowerCase()],
          };
        }
      }),
    );

    return { pokemon, totalPages, totalCount };
  } catch (error) {
    console.error("Error loading Pokémon by type:", error);
    return { pokemon: [], totalPages: 1, totalCount: 0 };
  }
}

// 9. Paginated Pokémon list by Generation
export async function getPokemonListByGen(
  genId: number,
  page: number,
  pageSize: number,
) {
  const genConfig = GENERATIONS.find((g) => g.id === genId);
  if (!genConfig) {
    return { pokemon: [], totalPages: 1, totalCount: 0 };
  }

  const genTotal = genConfig.endId - genConfig.startId + 1;
  const totalPages = Math.ceil(genTotal / pageSize);
  const validPage = Math.min(Math.max(1, page), totalPages);

  const genBaseOffset = genConfig.startId - 1;
  const pageOffset = (validPage - 1) * pageSize;
  const currentOffset = genBaseOffset + pageOffset;

  const remainingInGen = genConfig.endId - (genConfig.startId + pageOffset) + 1;
  const currentLimit = Math.min(pageSize, Math.max(0, remainingInGen));

  try {
    const data = await pokeFetch<ApiListResponse>(
      `pokemon?offset=${currentOffset}&limit=${currentLimit}`,
    );

    const pokemon: PokemonSummary[] = await Promise.all(
      data.results.map(async (item) => {
        const pokeData = await pokeFetch<ApiPokemonResponse>(item.url);
        return {
          id: pokeData.id,
          name: pokeData.name,
          image:
            pokeData.sprites.other?.["official-artwork"]?.front_default ??
            pokeData.sprites.front_default ??
            "/placeholder.png",
          types: pokeData.types.map((t) => t.type.name),
        };
      }),
    );

    return { pokemon, totalPages, totalCount: genTotal };
  } catch (error) {
    console.error("Error loading Pokémon by generation:", error);
    return { pokemon: [], totalPages: 1, totalCount: 0 };
  }
}

// 10. Filtered query (Types + Generation) with pagination
export async function getFilteredPokemonList({
  types = [],
  genId = null,
  page = 1,
  pageSize = 24,
}: {
  types?: string[];
  genId?: number | null;
  page?: number;
  pageSize?: number;
}) {
  try {
    let candidateIds: number[] = [];

    if (types.length > 0) {
      const typeLists = await Promise.all(
        types.map(async (t) => {
          try {
            const data = await pokeFetch<ApiTypeResponse>(
              `type/${t.toLowerCase()}`,
              DEFAULT_REVALIDATE * 7,
            );
            const ids = data.pokemon
              .map((p: { pokemon: { url: string } }) => {
                const parts = p.pokemon.url.split("/").filter(Boolean);
                return parseInt(parts[parts.length - 1], 10);
              })
              .filter((id: number) => id <= 1025);
            return new Set<number>(ids);
          } catch {
            return new Set<number>();
          }
        }),
      );

      const firstSet = typeLists[0];
      candidateIds = Array.from(firstSet).filter((id) =>
        typeLists.every((set) => set.has(id)),
      );
    } else if (genId) {
      const genConfig = GENERATIONS.find((g) => g.id === genId);
      if (genConfig) {
        for (let i = genConfig.startId; i <= genConfig.endId; i++) {
          candidateIds.push(i);
        }
      }
    }

    if (genId && types.length > 0) {
      const genConfig = GENERATIONS.find((g) => g.id === genId);
      if (genConfig) {
        candidateIds = candidateIds.filter(
          (id) => id >= genConfig.startId && id <= genConfig.endId,
        );
      }
    }

    candidateIds.sort((a, b) => a - b);

    const totalCount = candidateIds.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const validPage = Math.min(Math.max(1, page), totalPages);
    const offset = (validPage - 1) * pageSize;
    const paginatedIds = candidateIds.slice(offset, offset + pageSize);

    const pokemon = await Promise.all(
      paginatedIds.map(async (id) => {
        try {
          const pData = await pokeFetch<ApiPokemonResponse>(`pokemon/${id}`);
          return {
            id: pData.id,
            name: pData.name,
            image:
              pData.sprites.other?.["official-artwork"]?.front_default ??
              pData.sprites.front_default ??
              "/placeholder.png",
            types: pData.types.map((t) => t.type.name),
          };
        } catch {
          return {
            id,
            name: `pokemon-${id}`,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            types: types,
          };
        }
      }),
    );

    return { pokemon, totalPages, totalCount };
  } catch (error) {
    console.error("Error in getFilteredPokemonList:", error);
    return { pokemon: [], totalPages: 1, totalCount: 0 };
  }
}

// 11. Canonical Pokémon name formatting
const POKEMON_NAME_MAP: Record<string, string> = {
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

export function formatPokemonDisplayName(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase();

  if (POKEMON_NAME_MAP[lower]) {
    return POKEMON_NAME_MAP[lower];
  }

  const REGIONAL_SUFFIXES = ["-alola", "-galar", "-hisui", "-paldea"];
  for (const suffix of REGIONAL_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      const base = lower.slice(0, -suffix.length);
      const regionName = suffix.replace("-", "");
      const formattedBase =
        POKEMON_NAME_MAP[base] || formatPokemonDisplayName(base);
      const regionCap =
        regionName.charAt(0).toUpperCase() + regionName.slice(1);
      return `${formattedBase} (${regionCap})`;
    }
  }

  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
