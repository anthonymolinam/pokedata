import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { CARD_GRID } from "@/components/pokemon/PokemonCardSkeleton";
import { searchPokemonGlobal } from "@/lib/pokeapi";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { Locale } from "@/proxy";

// Banco de pruebas de la tarjeta (DESIGN.md §8, paso 4). Solo existe en
// desarrollo. Caterpie, Venusaur, Wailord y Pikachu prueban la normalización
// del artwork; Glaceon, Snorlax, Sylveon y Gengar, los contrastes (§2.3);
// el resto, nombres y etiquetas largas.
const SAMPLES = [
  { id: 10, name: "caterpie" },
  { id: 3, name: "venusaur" },
  { id: 321, name: "wailord" },
  { id: 25, name: "pikachu" },
  { id: 471, name: "glaceon" },
  { id: 143, name: "snorlax" },
  { id: 700, name: "sylveon" },
  { id: 94, name: "gengar" },
  { id: 145, name: "zapdos" },
  { id: 302, name: "sableye" },
  { id: 740, name: "crabominable" },
  { id: 931, name: "squawkabilly" },
];

export const metadata: Metadata = {
  title: "Tarjeta",
  robots: { index: false, follow: false },
};

export default async function CardLabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  const { results } = await searchPokemonGlobal(SAMPLES, 0, SAMPLES.length);

  const hrefFor = (name: string) =>
    `/${locale}/pokemon/${(locale === "es" && CANONICAL_TO_SPANISH[name]) || name}`;

  return (
    <div className="pt-6">
      <h1 className="sr-only">Banco de pruebas de la tarjeta</h1>
      <div className={CARD_GRID}>
        {results.map((pokemon, index) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            href={hrefFor(pokemon.name)}
            locale={locale}
            eager={index < 4}
            headingAs="h2"
          />
        ))}
      </div>
    </div>
  );
}
