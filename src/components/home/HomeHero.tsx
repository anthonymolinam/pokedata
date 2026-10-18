import HeroSearch from "@/components/home/HeroSearch";
import DailyPokemon from "@/components/home/DailyPokemon";
import { getDailyPokemon } from "@/lib/daily-server";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Hero compacto de la portada (DESIGN.md §4.2). En escritorio, dos columnas:
// el panel blanco con el titular y el buscador, y el Pokémon del día. En
// móvil se apilan. Presupuesto: 360px de alto en escritorio y 400px en móvil,
// para que a 1440×900 se vea entera la primera fila de tarjetas.
export default function HomeHero({ locale }: { locale: Locale }) {
  const { hero } = getDictionary(locale);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5 lg:items-end">
      <div className="flex flex-col justify-center rounded-surface bg-surface p-4 sm:p-5 md:p-8 lg:min-h-[340px]">
        <h1 className="text-hero font-black text-balance">{hero.title}</h1>
        <p className="hidden sm:block mt-3 text-body">{hero.lead}</p>
        <div className="mt-4 sm:mt-5 md:mt-6">
          <HeroSearch locale={locale} />
        </div>
      </div>

      <DailyPokemon locale={locale} today={getDailyPokemon()} />
    </div>
  );
}
