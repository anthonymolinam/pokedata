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

interface PageProps {
  params: Promise<{ locale: string; name: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { locale, name } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activePokemonName = resolveCanonicalPokemonName(
    resolvedSearchParams?.variant || name,
  );

  const isEs = locale === "es";

  try {
    const pokemon = await getPokemonDetail(activePokemonName);

    const formattedName = formatPokemonDisplayName(pokemon.name);
    const typesFormatted = pokemon.types
      .map((t) => t.toUpperCase())
      .join(" / ");

    const pageTitle = `${formattedName} | PokéData`;
    const description = isEs
      ? `Estadísticas base, tabla de tipos, habilidades y línea evolutiva de ${formattedName} (Tipo ${typesFormatted}) en PokéData.`
      : `Base stats, type matchups, abilities, and evolution chain for ${formattedName} (Type ${typesFormatted}) on PokéData.`;

    const imageUrl =
      pokemon.image ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    return {
      title: pageTitle,
      description,
      openGraph: {
        title: pageTitle,
        description,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 475,
            height: 475,
            alt: formattedName,
          },
        ],
      },
      twitter: {
        card: "summary",
        title: pageTitle,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    const fallbackFormatted = formatPokemonDisplayName(activePokemonName);
    return {
      title: `${fallbackFormatted} | PokéData`,
      description: isEs
        ? `Detalles, estadísticas y evoluciones de ${fallbackFormatted}.`
        : `Pokémon details, stats, and evolution for ${fallbackFormatted}.`,
    };
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

  // 1. Redireccionar variantes regionales o formas secundarias a la especie base
  try {
    const rawRes = await fetch(
      `${BASE_URL}/pokemon/${encodeURIComponent(canonicalName.toLowerCase())}`,
    );
    if (rawRes.ok) {
      const rawData = await rawRes.json();
      const baseSpeciesName = rawData.species?.name;

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
    pokemon = await getPokemonDetail(canonicalName);
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    notFound();
  }

  // Carga protegida en paralelo de evoluciones y adyacentes
  const [evolutionChain, adjacent] = await Promise.all([
    getEvolutionChain(canonicalName).catch(() => null),
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
