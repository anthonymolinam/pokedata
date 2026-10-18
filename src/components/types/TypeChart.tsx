import Link from "next/link";
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

const press = "active:scale-[0.96] motion-safe:transition-transform duration-150";

// Enlace a la misma página con otra fila o columna elegida; sin selección,
// vuelve a la tabla limpia. Funciona igual sin JavaScript.
const hrefFor = (basePath: string, selection: TypeSelection | null) =>
  selection ? `${basePath}?${selection.axis}=${selection.type}` : basePath;

// Pulsar la cabecera ya elegida quita la selección; pulsar otra la cambia
const toggle = (
  selected: TypeSelection | null,
  axis: TypeSelection["axis"],
  type: PokemonType,
): TypeSelection | null =>
  selected?.axis === axis && selected.type === type ? null : { axis, type };

// relative: las etiquetas sr-only (absolutas) quedan dentro del scroll de la tabla
// 32px de alto: las 19 filas y la franja del título caben en 1440×900. El
// ancho lo reparte la tabla entre las 18 columnas (unos 57px a 1440)
const CELL = "relative h-8 rounded-md text-center align-middle text-small font-black num";

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

// Fila y columna comparten pastilla: misma altura, letra y relleno
const HEAD = `type-head flex items-center h-8 px-2 rounded-pill bg-field text-field-ink text-small font-extrabold focus-visible:outline-ink ${press}`;
const HEAD_SELECTED = "ring-3 ring-ink ring-offset-2 ring-offset-surface";

const LEGEND_SWATCH = "grid place-items-center size-6 rounded-md text-small font-black";

// Tabla de tipos (DESIGN.md §4.5): una franja con el título, la explicación y
// la leyenda, y debajo la matriz 18×18, que es también el selector. Filas =
// tipo que ataca, columnas = tipo que recibe. Pulsar la cabecera de una fila o
// columna la tiñe de su field y atenúa el resto; al pasar el ratón por una
// celda, su fila y su columna se marcan como guía (globals.css). Cabe entera en
// 1440×900; en móvil se desplaza en horizontal con la columna de atacantes
// fija. La selección vive en la URL (?atk= o ?def=), así que se puede compartir.
export default function TypeChart({ locale, basePath, selected }: TypeChartProps) {
  const { typeChart: t, typeNames } = getDictionary(locale);

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
      aria-labelledby="types-title"
      data-field="surface"
      className="rounded-surface bg-surface text-ink py-5"
    >
      <div className="px-5 md:px-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <h1 id="types-title" className="text-lead font-black">
            {t.title}
          </h1>
          <p id="types-caption" className="mt-1 text-body">
            {t.caption}
          </p>
        </div>
        <ul aria-label={t.legend} className="flex flex-wrap gap-x-4 gap-y-2 text-small font-extrabold">
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`${LEGEND_SWATCH} bg-ink text-bone`}>2</span>
            {t.double}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`${LEGEND_SWATCH} bg-step`}>½</span>
            {t.half}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`${LEGEND_SWATCH} type-zero text-bone`}>0</span>
            {t.zero}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`${LEGEND_SWATCH} bg-ground`} />
            {t.neutral}
          </li>
        </ul>
      </div>

      <div
        {...(selected ? { "data-type": selected.type } : {})}
        className="mt-3 overflow-x-auto overscroll-x-contain custom-scrollbar"
      >
        <table
          aria-describedby="types-caption"
          className="type-matrix w-full min-w-[50rem] table-fixed border-separate border-spacing-[3px]"
        >
          <thead>
            <tr>
              {/* table-fixed: este ancho fija la columna de atacantes (relleno
                  más la pastilla de 104px) y el resto se reparte a partes
                  iguales */}
              <td className="sticky left-0 z-10 w-32 md:w-[8.25rem] bg-surface pl-5 md:pl-6 pr-1">
                <span className="sr-only">{t.corner}</span>
              </td>
              {POKEMON_TYPES.map((def) => (
                <th key={def} scope="col" data-col={def} className="p-0 font-extrabold">
                  {/* Abreviatura de tres letras en horizontal; el nombre
                      completo va en title y para lectores de pantalla */}
                  <Link
                    href={hrefFor(basePath, toggle(selected, "def", def))}
                    scroll={false}
                    data-type={def}
                    title={typeNames[def]}
                    aria-current={isSelected("def", def) ? "true" : undefined}
                    {...headDim("def", def)}
                    className={`${HEAD} justify-center w-full ${isSelected("def", def) ? HEAD_SELECTED : ""}`}
                  >
                    <span aria-hidden="true">{typeNames[def].slice(0, 3)}</span>
                    <span className="sr-only">{typeNames[def]}</span>
                  </Link>
                </th>
              ))}
              <td aria-hidden="true" className="w-2 md:w-3" />
            </tr>
          </thead>
          <tbody>
            {POKEMON_TYPES.map((atk) => (
              <tr key={atk}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-surface pl-5 md:pl-6 pr-1 text-left font-extrabold"
                >
                  <Link
                    href={hrefFor(basePath, toggle(selected, "atk", atk))}
                    scroll={false}
                    data-type={atk}
                    aria-current={isSelected("atk", atk) ? "true" : undefined}
                    {...headDim("atk", atk)}
                    className={`${HEAD} w-26 ${isSelected("atk", atk) ? HEAD_SELECTED : ""}`}
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
