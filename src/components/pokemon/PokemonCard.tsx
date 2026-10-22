import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import Artwork from "@/components/common/Artwork";
import { PokemonSummary, formatPokemonDisplayName } from "@/lib/pokeapi";
import { ART_TOP_ZONE, getArtworkFit } from "@/lib/artwork";
import { isPokemonType } from "@/constants/typeColors";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface PokemonCardProps {
  pokemon: PokemonSummary;
  // Enlace a la ficha o, en el selector del equipo, un botón que la marca
  href?: string;
  onSelect?: () => void;
  selected?: boolean;
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
  onSelect,
  selected = false,
  locale,
  eager = false,
  headingAs: Heading = "h3",
  current = false,
}: PokemonCardProps) {
  const { card, typeNames } = getDictionary(locale);
  const name = formatPokemonDisplayName(pokemon.name);
  const types = pokemon.types.map((t) => t.toLowerCase()).filter(isPokemonType);
  const fit = getArtworkFit(pokemon.artworkId ?? pokemon.id);

  const number = String(pokemon.id).padStart(4, "0");
  // El nombre y el número van en una línea: si no caben, bajan de --step-lead
  // hasta 16px. Los 0.5em de más son el hueco entre los dos. En tarjetas
  // estrechas (menos de 18rem: móvil, tablet, cadena evolutiva) el número sube
  // encima con el total a su derecha, y el nombre se ajusta solo a su propio
  // largo, con algo de margen para las letras anchas (Crabominable). 18rem es
  // lo que piden las dos etiquetas de tipo más largas y el total en una línea
  const inner = "(100cqi - 2 * var(--card-pad))";
  const nameSize = {
    "--name-inline": `max(1rem, min(var(--step-lead), calc(${inner} / ${(Math.max(name.length, 1) + number.length) * 0.6 + 0.5})))`,
    "--name-stacked": `max(0.875rem, min(var(--step-lead), calc(${inner} / ${Math.max(name.length, 1) * 0.68})))`,
  } as CSSProperties;

  // En el selector, el foco cae en el botón que cubre la tarjeta: la subida
  // del foco sale de has-focus-visible
  const className = `group type-glow relative flex h-full flex-col rounded-surface bg-field text-field-ink @container [--card-pad:max(0.875rem,6.5cqi)] focus-visible:outline-ink aria-[current=page]:ring-selected motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5 motion-safe:has-focus-visible:-translate-y-1.5 motion-safe:active:scale-[0.98]`;

  return (
    <CardRoot
      href={href}
      onSelect={onSelect}
      selected={selected}
      type={types[0] ?? "normal"}
      current={current}
      className={className}
      label={`${name}${pokemon.form ? ` (${pokemon.form})` : ""}, ${card.number} ${pokemon.id}`}
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
          <Artwork
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
        <div
          className="flex items-baseline gap-[0.5em] text-(length:--name-inline) @max-[18rem]:flex-col-reverse @max-[18rem]:items-start @max-[18rem]:gap-0.5 @max-[18rem]:text-(length:--name-stacked)"
          style={nameSize}
        >
          <Heading className="flex-1 min-w-0 truncate font-black leading-[1.05] tracking-[-0.03em] @max-[18rem]:w-full @max-[18rem]:overflow-visible @max-[18rem]:whitespace-normal @max-[18rem]:break-words">
            {name}
            <span className="sr-only">
              {pokemon.form ? ` (${pokemon.form})` : ""}, {card.number} {pokemon.id}
            </span>
          </Heading>
          <span className="flex shrink-0 items-center justify-between gap-2 @max-[18rem]:w-full">
            <span
              aria-hidden="true"
              className="font-black leading-none tracking-[-0.04em] num opacity-40 select-none @max-[18rem]:text-small"
            >
              {number}
            </span>
            {/* En tarjetas estrechas el total va aquí, a la derecha del número,
                y la línea de tipos queda solo para los tipos */}
            {pokemon.total !== undefined && (
              <TotalPill
                label={card.total}
                total={pokemon.total}
                compact
                className="hidden @max-[18rem]:block"
              />
            )}
          </span>
        </div>

        {pokemon.form && (
          <p className="-mt-0.5 truncate text-small font-extrabold leading-[18px] opacity-80">
            {pokemon.form}
          </p>
        )}

        {/* mt-auto: en una fila de tarjetas de distinta altura, los tipos
            quedan alineados abajo */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-1.5">
          <ul className="flex flex-wrap gap-1">
            {types.map((type) => (
              <li
                key={type}
                className="rounded-pill type-tag px-2.5 py-0.5 text-small font-extrabold text-ink"
              >
                {typeNames[type]}
              </li>
            ))}
          </ul>

          {/* En tarjetas estrechas sube a la línea del número (§4.3) */}
          {pokemon.total !== undefined && (
            <TotalPill label={card.total} total={pokemon.total} className="@max-[18rem]:hidden" />
          )}
        </div>
      </div>
    </CardRoot>
  );
}

interface CardRootProps {
  href?: string;
  onSelect?: () => void;
  selected: boolean;
  type: string;
  current: boolean;
  className: string;
  label: string;
  children: ReactNode;
}

// Un enlace a la ficha o, con onSelect, la tarjeta con un botón encima que la
// cubre entera (un botón no puede contener el título ni las listas). El borde
// único de selección (§2.3, regla 8) lo lleva la tarjeta, no el botón: es una
// sombra por dentro y el artwork, que es hijo suyo, se pinta encima; en el
// botón, que va por encima de todo, cruzaba el artwork que sobresale
function CardRoot({ href, onSelect, selected, type, current, className, label, children }: CardRootProps) {
  if (onSelect) {
    return (
      <div data-type={type} className={`${className} ${selected ? "ring-selected" : ""}`}>
        {children}
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={label}
          className="absolute inset-0 z-20 rounded-surface cursor-pointer focus-visible:outline-ink"
        />
      </div>
    );
  }
  return (
    <Link
      href={href ?? "#"}
      data-type={type}
      aria-current={current ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

interface TotalPillProps {
  label: string;
  total: number;
  className: string;
  // En tarjetas estrechas, junto al número: más pequeña y translúcida, en la
  // tinta del campo, para que no compita con el nombre
  compact?: boolean;
}

// Pastilla «Total 534»: la palabra en 700 y la cifra en 900, tabulares
function TotalPill({ label, total, className, compact = false }: TotalPillProps) {
  const look = compact
    ? "bg-on-light/15 text-field-ink px-2 py-px text-[0.75rem] leading-[1.4]"
    : "bg-ink text-bone px-2.5 py-0.5 text-small";
  return (
    <p className={`rounded-pill num ${look} ${className}`}>
      <span className="font-bold">{label}</span> <span className="font-black">{total}</span>
    </p>
  );
}
