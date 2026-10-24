import type { PokemonAbility } from "@/lib/pokeapi";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface PokemonAbilitiesProps {
  abilities: PokemonAbility[];
  locale: Locale;
}

// Habilidades (DESIGN.md §4.4): una lista con el nombre y el texto de los
// juegos, la oculta al final con su etiqueta. Sin texto en el idioma de la
// página se usa el del otro, marcado con su lang.
export default function PokemonAbilities({ abilities, locale }: PokemonAbilitiesProps) {
  const { detail } = getDictionary(locale);
  const other: Locale = locale === "es" ? "en" : "es";

  if (abilities.length === 0) return null;

  return (
    <section
      aria-labelledby="abilities-title"
      className="rounded-surface bg-surface p-6 md:p-10 text-ink"
    >
      <h2 id="abilities-title" className="text-head font-black">
        {detail.abilities}
      </h2>

      <ul className="mt-6 md:mt-8 flex flex-col gap-5">
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
