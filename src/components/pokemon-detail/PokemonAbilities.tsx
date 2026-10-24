import type { PokemonAbility } from "@/lib/pokeapi";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface PokemonAbilitiesProps {
  abilities: PokemonAbility[];
  locale: Locale;
}

// Habilidades (DESIGN.md §4.4): un panel a todo el ancho con una columna por
// habilidad (nombre y texto de los juegos), la oculta al final con su
// etiqueta. Sin texto en el idioma de la página se usa el del otro, marcado
// con su lang.
export default function PokemonAbilities({ abilities, locale }: PokemonAbilitiesProps) {
  const { detail } = getDictionary(locale);
  const other: Locale = locale === "es" ? "en" : "es";

  if (abilities.length === 0) return null;
  const single = abilities.length === 1;

  // Con una sola habilidad, el título y la habilidad van en la misma fila y
  // el panel mide la mitad. Desde 1024px la habilidad empieza en la vertical
  // del texto de Debilidades: columnas 7/5 como la fila de arriba y 144px de
  // hueco, que es el de esa fila (32px) más los dos rellenos (2 × 40px) que
  // el panel ancho no tiene por dentro, más lo que esos 48px quitan a la
  // columna de 7/12.
  return (
    <section
      aria-labelledby="abilities-title"
      className={`rounded-surface bg-surface p-6 md:p-10 text-ink ${
        single
          ? "md:grid md:grid-cols-2 md:items-start md:gap-x-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-[144px]"
          : ""
      }`}
    >
      <h2 id="abilities-title" className="text-head font-black">
        {detail.abilities}
      </h2>

      <ul
        className={`mt-6 grid gap-5 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-x-10 ${
          single ? "md:mt-0" : "md:mt-8"
        }`}
        style={{ "--cols": abilities.length } as React.CSSProperties}
      >
        {abilities.map((ability) => {
          const text = ability.text[locale] ?? ability.text[other];
          return (
            <li key={ability.slug}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h3 className="text-lead font-black">{ability.name[locale]}</h3>
                {ability.hidden && (
                  <span className="inline-flex min-h-7 items-center rounded-pill bg-step px-3 text-small font-extrabold">
                    {detail.hiddenAbility}
                  </span>
                )}
              </div>
              {text && (
                <p
                  lang={ability.text[locale] ? undefined : other}
                  className="mt-1.5 text-body"
                >
                  {text}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
