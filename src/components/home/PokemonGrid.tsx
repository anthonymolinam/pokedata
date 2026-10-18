import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PokemonSummary } from "@/lib/pokeapi";
import PokemonCard from "@/components/pokemon/PokemonCard";
import { CARD_GRID } from "@/components/pokemon/PokemonCardSkeleton";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Solo las 24 primeras tarjetas entran con el «pop» (§6)
const POP_LIMIT = 24;

// Botones de la dirección Pop (§4.0): pastilla, pulsación a 0.96
const pill =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-pill font-extrabold text-small active:scale-[0.96] motion-safe:transition-transform duration-150";
const secondary = `${pill} bg-ink text-bone`;

interface PokemonGridProps {
  initialList: PokemonSummary[];
  currentPage?: number;
  totalPages?: number;
  prevPageHref?: string;
  nextPageHref?: string;
  locale: Locale;
}

// Rejilla de la portada (DESIGN.md §4.3): tarjetas, estado vacío y
// paginación. La búsqueda y los filtros llegan ya resueltos desde la URL.
export default function PokemonGrid({
  initialList,
  currentPage = 1,
  totalPages = 1,
  prevPageHref,
  nextPageHref,
  locale,
}: PokemonGridProps) {
  const { grid } = getDictionary(locale);

  const getPokemonUrl = (name: string) => {
    const cleanName = name.toLowerCase();
    const slug =
      locale === "es" && CANONICAL_TO_SPANISH[cleanName]
        ? CANONICAL_TO_SPANISH[cleanName]
        : cleanName;

    return `/${locale}/pokemon/${slug}`;
  };

  if (initialList.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lead font-black">{grid.empty}</p>
        <Link href={`/${locale}`} scroll={false} className={`${secondary} mt-6`}>
          {grid.clearFilters}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className={CARD_GRID}>
        {initialList.map((pokemon, index) => (
          <li
            key={pokemon.id}
            className={index < POP_LIMIT ? "card-pop" : undefined}
            style={{ "--i": index } as CSSProperties}
          >
            <PokemonCard
              pokemon={pokemon}
              href={getPokemonUrl(pokemon.name)}
              locale={locale}
              eager={index < 4}
              headingAs="h3"
            />
          </li>
        ))}
      </ul>

      {/* Paginación (§4.3): pastillas secundarias y «3 / 43» en 800 tabular */}
      {totalPages > 1 && (
        <nav
          aria-label={grid.pagination}
          className="flex items-center justify-center gap-4 pt-16 md:pt-20"
        >
          {prevPageHref ? (
            <Link href={prevPageHref} className={secondary}>
              <ChevronLeft aria-hidden="true" strokeWidth={2.75} className="size-4 -ml-1" />
              {grid.previous}
            </Link>
          ) : (
            <span aria-disabled="true" className={`${pill} bg-step text-ink-soft`}>
              <ChevronLeft aria-hidden="true" strokeWidth={2.75} className="size-4 -ml-1" />
              {grid.previous}
            </span>
          )}

          <p className="font-extrabold num">
            <span aria-hidden="true">
              {currentPage} / {totalPages}
            </span>
            <span className="sr-only">
              {grid.page} {currentPage} {grid.of} {totalPages}
            </span>
          </p>

          {nextPageHref ? (
            <Link href={nextPageHref} className={secondary}>
              {grid.next}
              <ChevronRight aria-hidden="true" strokeWidth={2.75} className="size-4 -mr-1" />
            </Link>
          ) : (
            <span aria-disabled="true" className={`${pill} bg-step text-ink-soft`}>
              {grid.next}
              <ChevronRight aria-hidden="true" strokeWidth={2.75} className="size-4 -mr-1" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
