"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import Artwork from "@/components/common/Artwork";
import { useRouter } from "next/navigation";
import { AdjacentPokemon } from "@/lib/pokeapi";
import { figureStyle } from "@/lib/artwork";
import { formatPokemonHeroName } from "@/lib/pokemon-names";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface PokemonNavigationProps {
  prev: AdjacentPokemon | null;
  next: AdjacentPokemon | null;
  locale: Locale;
}

const spring = "ease-[cubic-bezier(.34,1.56,.64,1)] duration-[350ms]";

// Anterior y siguiente (DESIGN.md §4.4): dos tarjetas grandes al final de la
// ficha, cada una en el field del Pokémon al que lleva. Las flechas del
// teclado también navegan.
export default function PokemonNavigation({ prev, next, locale }: PokemonNavigationProps) {
  const { detail } = getDictionary(locale);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const hrefFor = (name: string) =>
    `/${locale}/pokemon/${(locale === "es" && CANONICAL_TO_SPANISH[name]) || name}`;

  const prevUrl = prev ? hrefFor(prev.name) : null;
  const nextUrl = next ? hrefFor(next.name) : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      ) {
        return;
      }

      const url = e.key === "ArrowLeft" ? prevUrl : e.key === "ArrowRight" ? nextUrl : null;
      if (url) startTransition(() => router.push(url));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevUrl, nextUrl, router]);

  const card = (pokemon: AdjacentPokemon, href: string, label: string, arrow: "←" | "→") => (
    <Link
      href={href}
      data-type={pokemon.types[0] ?? "normal"}
      className={`group type-glow relative flex h-40 md:h-56 flex-col justify-end gap-0.5 rounded-surface bg-field p-4 md:p-8 text-field-ink focus-visible:outline-ink motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5 active:scale-[0.98]`}
    >
      {/* El artwork se recorta en una capa propia para que el brillo de
          hover, que va por fuera de la tarjeta, no quede cortado */}
      <span
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-[inherit] [container-type:size]"
      >
        {/* En móvil la figura sube a la esquina para no tapar el nombre */}
        <span
          className={`absolute [--art-h:52cqh] [--art-y:30%] md:[--art-h:86cqh] md:[--art-y:50%] motion-safe:transition-transform ${spring} motion-safe:group-hover:scale-[1.08] motion-safe:group-focus-visible:scale-[1.08]`}
          style={figureStyle(pokemon.id, {
            height: "var(--art-h)",
            maxWidth: "52cqw",
            centerX: "74%",
            centerY: "var(--art-y)",
          })}
        >
          <Artwork src={pokemon.image} alt="" fill sizes="(min-width: 768px) 260px, 140px" className="object-contain" />
        </span>
      </span>
      <span className="relative text-small font-extrabold">
        {arrow === "←" && <span aria-hidden="true">← </span>}
        {label}
        {arrow === "→" && <span aria-hidden="true"> →</span>}
      </span>
      <span className="relative max-w-[60%] truncate text-lead md:text-head font-black">
        {formatPokemonHeroName(pokemon.name, locale)}
      </span>
      <span className="relative text-small font-bold num">
        {detail.number} {String(pokemon.id).padStart(4, "0")}
      </span>
    </Link>
  );

  if (!prev && !next) return null;

  return (
    <nav aria-label={detail.adjacent} className="grid grid-cols-2 gap-3 md:gap-5">
      {prev && prevUrl ? card(prev, prevUrl, detail.previous, "←") : <span />}
      {next && nextUrl ? card(next, nextUrl, detail.next, "→") : <span />}
    </nav>
  );
}
