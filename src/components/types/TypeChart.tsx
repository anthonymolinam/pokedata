import Link from "next/link";
import { Check, X } from "lucide-react";
import { POKEMON_TYPES, TYPE_CHART, type PokemonType } from "@/constants/typeChart";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface TypeChartProps {
  locale: Locale;
  basePath: string;
  // Tipo elegido (?type=fire) o null
  selected: PokemonType | null;
}

type Dictionary = ReturnType<typeof getDictionary>;

const press = "active:scale-[0.96] motion-safe:transition-transform duration-150";

// Enlace a la misma página con otro tipo elegido; sin tipo, vuelve a la tabla
// sin selección. Funciona igual sin JavaScript.
const hrefFor = (basePath: string, type: PokemonType | null) =>
  type ? `${basePath}?type=${type}` : basePath;

// Tabla de tipos (DESIGN.md §4.5): cabecera que se pinta en el field del tipo
// elegido, el selector con los 18 bloques y la matriz 18×18. La selección vive
// en la URL (?type=), así que se puede compartir.
export default function TypeChart({ locale, basePath, selected }: TypeChartProps) {
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <TypeHeader dict={dict} basePath={basePath} selected={selected} />
      <TypeSelector dict={dict} basePath={basePath} selected={selected} />
      <TypeMatrix dict={dict} basePath={basePath} selected={selected} />
    </div>
  );
}

interface PartProps {
  dict: Dictionary;
  basePath: string;
  selected: PokemonType | null;
}

// Cabecera: en blanco sin selección; con un tipo elegido, su field y el resumen
// de lo que hace al atacar y al defender
function TypeHeader({ dict, basePath, selected }: PartProps) {
  const { typeChart: t, typeNames } = dict;

  return (
    <section
      aria-labelledby="types-title"
      {...(selected ? { "data-type": selected } : { "data-field": "surface" })}
      className="rounded-surface bg-field text-field-ink p-6 md:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="max-w-2xl">
          <h1 id="types-title" className="text-hero font-black">
            {selected ? typeNames[selected] : t.title}
          </h1>
          <p className="mt-3 text-body">{selected ? t.title : t.lead}</p>
        </div>
        {selected && (
          <Link
            href={hrefFor(basePath, null)}
            scroll={false}
            className={`inline-flex items-center gap-2 h-11 px-5 rounded-pill bg-ink text-bone font-extrabold text-small ${press}`}
          >
            <X aria-hidden="true" strokeWidth={3} className="size-4 -ml-1" />
            {t.clear}
          </Link>
        )}
      </div>

      {selected && (
        <div key={selected} className="fade-in mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
          <MatchupGroup
            title={t.attacking}
            basePath={basePath}
            dict={dict}
            rows={[
              [t.superEffective, POKEMON_TYPES.filter((d) => TYPE_CHART[selected][d] === 2)],
              [t.notVeryEffective, POKEMON_TYPES.filter((d) => TYPE_CHART[selected][d] === 0.5)],
              [t.noEffect, POKEMON_TYPES.filter((d) => TYPE_CHART[selected][d] === 0)],
            ]}
          />
          <MatchupGroup
            title={t.defending}
            basePath={basePath}
            dict={dict}
            rows={[
              [t.weakTo, POKEMON_TYPES.filter((a) => TYPE_CHART[a][selected] === 2)],
              [t.resists, POKEMON_TYPES.filter((a) => TYPE_CHART[a][selected] === 0.5)],
              [t.immuneTo, POKEMON_TYPES.filter((a) => TYPE_CHART[a][selected] === 0)],
            ]}
          />
        </div>
      )}
    </section>
  );
}

interface MatchupGroupProps {
  title: string;
  basePath: string;
  dict: Dictionary;
  rows: [label: string, types: PokemonType[]][];
}

// Un lado del resumen. Las etiquetas son pastillas blancas con tinta (§2.3,
// regla 4) y enlazan a ese tipo para seguir explorando.
function MatchupGroup({ title, basePath, dict, rows }: MatchupGroupProps) {
  return (
    <div>
      <h2 className="text-lead font-black">{title}</h2>
      <dl className="mt-4 flex flex-col gap-4">
        {rows.map(([label, types]) => (
          <div key={label}>
            <dt className="text-small font-extrabold">{label}</dt>
            <dd className="mt-2">
              {types.length === 0 ? (
                <span className="inline-flex items-center h-9 font-extrabold text-small">
                  {dict.typeChart.none}
                </span>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <li key={type}>
                      <Link
                        href={hrefFor(basePath, type)}
                        scroll={false}
                        className={`inline-flex items-center h-9 px-3.5 rounded-pill bg-surface/80 text-ink font-extrabold text-small hover:-translate-y-0.5 ${press}`}
                      >
                        {dict.typeNames[type]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Selector: los 18 bloques del panel de filtros en grande. El elegido lleva un
// aro en tinta y una marca ✓, para no depender solo del color; pulsarlo otra
// vez quita la selección.
function TypeSelector({ dict, basePath, selected }: PartProps) {
  return (
    <nav aria-label={dict.typeChart.pick}>
      <ul className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
        {POKEMON_TYPES.map((type) => {
          const isSelected = type === selected;
          return (
            <li key={type}>
              <Link
                href={hrefFor(basePath, isSelected ? null : type)}
                scroll={false}
                data-type={type}
                aria-current={isSelected ? "page" : undefined}
                className={`flex items-center justify-center gap-1.5 h-14 md:h-18 px-2 rounded-pill bg-field text-field-ink font-extrabold text-small md:text-body focus-visible:outline-ink ${press} ${
                  isSelected ? "ring-3 ring-ink ring-offset-3 ring-offset-ground" : "hover:-translate-y-0.5"
                }`}
              >
                {isSelected && <Check aria-hidden="true" strokeWidth={3.5} className="size-4 shrink-0" />}
                {dict.typeNames[type]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// relative: las etiquetas sr-only (absolutas) quedan dentro del scroll de la tabla
const CELL = "relative size-10 md:size-[3.25rem] rounded-lg text-center align-middle font-black num";

// Celda de la matriz: ×2 en tinta, ×½ en step, ×0 en tinta con rayas a 45° y ×1
// vacía. El multiplicador siempre se lee como texto, nunca solo como color.
function Cell({ value, highlight }: { value: number; highlight: boolean }) {
  if (value === 2) {
    return (
      <td className={`${CELL} bg-ink text-bone`}>
        <span aria-hidden="true">2</span>
        <span className="sr-only">×2</span>
      </td>
    );
  }
  if (value === 0.5) {
    return (
      <td className={`${CELL} bg-step text-ink`}>
        <span aria-hidden="true">½</span>
        <span className="sr-only">×½</span>
      </td>
    );
  }
  if (value === 0) {
    return (
      <td className={`${CELL} type-zero text-bone`}>
        <span aria-hidden="true">0</span>
        <span className="sr-only">×0</span>
      </td>
    );
  }
  return (
    <td className={`${CELL} ${highlight ? "type-cross" : "bg-ground"}`}>
      <span className="sr-only">×1</span>
    </td>
  );
}

// Matriz 18×18: una tabla real. Filas = tipo que ataca, columnas = tipo que
// recibe. Con un tipo elegido, su fila y su columna se tiñen de su field. En
// móvil la tabla se desplaza en horizontal con la primera columna fija.
function TypeMatrix({ dict, basePath, selected }: PartProps) {
  const { typeChart: t, typeNames } = dict;

  return (
    <section
      aria-labelledby="matrix-title"
      data-field="surface"
      className="rounded-surface bg-surface text-ink py-6 md:py-10"
    >
      <div className="px-6 md:px-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h2 id="matrix-title" className="text-head font-black">
            {t.matrix}
          </h2>
          <p id="matrix-caption" className="mt-2 text-body">
            {t.caption}
          </p>
        </div>
        <ul aria-label={t.legend} className="flex flex-wrap gap-x-5 gap-y-2 text-small font-extrabold">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="grid place-items-center size-8 rounded-lg bg-ink text-bone font-black">2</span>
            {t.double}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="grid place-items-center size-8 rounded-lg bg-step font-black">½</span>
            {t.half}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="type-zero grid place-items-center size-8 rounded-lg text-bone font-black">0</span>
            {t.zero}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-8 rounded-lg bg-ground" />
            {t.neutral}
          </li>
        </ul>
      </div>

      <div
        {...(selected ? { "data-type": selected } : {})}
        className="mt-6 md:mt-8 overflow-x-auto overscroll-x-contain custom-scrollbar"
      >
        <table
          aria-describedby="matrix-caption"
          className="mx-auto border-separate border-spacing-[3px] text-small md:text-body"
        >
          <thead>
            <tr>
              <td className="sticky left-0 z-10 bg-surface pl-6 md:pl-10 pr-2 align-bottom pb-2 text-small font-extrabold whitespace-nowrap">
                {t.corner}
              </td>
              {POKEMON_TYPES.map((def) => (
                <th key={def} scope="col" className="align-bottom pb-1 font-extrabold">
                  <Link
                    href={hrefFor(basePath, def === selected ? null : def)}
                    scroll={false}
                    data-type={def}
                    aria-current={def === selected ? "page" : undefined}
                    className={`vertical-label mx-auto flex items-center justify-start w-10 md:w-[3.25rem] h-28 py-3 rounded-pill bg-field text-field-ink text-small focus-visible:outline-ink ${press} ${
                      def === selected ? "ring-3 ring-ink ring-offset-2 ring-offset-surface" : ""
                    }`}
                  >
                    {typeNames[def]}
                  </Link>
                </th>
              ))}
              <td aria-hidden="true" className="w-3 md:w-7" />
            </tr>
          </thead>
          <tbody>
            {POKEMON_TYPES.map((atk) => (
              <tr key={atk}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface pl-6 md:pl-10 pr-2 text-left font-extrabold"
                >
                  <Link
                    href={hrefFor(basePath, atk === selected ? null : atk)}
                    scroll={false}
                    data-type={atk}
                    aria-current={atk === selected ? "page" : undefined}
                    className={`flex items-center h-10 md:h-[3.25rem] w-28 md:w-32 px-4 rounded-pill bg-field text-field-ink text-small focus-visible:outline-ink ${press} ${
                      atk === selected ? "ring-3 ring-ink ring-offset-2 ring-offset-surface" : ""
                    }`}
                  >
                    {typeNames[atk]}
                  </Link>
                </th>
                {POKEMON_TYPES.map((def) => (
                  <Cell
                    key={def}
                    value={TYPE_CHART[atk][def]}
                    highlight={atk === selected || def === selected}
                  />
                ))}
                <td aria-hidden="true" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
