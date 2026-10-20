"use client";

import { PokemonDetail } from "@/lib/pokeapi";
import { formatPokemonHeroName } from "@/lib/pokemon-names";
import { useReveal } from "@/lib/use-reveal";
import { isPokemonType } from "@/constants/typeColors";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface CompareStatBarsProps {
  pokemon1: PokemonDetail;
  pokemon2: PokemonDetail;
  locale: Locale;
}

const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

// Valor, barra, eje, barra, valor. En móvil el nombre de la estadística sube a
// su propia línea, centrado sobre el eje.
const row =
  "grid grid-cols-[2.75rem_1fr_1fr_2.75rem] items-center gap-x-2 md:grid-cols-[3.5rem_1fr_minmax(7rem,9rem)_1fr_3.5rem] md:gap-x-4";

function primaryType(pokemon: PokemonDetail): string {
  return pokemon.types.map((t) => t.toLowerCase()).find(isPokemonType) ?? "normal";
}

// El ganador de cada estadística se marca con peso 900 y un tamaño más, no con
// color (§4.6)
function valueClass(wins: boolean, base: "body" | "lead"): string {
  if (base === "body") return wins ? "text-lead font-black" : "text-body font-extrabold";
  return wins ? "text-head font-black" : "text-lead font-extrabold";
}

// Estadísticas enfrentadas (DESIGN.md §4.6): panel blanco con las barras que
// crecen desde el eje central, cada una en el color de texto de su Pokémon (deep en claro, glow en oscuro), sobre 255.
// Cada fila crece cuando entra en pantalla, cada vez que se monta el panel: la
// página le da una key por pareja, así que cambiar de Pokémon o de forma las
// repite.
export default function CompareStatBars({ pokemon1, pokemon2, locale }: CompareStatBarsProps) {
  const { compare, detail } = getDictionary(locale);
  const ref = useReveal<HTMLElement>();

  const sides = [pokemon1, pokemon2].map((pokemon) => {
    const values = new Map(pokemon.stats.map((s) => [s.name.toLowerCase(), s.value]));
    return {
      name: formatPokemonHeroName(pokemon.name, locale),
      type: primaryType(pokemon),
      values: STAT_KEYS.map((key) => values.get(key) ?? 0),
      total: pokemon.stats.reduce((sum, s) => sum + s.value, 0),
    };
  });
  const [left, right] = sides;

  return (
    <section
      ref={ref}
      aria-labelledby="compare-stats-title"
      className="rounded-surface bg-surface p-5 text-ink md:p-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="compare-stats-title" className="text-head font-black">
          {detail.baseStats}
        </h2>
        <p className="text-small text-ink-soft">{compare.scaleNote}</p>
      </div>

      {/* Quién es quién: cada nombre en el campo de su tipo, sobre sus barras */}
      <div aria-hidden="true" className="mt-6 grid grid-cols-2 gap-x-4 md:mt-8">
        {sides.map((side, i) => (
          <p
            key={i}
            data-type={side.type}
            className={`max-w-full truncate rounded-pill bg-field px-3.5 py-1 text-small font-extrabold text-field-ink ${i === 0 ? "justify-self-start" : "justify-self-end"}`}
          >
            {side.name}
          </p>
        ))}
      </div>

      <dl className="mt-4">
        {STAT_KEYS.map((key, i) => {
          const a = left.values[i];
          const b = right.values[i];
          return (
            <div key={key} data-reveal="pending" className={`${row} gap-y-1 py-2`}>
              <dt className="col-span-full text-center text-small font-extrabold md:col-span-1 md:col-start-3 md:row-start-1 md:text-body md:font-semibold">
                {detail.statNames[key] ?? key}
              </dt>
              <dd className={`num md:col-start-1 md:row-start-1 ${valueClass(a > b, "body")}`}>
                <span className="sr-only">{left.name}: </span>
                {a}
              </dd>
              <dd
                aria-hidden="true"
                data-type={left.type}
                className="flex h-3 justify-end overflow-hidden rounded-pill bg-step md:col-start-2 md:row-start-1"
              >
                <span
                  className="stat-bar stat-bar-end block h-full w-full rounded-pill bg-field-text"
                  style={{ "--v": Math.min(a / 255, 1) } as React.CSSProperties}
                />
              </dd>
              <dd
                aria-hidden="true"
                data-type={right.type}
                className="h-3 overflow-hidden rounded-pill bg-step md:col-start-4 md:row-start-1"
              >
                <span
                  className="stat-bar block h-full w-full rounded-pill bg-field-text"
                  style={{ "--v": Math.min(b / 255, 1) } as React.CSSProperties}
                />
              </dd>
              <dd className={`num text-right md:col-start-5 md:row-start-1 ${valueClass(b > a, "body")}`}>
                <span className="sr-only">{right.name}: </span>
                {b}
              </dd>
            </div>
          );
        })}

        <div className={`${row} mt-4 gap-y-1 rounded-[18px] bg-step px-3 py-3 md:px-4`}>
          <dt className="col-span-full text-center text-small font-extrabold md:col-span-1 md:col-start-3 md:row-start-1 md:text-body">
            {detail.total}
          </dt>
          <dd className={`num col-span-2 md:col-span-1 md:col-start-1 md:row-start-1 ${valueClass(left.total > right.total, "lead")}`}>
            <span className="sr-only">{left.name}: </span>
            {left.total}
          </dd>
          <dd className={`num col-span-2 text-right md:col-span-1 md:col-start-5 md:row-start-1 ${valueClass(right.total > left.total, "lead")}`}>
            <span className="sr-only">{right.name}: </span>
            {right.total}
          </dd>
        </div>
      </dl>
    </section>
  );
}
