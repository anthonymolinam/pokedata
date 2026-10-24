import { TypeEffectiveness } from "@/lib/type-matrix";
import { getDictionary } from "@/constants/translations";
import { isPokemonType } from "@/constants/typeColors";
import type { PokemonType } from "@/constants/typeChart";
import { Locale } from "@/proxy";

interface TypeWeaknessesProps {
  effectiveness: TypeEffectiveness;
  locale: Locale;
}

type Tag = [type: PokemonType, multiplier: string];

const tags = (types: string[], multiplier: string): Tag[] =>
  types.filter(isPokemonType).map((type) => [type, multiplier]);

// Debilidades (DESIGN.md §4.4): etiquetas de tipo en su field, con el
// multiplicador dentro de la propia etiqueta. Las debilidades van más grandes
// que las resistencias, que es lo que se busca primero.
export default function TypeWeaknesses({ effectiveness, locale }: TypeWeaknessesProps) {
  const { detail, typeNames } = getDictionary(locale);

  const groups = [
    {
      label: detail.weakTo,
      large: true,
      items: [
        ...tags(effectiveness.weaknesses4x, "×4"),
        ...tags(effectiveness.weaknesses2x, "×2"),
      ],
    },
    {
      label: detail.resists,
      large: false,
      items: [
        ...tags(effectiveness.resistancesHalf, "×½"),
        ...tags(effectiveness.resistancesQuarter, "×¼"),
      ],
    },
    {
      label: detail.immuneTo,
      large: false,
      items: tags(effectiveness.immunities0x, "×0"),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <section
      aria-labelledby="weaknesses-title"
      className="rounded-surface bg-surface p-6 md:p-10 text-ink"
    >
      <h2 id="weaknesses-title" className="text-head font-black">
        {detail.weaknesses}
      </h2>

      <div className="mt-6 md:mt-8 flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="text-body font-extrabold">{group.label}</h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {group.items.map(([type, multiplier]) => (
                <li
                  key={type}
                  data-type={type}
                  className={`flex items-center gap-2 rounded-pill bg-field text-field-ink font-extrabold ${
                    group.large ? "min-h-11 px-4 text-body" : "min-h-9 px-3.5 text-small"
                  }`}
                >
                  {typeNames[type]}
                  <span className="font-black num">{multiplier}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
    </section>
  );
}
