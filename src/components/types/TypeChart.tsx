import Link from "next/link";
import { X } from "lucide-react";
import { POKEMON_TYPES, TYPE_CHART, type PokemonType } from "@/constants/typeChart";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Tipo elegido en la tabla: una fila (atacante, ?atk=) o una columna
// (defensor, ?def=)
export interface TypeSelection {
  axis: "atk" | "def";
  type: PokemonType;
}

interface TypeChartProps {
  locale: Locale;
  basePath: string;
  selected: TypeSelection | null;
}

type Dictionary = ReturnType<typeof getDictionary>;

const press = "active:scale-[0.96] motion-safe:transition-transform duration-150";

// Enlace a la misma página con otra fila o columna elegida; sin selección,
// vuelve a la tabla limpia. Funciona igual sin JavaScript.
const hrefFor = (basePath: string, selection: TypeSelection | null) =>
  selection ? `${basePath}?${selection.axis}=${selection.type}` : basePath;

// Pulsar la cabecera ya elegida quita la selección
const toggle = (
  selected: TypeSelection | null,
  axis: TypeSelection["axis"],
  type: PokemonType,
): TypeSelection | null =>
  selected?.axis === axis && selected.type === type ? null : { axis, type };

// Tabla de tipos (DESIGN.md §4.5): cabecera que se pinta en el field del tipo
// elegido y la matriz 18×18, que es también el selector. La selección vive en
// la URL (?atk= o ?def=), así que se puede compartir.
export default function TypeChart({ locale, basePath, selected }: TypeChartProps) {
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <TypeHeader dict={dict} basePath={basePath} selected={selected} />
      <TypeMatrix dict={dict} basePath={basePath} selected={selected} />
    </div>
  );
}

interface PartProps {
  dict: Dictionary;
  basePath: string;
  selected: TypeSelection | null;
}

// Cabecera: en blanco sin selección; con una fila elegida, su field y lo que
// ese tipo hace al atacar; con una columna, lo que le pasa al defender
function TypeHeader({ dict, basePath, selected }: PartProps) {
  const { typeChart: t, typeNames } = dict;
  const type = selected?.type;

  return (
    <section
      aria-labelledby="types-title"
      {...(type ? { "data-type": type } : { "data-field": "surface" })}
      className="rounded-surface bg-field text-field-ink p-6 md:p-10"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="max-w-2xl">
          <h1 id="types-title" className="text-hero font-black">
            {type ? typeNames[type] : t.title}
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
        <div key={`${selected.axis}-${selected.type}`} className="fade-in mt-8">
          {selected.axis === "atk" ? (
            <MatchupGroup
              title={t.attacking}
              axis="atk"
              basePath={basePath}
              dict={dict}
              rows={[
                [t.superEffective, POKEMON_TYPES.filter((d) => TYPE_CHART[selected.type][d] === 2)],
                [t.notVeryEffective, POKEMON_TYPES.filter((d) => TYPE_CHART[selected.type][d] === 0.5)],
                [t.noEffect, POKEMON_TYPES.filter((d) => TYPE_CHART[selected.type][d] === 0)],
              ]}
            />
          ) : (
            <MatchupGroup
              title={t.defending}
              axis="def"
              basePath={basePath}
              dict={dict}
              rows={[
                [t.weakTo, POKEMON_TYPES.filter((a) => TYPE_CHART[a][selected.type] === 2)],
                [t.resists, POKEMON_TYPES.filter((a) => TYPE_CHART[a][selected.type] === 0.5)],
                [t.immuneTo, POKEMON_TYPES.filter((a) => TYPE_CHART[a][selected.type] === 0)],
              ]}
            />
          )}
        </div>
      )}
    </section>
  );
}

interface MatchupGroupProps {
  title: string;
  // Las etiquetas llevan a ese tipo en el mismo eje
  axis: TypeSelection["axis"];
  basePath: string;
  dict: Dictionary;
  rows: [label: string, types: PokemonType[]][];
}

// Un lado del resumen. Las etiquetas son pastillas blancas con tinta (§2.3,
// regla 4) y enlazan a ese tipo para seguir explorando.
function MatchupGroup({ title, axis, basePath, dict, rows }: MatchupGroupProps) {
  return (
    <div>
      <h2 className="text-lead font-black">{title}</h2>
      <dl className="mt-4 grid gap-4 md:grid-cols-3 md:gap-8">
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
                        href={hrefFor(basePath, { axis, type })}
                        scroll={false}
                        className={`inline-flex items-center h-9 px-3.5 rounded-pill bg-surface/80 text-ink font-extrabold text-small motion-safe:hover:-translate-y-0.5 ${press}`}
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

// relative: las etiquetas sr-only (absolutas) quedan dentro del scroll de la tabla
const CELL = "relative size-10 md:size-[3.25rem] rounded-lg text-center align-middle font-black num";

// Cómo se ve una celda según la selección: dentro de la fila o columna elegida,
// atenuada fuera de ella, o normal sin selección
type CellState = "line" | "dim" | "none";

interface CellProps {
  value: number;
  // Columna de la celda, para la guía de hover de globals.css
  col: PokemonType;
  state: CellState;
}

// Celda de la matriz: ×2 en tinta, ×½ en step, ×0 en tinta con rayas a 45° y ×1
// vacía. El multiplicador siempre se lee como texto, nunca solo como color.
function Cell({ value, col, state }: CellProps) {
  const attrs = { "data-col": col, ...(state === "dim" ? { "data-dim": "" } : {}) };

  if (value === 2) {
    return (
      <td {...attrs} className={`${CELL} bg-ink text-bone`}>
        <span aria-hidden="true">2</span>
        <span className="sr-only">×2</span>
      </td>
    );
  }
  if (value === 0.5) {
    return (
      <td {...attrs} className={`${CELL} bg-step text-ink`}>
        <span aria-hidden="true">½</span>
        <span className="sr-only">×½</span>
      </td>
    );
  }
  if (value === 0) {
    return (
      <td {...attrs} className={`${CELL} type-zero text-bone`}>
        <span aria-hidden="true">0</span>
        <span className="sr-only">×0</span>
      </td>
    );
  }
  return (
    <td {...attrs} className={`${CELL} ${state === "line" ? "type-cross" : "type-one"}`}>
      <span className="sr-only">×1</span>
    </td>
  );
}

const HEAD = `type-head bg-field text-field-ink rounded-pill text-small focus-visible:outline-ink ${press}`;
const HEAD_SELECTED = "ring-3 ring-ink ring-offset-2 ring-offset-surface";

// Matriz 18×18: una tabla real y, a la vez, el selector. Filas = tipo que
// ataca, columnas = tipo que recibe. Pulsar la cabecera de una fila o de una
// columna la tiñe de su field y atenúa el resto; al pasar el ratón por una
// celda, su fila y su columna se marcan como guía (globals.css). En móvil la
// tabla se desplaza en horizontal con la primera columna fija.
function TypeMatrix({ dict, basePath, selected }: PartProps) {
  const { typeChart: t, typeNames } = dict;

  const isSelected = (axis: TypeSelection["axis"], type: PokemonType) =>
    selected?.axis === axis && selected.type === type;
  const cellState = (atk: PokemonType, def: PokemonType): CellState => {
    if (!selected) return "none";
    const inLine = selected.axis === "atk" ? atk === selected.type : def === selected.type;
    return inLine ? "line" : "dim";
  };
  // Las cabeceras del eje elegido que no son la elegida también se atenúan
  const headDim = (axis: TypeSelection["axis"], type: PokemonType) =>
    selected?.axis === axis && selected.type !== type ? { "data-dim": "" } : {};

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
        {...(selected ? { "data-type": selected.type } : {})}
        className="mt-6 md:mt-8 overflow-x-auto overscroll-x-contain custom-scrollbar"
      >
        <table
          aria-describedby="matrix-caption"
          className="type-matrix mx-auto border-separate border-spacing-[3px] text-small md:text-body"
        >
          <thead>
            <tr>
              <td className="sticky left-0 z-10 bg-surface pl-6 md:pl-10 pr-2 align-bottom pb-2 text-small font-extrabold whitespace-nowrap">
                {t.corner}
              </td>
              {POKEMON_TYPES.map((def) => (
                <th key={def} scope="col" data-col={def} className="align-bottom pb-1 font-extrabold">
                  <Link
                    href={hrefFor(basePath, toggle(selected, "def", def))}
                    scroll={false}
                    data-type={def}
                    aria-current={isSelected("def", def) ? "true" : undefined}
                    {...headDim("def", def)}
                    className={`${HEAD} vertical-label mx-auto flex items-center justify-start w-10 md:w-[3.25rem] h-28 py-3 ${
                      isSelected("def", def) ? HEAD_SELECTED : ""
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
                    href={hrefFor(basePath, toggle(selected, "atk", atk))}
                    scroll={false}
                    data-type={atk}
                    aria-current={isSelected("atk", atk) ? "true" : undefined}
                    {...headDim("atk", atk)}
                    className={`${HEAD} flex items-center h-10 md:h-[3.25rem] w-28 md:w-32 px-4 ${
                      isSelected("atk", atk) ? HEAD_SELECTED : ""
                    }`}
                  >
                    {typeNames[atk]}
                  </Link>
                </th>
                {POKEMON_TYPES.map((def) => (
                  <Cell key={def} value={TYPE_CHART[atk][def]} col={def} state={cellState(atk, def)} />
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
