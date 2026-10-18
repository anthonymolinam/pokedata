import Link from "next/link";
import Image from "next/image";
import { PokemonSummary, formatPokemonDisplayName } from "@/lib/pokeapi";
import { ART_TOP_ZONE, getArtworkFit } from "@/lib/artwork";
import { isPokemonType } from "@/constants/typeColors";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface PokemonCardProps {
  pokemon: PokemonSummary;
  href: string;
  locale: Locale;
  // Las primeras tarjetas de la página cargan su artwork sin esperar al scroll
  eager?: boolean;
  headingAs?: "h2" | "h3";
  // En la cadena evolutiva de la ficha, el Pokémon que se está viendo
  current?: boolean;
}

// Curva de rebote de la dirección Pop (§4.3 y §6)
const spring = "ease-[cubic-bezier(.34,1.56,.64,1)] duration-[350ms]";

// Tarjeta de Pokémon (DESIGN.md §4.3): campo del tipo principal, artwork
// normalizado que solo se sale por arriba y una zona reservada abajo con el
// nombre, la marca de agua del número, las etiquetas de tipo y el total.
export default function PokemonCard({
  pokemon,
  href,
  locale,
  eager = false,
  headingAs: Heading = "h3",
  current = false,
}: PokemonCardProps) {
  const { card, typeNames } = getDictionary(locale);
  const name = formatPokemonDisplayName(pokemon.name);
  const types = pokemon.types.map((t) => t.toLowerCase()).filter(isPokemonType);
  const fit = getArtworkFit(pokemon.id);

  const number = String(pokemon.id).padStart(4, "0");
  // El nombre y el número van en una línea: si no caben, bajan de --step-lead
  // hasta 16px. Los 0.5em de más son el hueco entre los dos
  const nameSize = `max(1rem, min(var(--step-lead), calc((100cqi - 2 * var(--card-pad)) / ${(Math.max(name.length, 1) + number.length) * 0.6 + 0.5})))`;

  return (
    <Link
      href={href}
      data-type={types[0] ?? "normal"}
      aria-current={current ? "page" : undefined}
      className={`group type-glow relative flex flex-col rounded-surface bg-field text-field-ink @container [--card-pad:max(0.875rem,6.5cqi)] focus-visible:outline-ink aria-[current=page]:outline-3 aria-[current=page]:outline-offset-3 aria-[current=page]:outline-ink motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5 motion-safe:active:scale-[0.98]`}
    >
      <div
        aria-hidden="true"
        className="relative"
        style={{ height: `${ART_TOP_ZONE}cqi` }}
      >
        <div
          className={`pointer-events-none absolute motion-safe:transition-transform ${spring} motion-safe:group-hover:scale-[1.08] motion-safe:group-focus-visible:scale-[1.08]`}
          style={{
            left: `${fit.left}cqi`,
            top: `${fit.top}cqi`,
            width: `${fit.size}cqi`,
            height: `${fit.size}cqi`,
            transformOrigin: fit.origin,
          }}
        >
          <Image
            src={pokemon.image}
            alt=""
            fill
            sizes="(min-width: 1080px) 310px, (min-width: 768px) 33vw, 50vw"
            loading={eager ? "eager" : undefined}
            className="object-contain"
          />
        </div>
      </div>

      {/* Zona reservada: el artwork no entra nunca y el texto va por encima */}
      <div className="relative z-10 flex flex-1 flex-col gap-[max(0.375rem,2.5cqi)] px-(--card-pad) pt-3 pb-(--card-pad) min-h-[84px] md:min-h-24">
        {/* Marca de agua del número en la fila del nombre: el artwork no llega */}
        <div className="flex items-baseline gap-[0.5em]" style={{ fontSize: nameSize }}>
          <Heading className="flex-1 min-w-0 truncate font-black leading-[1.05] tracking-[-0.03em]">
            {name}
            <span className="sr-only">
              , {card.number} {pokemon.id}
            </span>
          </Heading>
          <span
            aria-hidden="true"
            className="shrink-0 font-black leading-none tracking-[-0.04em] num opacity-40 select-none"
          >
            {number}
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-1.5">
          <ul className="flex flex-wrap gap-1">
            {types.map((type) => (
              <li
                key={type}
                className="rounded-pill bg-surface/80 px-2.5 py-0.5 text-small font-extrabold text-ink"
              >
                {typeNames[type]}
              </li>
            ))}
          </ul>

          {/* En tarjetas de móvil no cabe junto a las etiquetas (§4.3) */}
          {pokemon.total !== undefined && (
            <p className="rounded-pill bg-ink px-2.5 py-0.5 text-small text-bone num @max-[12rem]:hidden">
              <span className="font-bold">{card.total}</span>{" "}
              <span className="font-black">{pokemon.total}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
