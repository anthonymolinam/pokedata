import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getPokemonDetail,
  getEvolutionChain,
  getAdjacentPokemon,
  formatPokemonDisplayName,
} from "@/lib/pokeapi";
import PokemonDetailView from "@/components/pokemon-detail/PokemonDetailView";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { name } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activePokemonName = resolvedSearchParams?.variant || name;

  try {
    const pokemon = await getPokemonDetail(activePokemonName);

    const formattedName = formatPokemonDisplayName(pokemon.name);
    const typesFormatted = pokemon.types
      .map((t) => t.toUpperCase())
      .join(" / ");

    const pageTitle = `${formattedName} | PokéData`;
    const description = `Base stats, type matchups, abilities, and evolution chain for ${formattedName} (Type ${typesFormatted}) on PokéData.`;

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
    const fallbackName = name.charAt(0).toUpperCase() + name.slice(1);
    return {
      title: `${fallbackName} | PokéData`,
      description: `Pokémon details, stats, and evolution for ${fallbackName}.`,
    };
  }
}

export default async function PokemonPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const { variant } = await searchParams;

  const BASE_URL = "https://pokeapi.co/api/v2";

  // 1. Redirect regional variants or secondary forms to the base species route
  try {
    const rawRes = await fetch(
      `${BASE_URL}/pokemon/${encodeURIComponent(name.toLowerCase())}`,
    );
    if (rawRes.ok) {
      const rawData = await rawRes.json();
      const baseSpeciesName = rawData.species?.name;

      if (
        baseSpeciesName &&
        baseSpeciesName.toLowerCase() !== name.toLowerCase()
      ) {
        redirect(`/pokemon/${baseSpeciesName}?variant=${name.toLowerCase()}`);
      }
    }
  } catch (err) {
    if ((err as Error).message === "NEXT_REDIRECT") throw err;
  }

  // 2. Fetch base species detail data
  let pokemon;
  try {
    pokemon = await getPokemonDetail(name);
  } catch (error) {
    console.error("Error fetching Pokémon details:", error);
    notFound();
  }

  // Parallel loading of evolution chain and adjacent pagination items
  const [evolutionChain, adjacent] = await Promise.all([
    getEvolutionChain(name),
    getAdjacentPokemon(pokemon.id),
  ]);

  return (
    <PokemonDetailView
      pokemon={pokemon}
      evolutionChain={evolutionChain}
      initialVariantName={variant}
      prevPokemon={adjacent.prev}
      nextPokemon={adjacent.next}
    />
  );
}
