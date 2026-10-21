import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getPokemonDetail,
  getEvolutionChain,
  getAdjacentPokemon,
  formatPokemonDisplayName,
} from "@/lib/pokeapi";
import {
  resolveCanonicalPokemonName,
  CANONICAL_TO_SPANISH,
} from "@/constants/pokemonAliases";
import PokemonDetailView from "@/components/pokemon-detail/PokemonDetailView";
import { artworkUrl, spriteUrl } from "@/lib/artwork";
import { pageMetadata } from "@/lib/metadata";
import { Locale } from "@/proxy";

interface PageProps {
  params: Promise<{ locale: string; name: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, name } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { variant } = await searchParams;
  const activePokemonName = resolveCanonicalPokemonName(variant || name);
  const isEs = locale === "es";

  // La ficha es la de la especie de la ruta, en el slug de cada idioma
  // (colmilargo / great-tusk); la forma elegida va en ?variant=
  const speciesSlug = resolveCanonicalPokemonName(name);
  const variantQuery = variant ? `?variant=${encodeURIComponent(variant.toLowerCase())}` : "";
  const paths = {
    es: `/es/pokemon/${encodeURIComponent(CANONICAL_TO_SPANISH[speciesSlug] || speciesSlug)}${variantQuery}`,
    en: `/en/pokemon/${encodeURIComponent(speciesSlug)}${variantQuery}`,
  };

  try {
    const pokemon = await getPokemonDetail(activePokemonName);

    // 1. Resolver nombre visual traducido
    const canonicalLower = pokemon.name.toLowerCase();
    const localizedName =
      isEs && CANONICAL_TO_SPANISH[canonicalLower]
        ? CANONICAL_TO_SPANISH[canonicalLower]
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : formatPokemonDisplayName(pokemon.name);

    // 2. Mapeo localizado de tipos para la descripción
    const TYPE_NAMES_ES: Record<string, string> = {
      normal: "Normal",
      fire: "Fuego",
      water: "Agua",
      grass: "Planta",
      electric: "Eléctrico",
      ice: "Hielo",
      fighting: "Lucha",
      poison: "Veneno",
      ground: "Tierra",
      flying: "Volador",
      psychic: "Psíquico",
      bug: "Bicho",
      rock: "Roca",
      ghost: "Fantasma",
      dragon: "Dragón",
      steel: "Acero",
      dark: "Siniestro",
      fairy: "Hada",
    };

    const typesFormatted = pokemon.types
      .map((t) =>
        (isEs ? TYPE_NAMES_ES[t.toLowerCase()] || t : t).toUpperCase(),
      )
      .join(" / ");

    const description = isEs
      ? `Datos completos de ${localizedName} (#${String(pokemon.id).padStart(4, "0")}) en PokéData: estadísticas base, tabla de debilidades de tipo ${typesFormatted}, habilidades y evoluciones.`
      : `Complete data for ${localizedName} (#${String(pokemon.id).padStart(4, "0")}) on PokéData: base stats, weakness chart for type ${typesFormatted}, abilities, and evolutions.`;

    const imageUrl = pokemon.image ? spriteUrl(pokemon.image) : artworkUrl(pokemon.id);

    return pageMetadata({
      locale,
      title: localizedName,
      description,
      paths,
      keywords: isEs
        ? [
            localizedName.toLowerCase(),
            `estadisticas de ${localizedName.toLowerCase()}`,
            `debilidades de ${localizedName.toLowerCase()}`,
            `evolucion ${localizedName.toLowerCase()}`,
            "pokedex",
            "pokedata",
          ]
        : [
            localizedName.toLowerCase(),
            `${localizedName.toLowerCase()} base stats`,
            `${localizedName.toLowerCase()} weaknesses`,
            `${localizedName.toLowerCase()} evolution`,
            "pokedex",
            "pokedata",
          ],
      image: { url: imageUrl, width: 475, height: 475, alt: localizedName },
    });
  } catch {
    // Sin datos (un slug que no existe responde con la 404 ya en streaming,
    // con estado 200): fuera de los buscadores
    const fallbackFormatted = formatPokemonDisplayName(activePokemonName);
    return pageMetadata({
      locale,
      title: fallbackFormatted,
      description: isEs
        ? `Detalles, estadísticas y evoluciones de ${fallbackFormatted} en PokéData.`
        : `Pokémon details, stats, and evolution for ${fallbackFormatted} on PokéData.`,
      paths,
      index: false,
    });
  }
}

export default async function PokemonPage({ params, searchParams }: PageProps) {
  const { locale, name } = await params;
  const { variant } = await searchParams;

  // Resuelve alias como "colmilargo" -> "great-tusk"
  const canonicalName = resolveCanonicalPokemonName(name);
  const canonicalVariant = variant
    ? resolveCanonicalPokemonName(variant)
    : undefined;

  const BASE_URL = "https://pokeapi.co/api/v2";

  // PokéAPI tarda segundos con lo que no tiene en caché, así que todo se pide
  // a la vez en lugar de en cadena. Las peticiones repetidas (la de la
  // redirección y la de getPokemonDetail) Next las sirve una sola vez. Si al
  // final se redirige, estas promesas se descartan.
  const detailPromise = getPokemonDetail(canonicalName);
  detailPromise.catch(() => {});
  const evolutionPromise = getEvolutionChain(canonicalName).catch(() => null);
  let adjacentPromise: ReturnType<typeof getAdjacentPokemon> | null = null;

  // 1. Redireccionar variantes regionales o formas secundarias a la especie base
  try {
    // Con la misma caché que getPokemonDetail, que pide esta misma URL
    const rawRes = await fetch(
      `${BASE_URL}/pokemon/${encodeURIComponent(canonicalName.toLowerCase())}`,
      { next: { revalidate: 86400 } },
    );
    if (rawRes.ok) {
      const rawData = await rawRes.json();
      const baseSpeciesName = rawData.species?.name;
      adjacentPromise = getAdjacentPokemon(rawData.id).catch(() => ({ prev: null, next: null }));

      if (
        baseSpeciesName &&
        baseSpeciesName.toLowerCase() !== canonicalName.toLowerCase()
      ) {
        // En español, si la especie base tiene alias propio, usamos su slug localizado
        const localizedBaseName =
          locale === "es" && CANONICAL_TO_SPANISH[baseSpeciesName.toLowerCase()]
            ? CANONICAL_TO_SPANISH[baseSpeciesName.toLowerCase()]
            : baseSpeciesName.toLowerCase();

        redirect(
          `/${locale}/pokemon/${localizedBaseName}?variant=${canonicalName.toLowerCase()}`,
        );
      }
    }
  } catch (err) {
    if ((err as Error).message === "NEXT_REDIRECT") throw err;
  }

  // 2. Cargar datos de la especie base
  let pokemon;
  try {
    pokemon = await detailPromise;
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    notFound();
  }

  // Evoluciones y adyacentes, ya en camino desde el principio
  const [evolutionChain, adjacent] = await Promise.all([
    evolutionPromise,
    adjacentPromise ??
      getAdjacentPokemon(pokemon.id).catch(() => ({ prev: null, next: null })),
  ]);

  return (
    <PokemonDetailView
      pokemon={pokemon}
      evolutionChain={evolutionChain}
      initialVariantName={canonicalVariant || variant}
      prevPokemon={adjacent.prev}
      nextPokemon={adjacent.next}
      locale={locale}
    />
  );
}
