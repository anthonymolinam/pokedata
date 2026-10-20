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
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://pokedata-pied.vercel.app";

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

    // 3. Título limpio con absolute
    const title = isEs
      ? `${localizedName} | PokéData`
      : `${localizedName} | PokéData`;

    const description = isEs
      ? `Datos completos de ${localizedName} (#${String(pokemon.id).padStart(4, "0")}) en PokéData: estadísticas base, tabla de debilidades de tipo ${typesFormatted}, habilidades y evoluciones.`
      : `Complete data for ${localizedName} (#${String(pokemon.id).padStart(4, "0")}) on PokéData: base stats, weakness chart for type ${typesFormatted}, abilities, and evoluciones.`;

    const imageUrl = pokemon.image ? spriteUrl(pokemon.image) : artworkUrl(pokemon.id);

    // 4. Slugs limpios sin depender de pokemon.species
    const baseCanonicalSlug = resolveCanonicalPokemonName(pokemon.name);
    const esSlug =
      CANONICAL_TO_SPANISH[baseCanonicalSlug.toLowerCase()] ||
      baseCanonicalSlug.toLowerCase();
    const enSlug = baseCanonicalSlug.toLowerCase();

    const currentPath = `${baseUrl}/${locale}/pokemon/${name}${
      resolvedSearchParams?.variant
        ? `?variant=${resolvedSearchParams.variant}`
        : ""
    }`;

    return {
      title: {
        absolute: title,
      },
      description,
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
      alternates: {
        canonical: currentPath,
        languages: {
          es: `${baseUrl}/es/pokemon/${encodeURIComponent(esSlug)}`,
          en: `${baseUrl}/en/pokemon/${encodeURIComponent(enSlug)}`,
        },
      },
      openGraph: {
        title,
        description,
        url: currentPath,
        siteName: "PokéData",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 475,
            height: 475,
            alt: localizedName,
          },
        ],
      },
      twitter: {
        card: "summary",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    const fallbackFormatted = formatPokemonDisplayName(activePokemonName);
    return {
      title: {
        absolute: `PokéData | ${fallbackFormatted}`,
      },
      description: isEs
        ? `Detalles, estadísticas y evoluciones de ${fallbackFormatted} en PokéData.`
        : `Pokémon details, stats, and evolution for ${fallbackFormatted} on PokéData.`,
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
