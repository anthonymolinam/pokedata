"use client";

import { getDictionary } from "@/constants/translations";
import { useReveal } from "@/lib/use-reveal";
import { Locale } from "@/proxy";

interface BaseStatsProps {
  stats: { name: string; value: number }[];
  primaryType: string;
  locale: Locale;
}

// Estadísticas base (DESIGN.md §4.4): seis filas con el nombre, el valor y la
// barra sobre 255, en el color de texto del tipo principal (deep en claro, glow en oscuro) sobre una pista --step. Cada
// barra crece cuando su fila entra en pantalla, cada vez que se monta el panel
// (la ficha le da una key por Pokémon y forma); sin JavaScript o con
// movimiento reducido se ven ya llenas. Desde 1024px mide lo que su contenido y
// acompaña al desplazar a la columna de Debilidades y Habilidades, más alta.
export default function BaseStats({ stats, primaryType, locale }: BaseStatsProps) {
  const { detail } = getDictionary(locale);
  const ref = useReveal<HTMLElement>();
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <section
      ref={ref}
      aria-labelledby="stats-title"
      data-type={primaryType}
      className="rounded-surface bg-surface p-6 md:p-10 text-ink lg:sticky lg:top-[104px] lg:self-start"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="stats-title" className="text-head font-black">
          {detail.baseStats}
        </h2>
        <p className="text-head font-black num">
          <span className="text-body font-extrabold">{detail.total}</span> {total}
        </p>
      </div>

      <dl className="mt-6 md:mt-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            data-reveal="pending"
            className="grid grid-cols-[minmax(6.5rem,9rem)_2.75rem_1fr] items-center gap-x-3 md:gap-x-5 py-2"
          >
            <dt className="text-body">{detail.statNames[stat.name] ?? stat.name}</dt>
            <dd className="text-body font-black num text-right">{stat.value}</dd>
            <dd aria-hidden="true" className="h-3 overflow-hidden rounded-pill bg-step">
              <span
                className="stat-bar block h-full bg-field-text"
                style={
                  {
                    "--v": Math.min(stat.value / 255, 1),
                  } as React.CSSProperties
                }
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
