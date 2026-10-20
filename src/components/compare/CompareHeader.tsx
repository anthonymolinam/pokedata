import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import { PokemonDetail } from "@/lib/pokeapi";
import { DailyPokemon } from "@/lib/daily";
import { figureStyle } from "@/lib/artwork";
import { formatPokemonHeroName, formatVariantLabel } from "@/lib/pokemon-names";
import { isPokemonType } from "@/constants/typeColors";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";
import PokemonSelectModal from "./PokemonSelectModal";

type Slot = 1 | 2;

// Más formas que estas y el selector se pliega
const MAX_OPEN_FORMS = 4;

interface CompareHeaderProps {
  pokemon1: PokemonDetail | null;
  pokemon2: PokemonDetail | null;
  p1Slug: string;
  p2Slug: string;
  basePath: string;
  suggestions: DailyPokemon[];
  locale: Locale;
}

// Pulsación y hover con rebote de los controles (§4.0)
const control =
  "inline-flex items-center justify-center gap-2 min-h-11 rounded-pill px-4 text-small font-extrabold cursor-pointer motion-safe:transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:-translate-y-0.5 active:scale-[0.96]";

// El id sale de la URL del artwork (…/official-artwork/10034.png) para
// normalizar la figura; las formas sin medidas caen a object-fit: contain
function artworkId(url: string): number {
  const match = url.match(/\/(\d+)\.png$/);
  return match ? Number(match[1]) : 0;
}

export function compareHref(basePath: string, p1: string, p2: string): string {
  return `${basePath}?p1=${encodeURIComponent(p1)}&p2=${encodeURIComponent(p2)}`;
}

function detailHref(name: string, locale: Locale): string {
  return `/${locale}/pokemon/${(locale === "es" && CANONICAL_TO_SPANISH[name]) || name}`;
}

// Escenarios del comparador (DESIGN.md §4.6): dos campos de color lado a lado
// (apilados en móvil) con la anatomía de la ficha en pequeño, y la pastilla
// «Intercambiar» en el eje central, sobre la junta de los dos.
export default function CompareHeader({
  pokemon1,
  pokemon2,
  p1Slug,
  p2Slug,
  basePath,
  suggestions,
  locale,
}: CompareHeaderProps) {
  const { compare } = getDictionary(locale);

  return (
    <div className="relative grid gap-5 md:grid-cols-2">
      <CompareStage
        slot={1}
        pokemon={pokemon1}
        slug={p1Slug}
        otherSlug={p2Slug}
        basePath={basePath}
        suggestions={suggestions}
        locale={locale}
      />

      {/* En móvil va entre los dos escenarios, montada sobre la junta; en
          escritorio, en la junta y a media altura de los artworks. El
          centrado vive en el envoltorio, para que el rebote del hover (que
          también usa translate) no lo pise */}
      <div className="relative z-10 -my-8 justify-self-center md:absolute md:left-1/2 md:top-[calc(min(40svh,360px)/2)] md:my-0 md:-translate-x-1/2 md:-translate-y-1/2">
        <Link
          href={compareHref(basePath, p2Slug, p1Slug)}
          scroll={false}
          aria-label={compare.swapLabel}
          className={`${control} bg-ink px-5 text-bone focus-visible:outline-ink`}
        >
          <ArrowLeftRight aria-hidden="true" strokeWidth={2.5} className="size-4 rotate-90 md:rotate-0" />
          {compare.swap}
        </Link>
      </div>

      <CompareStage
        slot={2}
        pokemon={pokemon2}
        slug={p2Slug}
        otherSlug={p1Slug}
        basePath={basePath}
        suggestions={suggestions}
        locale={locale}
      />
    </div>
  );
}

interface CompareStageProps {
  slot: Slot;
  pokemon: PokemonDetail | null;
  slug: string;
  otherSlug: string;
  basePath: string;
  suggestions: DailyPokemon[];
  locale: Locale;
}

function CompareStage({
  slot,
  pokemon,
  slug,
  otherSlug,
  basePath,
  suggestions,
  locale,
}: CompareStageProps) {
  const { compare, detail, typeNames } = getDictionary(locale);
  const isEs = locale === "es";
  const hrefFor = (next: string) =>
    slot === 1 ? compareHref(basePath, next, otherSlug) : compareHref(basePath, otherSlug, next);
  // El selector completa el enlace con el Pokémon elegido para este lado
  const hrefPrefix = `${basePath}?${slot === 1 ? "p2" : "p1"}=${encodeURIComponent(otherSlug)}&p${slot}=`;

  if (!pokemon) {
    return (
      <section
        aria-label={compare.choose}
        className="flex min-h-80 flex-col items-start justify-end gap-4 rounded-surface bg-step p-5 md:p-8"
      >
        <p className="text-lead font-black">{compare.emptySlot}</p>
        <PokemonSelectModal
          triggerLabel={compare.choose}
          triggerClassName={`${control} bg-ink text-bone`}
          hrefPrefix={hrefPrefix}
          currentSlug={slug}
          suggestions={suggestions}
          locale={locale}
        />
      </section>
    );
  }

  const types = pokemon.types.map((t) => t.toLowerCase()).filter(isPokemonType);
  const primary = types[0] ?? "normal";
  const name = formatPokemonHeroName(pokemon.name, locale);
  const varieties = pokemon.varieties ?? [];
  const active =
    varieties.find((v) => v.name === slug.toLowerCase()) ?? varieties.find((v) => v.isDefault);
  const formLabel = active && !active.isDefault ? formatVariantLabel(active.label, isEs) : null;
  const measure = new Intl.NumberFormat(isEs ? "es-ES" : "en-US", {
    maximumFractionDigits: 1,
  });
  const headingId = `compare-name-${slot}`;

  const formLinks = varieties.map((variant) => (
    <li key={variant.name}>
      <Link
        href={hrefFor(variant.name)}
        scroll={false}
        replace
        aria-current={variant.name === active?.name ? "true" : undefined}
        className={`${control} bg-surface text-ink aria-[current=true]:bg-ink aria-[current=true]:text-bone`}
      >
        {formatVariantLabel(variant.label, isEs)}
      </Link>
    </li>
  ));

  // Una línea detrás del artwork, más pequeña cuanto más largo es el nombre
  const giantSize = `max(14cqi, min(30cqi, calc(96cqi / ${Math.max(name.length, 1) * 0.62})))`;

  return (
    <section
      aria-labelledby={headingId}
      data-type={primary}
      className="relative isolate flex flex-col overflow-hidden rounded-surface bg-field text-field-ink @container"
    >
      <div
        aria-hidden="true"
        className="relative h-[min(66vw,300px)] md:h-[min(40svh,360px)] [container-type:size]"
      >
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black leading-none tracking-[-0.04em] opacity-[.14] select-none"
          style={{ fontSize: giantSize }}
        >
          {name}
        </span>

        <div className="absolute inset-0 float">
          <span
            className="absolute block"
            style={figureStyle(artworkId(pokemon.image), {
              height: "82cqh",
              maxWidth: "80cqw",
              centerX: "50%",
              centerY: "54%",
            })}
          >
            <Image
              src={pokemon.image}
              alt=""
              fill
              priority
              quality={90}
              sizes="(min-width: 1024px) 420px, (min-width: 768px) 41vw, 80vw"
              className="object-contain"
            />
          </span>
        </div>
      </div>

      <div className="absolute right-4 top-4 md:right-5 md:top-5">
        <PokemonSelectModal
          triggerLabel={compare.change}
          triggerAriaLabel={`${compare.change} ${name}`}
          triggerClassName={`${control} bg-surface text-ink`}
          hrefPrefix={hrefPrefix}
          currentSlug={slug}
          suggestions={suggestions}
          locale={locale}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-6 md:px-8 md:pb-8">
        <div>
          <p className="text-body font-extrabold num">
            {detail.number} {String(pokemon.id).padStart(4, "0")}
          </p>
          <h2 id={headingId} className="mt-1 text-head font-black">
            <Link
              href={detailHref(pokemon.name, locale)}
              className="rounded-[0.25em] decoration-3 underline-offset-4 hover:underline"
            >
              <span className="sr-only">{compare.viewDetail} </span>
              {name}
            </Link>
          </h2>
          {formLabel && <p className="mt-1 text-body font-black">{formLabel}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <ul className="flex flex-wrap gap-1.5">
            {types.map((type) => (
              <li
                key={type}
                className="rounded-pill type-tag px-3.5 py-1 text-small font-extrabold text-ink"
              >
                {typeNames[type]}
              </li>
            ))}
          </ul>
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-body">
            <div className="flex gap-1.5">
              <dt>{detail.height}</dt>
              <dd className="font-black num">{measure.format(pokemon.height)} m</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>{detail.weight}</dt>
              <dd className="font-black num">{measure.format(pokemon.weight)} kg</dd>
            </div>
          </dl>
        </div>

        {varieties.length > 1 && varieties.length <= MAX_OPEN_FORMS && (
          <ul aria-label={detail.forms} className="mt-auto flex flex-wrap gap-2 pt-1">
            {formLinks}
          </ul>
        )}

        {/* Con muchas formas (Pikachu tiene 16), el escenario no crece: las
            formas van plegadas detrás de una pastilla */}
        {varieties.length > MAX_OPEN_FORMS && (
          <details className="group/forms mt-auto pt-1">
            <summary
              className={`${control} w-fit list-none bg-surface text-ink [&::-webkit-details-marker]:hidden`}
            >
              {detail.forms} ({varieties.length})
              <ChevronDown
                aria-hidden="true"
                strokeWidth={2.5}
                className="size-4 motion-safe:transition-transform duration-200 group-open/forms:rotate-180"
              />
            </summary>
            <ul aria-label={detail.forms} className="mt-3 flex flex-wrap gap-2">
              {formLinks}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
