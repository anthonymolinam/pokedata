import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { PokemonSummary, formatPokemonDisplayName } from "@/lib/pokeapi";
import PokemonCard from "@/components/pokemon/PokemonCard";
import FavoriteButton from "@/components/common/FavoriteButton";
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
  // Con ?fav=1 (§4.10): cuántos favoritos hay guardados, para elegir el estado
  // vacío, y la portada sin ?fav=1 para «Ver todos»
  favoritesView?: { saved: number; showAllHref: string };
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
  favoritesView,
}: PokemonGridProps) {
  const { grid, favorites } = getDictionary(locale);

  const getPokemonUrl = (name: string) => {
    const cleanName = name.toLowerCase();
    const slug =
      locale === "es" && CANONICAL_TO_SPANISH[cleanName]
        ? CANONICAL_TO_SPANISH[cleanName]
        : cleanName;

    return `/${locale}/pokemon/${slug}`;
  };

  // Estados vacíos de favoritos (§4.10): el del §4.3 con el corazón encima.
  // Sin ninguno guardado, «Ver todos» quita solo ?fav=1; con favoritos que no
  // coinciden, «Quitar los demás filtros» deja solo ?fav=1.
  if (initialList.length === 0 && favoritesView) {
    const none = favoritesView.saved === 0;
    return (
      <div className="py-24 text-center">
        <Heart
          aria-hidden="true"
          strokeWidth={2.5}
          className="mx-auto mb-5 size-10 text-ink-soft"
        />
        <p className="text-lead font-black">
          {none ? favorites.emptyTitle : favorites.noMatchTitle}
        </p>
        {none && <p className="mt-2 text-body">{favorites.emptyBody}</p>}
        <Link
          href={none ? favoritesView.showAllHref : `/${locale}?fav=1`}
          scroll={false}
          className={`${secondary} mt-6`}
        >
          {none ? favorites.showAll : favorites.clearOthers}
        </Link>
      </div>
    );
  }

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
              favorite
              favoriteSlot={
                // Hermano del enlace, encima de la zona reservada (§4.10): en
                // la rejilla, el número de la tarjeta es el de la especie. En
                // la fila del nombre (≥ 18rem) su centro va al de las cifras,
                // que en Nunito 900 está a 0.47em de la parte de arriba. En la
                // vista de favoritos se ve siempre: al desmarcar, la tarjeta y
                // su corazón vacío se quedan hasta la próxima navegación
                <FavoriteButton
                  speciesId={pokemon.id}
                  label={favorites.cardButton.replace(
                    "{name}",
                    formatPokemonDisplayName(pokemon.name),
                  )}
                  className={`card-heart ${favoritesView ? "card-heart-keep" : ""} absolute right-(--card-pad) top-[calc(62cqi+0.75rem)] @min-[18rem]:top-[calc(62cqi+0.75rem+0.47*var(--name-inline)-1rem)] z-20 size-8 before:absolute before:-top-3 before:-inset-x-1.5 before:bottom-0`}
                />
              }
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
