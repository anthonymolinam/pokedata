"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatPokemonDisplayName } from "@/lib/pokeapi";
import { artworkUrl, figureStyle } from "@/lib/artwork";
import { pickDistinctTypes, type DailyPokemon as Daily } from "@/lib/daily";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

const BOUNCE = [0.34, 1.56, 0.64, 1] as const;

// Dado dibujado: cara del cinco con esquinas redondeadas
function Die() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-6">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="var(--ink)" />
      {[
        [8, 8],
        [16, 8],
        [12, 12],
        [8, 16],
        [16, 16],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill="var(--surface)" />
      ))}
    </svg>
  );
}

interface DailyPokemonProps {
  locale: Locale;
  today: Daily[];
}

// Pokémon del día (DESIGN.md §4.2): tres columnas en el color de su tipo
// principal, cada una un enlace a la ficha, y un dado que baraja otros tres
// con la misma regla de tipos distintos. Lo barajado no se guarda.
export default function DailyPokemon({ locale, today }: DailyPokemonProps) {
  const reduceMotion = useReducedMotion();
  const { hero, card } = getDictionary(locale);
  // Solo el dado cambia lo que se ve: buscar o filtrar vuelve a renderizar la
  // página y trae un `today` nuevo, pero con los mismos Pokémon
  const [shuffled, setShuffled] = useState<Daily[] | null>(null);
  const [spins, setSpins] = useState(0);
  const shown = shuffled ?? today;

  const shuffle = async () => {
    setSpins((n) => n + 1);
    // El índice id → tipos solo se descarga la primera vez que se usa el dado
    const { default: index } = await import("@/data/pokemon-index.json");
    setShuffled(pickDistinctTypes(index, Math.random));
  };

  const hrefFor = (name: string) =>
    `/${locale}/pokemon/${(locale === "es" && CANONICAL_TO_SPANISH[name]) || name}`;

  return (
    <section aria-labelledby="daily-title" className="flex flex-col">
      <div className="flex items-center gap-3 min-h-11 md:min-h-12 mb-2 md:mb-3">
        <div className="flex flex-wrap items-baseline gap-x-3 min-w-0">
          <h2 id="daily-title" className="text-lead font-black">
            {hero.daily}
          </h2>
          {shuffled && (
            <button
              type="button"
              onClick={() => setShuffled(null)}
              className="font-extrabold text-small underline underline-offset-4 decoration-2 cursor-pointer"
            >
              {hero.backToToday}
            </button>
          )}
        </div>
        <motion.button
          type="button"
          aria-label={hero.shuffle}
          onClick={shuffle}
          animate={{ rotate: reduceMotion ? 0 : spins * 360 }}
          transition={{ duration: 0.5, ease: BOUNCE }}
          whileTap={{ scale: 0.92 }}
          className="ml-auto grid place-items-center size-11 md:size-12 shrink-0 rounded-pill bg-surface cursor-pointer"
        >
          <Die />
        </motion.button>
      </div>

      <ul className="grid grid-cols-3 gap-2 md:gap-3">
        {shown.map((pokemon, i) => (
          <li key={i} className="h-[150px] md:h-[280px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pokemon.id}
                className="h-full"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.2, delay: i * 0.06 },
                  y: { duration: 0.45, ease: BOUNCE, delay: i * 0.06 },
                }}
              >
                <Link
                  href={hrefFor(pokemon.name)}
                  aria-label={`${hero.viewCard} ${formatPokemonDisplayName(pokemon.name)}`}
                  data-type={pokemon.types[0]}
                  className="group relative flex h-full items-end p-2.5 md:p-4 overflow-hidden rounded-surface bg-field text-ink [container-type:size] focus-visible:outline-ink motion-safe:transition-transform duration-[350ms] ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:-translate-y-1.5 active:scale-[0.98]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute motion-safe:transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:group-hover:scale-[1.06] motion-safe:group-hover:-rotate-3"
                    style={figureStyle(pokemon.id, {
                      height: "96cqh",
                      maxWidth: "150cqw",
                      centerX: "50%",
                      centerY: "44%",
                    })}
                  >
                    <Image
                      src={artworkUrl(pokemon.id)}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 300px, 160px"
                      loading="eager"
                      className="object-contain"
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative flex max-w-full items-baseline gap-1.5 rounded-pill bg-surface px-3 py-1 md:px-3.5 md:py-1.5"
                  >
                    <span className="truncate font-black text-small md:text-body">
                      {formatPokemonDisplayName(pokemon.name)}
                    </span>
                    <span className="hidden num font-bold text-small @min-[11rem]:inline">
                      {card.number} {pokemon.id}
                    </span>
                  </span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </section>
  );
}
