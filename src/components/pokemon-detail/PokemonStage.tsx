"use client";

import { useEffect, useState } from "react";
import Artwork from "@/components/common/Artwork";
import AddToTeamButton from "@/components/pokemon-detail/AddToTeamButton";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PokemonDetail, PokemonVariety } from "@/lib/pokeapi";
import { ARTWORK_SIZE, figureStyle, spriteUrl } from "@/lib/artwork";
import { formatPokemonHeroName, formatVariantLabel } from "@/lib/pokemon-names";
import { isPokemonType } from "@/constants/typeColors";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface PokemonStageProps {
  pokemon: PokemonDetail;
  selectedVariant: PokemonVariety | null;
  onVariantChange: (variant: PokemonVariety) => void;
  locale: Locale;
}

// Cambio de forma (§6): el artwork se cruza en 400ms
const CROSSFADE = { duration: 0.4, ease: "easeOut" } as const;

// Pulsación y hover con rebote de los controles (§4.0)
const control =
  "min-h-11 rounded-pill px-4 text-small font-extrabold cursor-pointer bg-surface text-ink aria-pressed:ring-selected motion-safe:transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:-translate-y-0.5 active:scale-[0.96]";

// El id sale de la URL del artwork (…/official-artwork/6.png, también la
// variocolor) para normalizar la figura; las formas sin medidas caen a
// object-fit: contain
function artworkId(url: string): number {
  const match = url.match(/\/(\d+)\.png$/);
  return match ? Number(match[1]) : 0;
}

// Descarga y decodifica el artwork antes de cruzarlo: mientras tanto se queda
// el anterior en lugar de un escenario vacío. Si falla se cruza igual y el
// respaldo de Artwork ocupa su sitio.
function useLoadedImage(url: string): string {
  const [loaded, setLoaded] = useState(url);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.src = spriteUrl(url);
    img
      .decode()
      .catch(() => {})
      .then(() => {
        if (!cancelled) setLoaded(url);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return loaded;
}

// La variocolor solo se pide al pulsar y jsDelivr tarda hasta un par de
// segundos con lo que no tiene en caché: se adelanta su descarga cuando la
// página ya ha cargado, para que el cambio sea inmediato
function usePreload(url: string | undefined) {
  useEffect(() => {
    if (!url) return;
    const preload = () => {
      new window.Image().src = spriteUrl(url);
    };
    if (document.readyState === "complete") {
      preload();
      return;
    }
    window.addEventListener("load", preload, { once: true });
    return () => window.removeEventListener("load", preload);
  }, [url]);
}

// Escenario de la ficha (DESIGN.md §4.4): campo del tipo principal con el
// nombre gigante detrás del artwork, que flota despacio, y debajo, sobre el
// mismo campo, el nombre real, los datos y el selector de formas.
export default function PokemonStage({
  pokemon,
  selectedVariant,
  onVariantChange,
  locale,
}: PokemonStageProps) {
  const { detail, typeNames } = getDictionary(locale);
  const isEs = locale === "es";
  const [shiny, setShiny] = useState(false);

  const active = selectedVariant ?? pokemon;
  const types = active.types.map((t) => t.toLowerCase()).filter(isPokemonType);
  const primary = types[0] ?? "normal";

  // Al cambiar de forma, el campo nuevo entra como capa sobre el anterior
  const [field, setField] = useState({ current: primary, previous: primary });
  if (field.current !== primary) {
    setField({ current: primary, previous: field.current });
  }

  const name = formatPokemonHeroName(pokemon.name, locale);
  const formLabel =
    selectedVariant && !selectedVariant.isDefault
      ? formatVariantLabel(selectedVariant.label, isEs)
      : null;
  const image = useLoadedImage(shiny && active.shinyImage ? active.shinyImage : active.image);
  usePreload(active.shinyImage ?? undefined);
  const varieties = pokemon.varieties ?? [];
  const measure = new Intl.NumberFormat(isEs ? "es-ES" : "en-US", {
    maximumFractionDigits: 1,
  });

  // Una línea: hasta 22vw (40vw en móvil), y menos si el nombre es largo. Por
  // debajo de 12cqi deja de encoger y el escenario lo recorta por los lados.
  const giantSize = `max(12cqi, min(var(--giant), calc(96cqi / ${Math.max(name.length, 1) * 0.62})))`;

  return (
    <section
      aria-labelledby="pokemon-name"
      data-type={primary}
      className="relative isolate overflow-hidden rounded-[22px] md:rounded-[32px] bg-field text-field-ink @container [--giant:40vw] md:[--giant:22vw]"
    >
      <div
        aria-hidden="true"
        data-type={field.previous}
        className="absolute inset-0 -z-10 bg-field"
      />
      <div
        key={field.current}
        aria-hidden="true"
        data-type={field.current}
        className="absolute inset-0 -z-10 bg-field fade-in"
      />

      {/* Variocolor: interruptor aparte, arriba a la derecha, que se combina
          con cualquier forma */}
      {active.shinyImage && (
        <button
          type="button"
          aria-pressed={shiny}
          aria-label={detail.shiny}
          title={detail.shiny}
          onClick={() => setShiny((on) => !on)}
          className={`${control} absolute right-4 top-4 z-10 grid size-12 place-items-center px-0 md:right-6 md:top-6`}
        >
          <Sparkles aria-hidden="true" strokeWidth={2.5} className="size-5" />
        </button>
      )}

      <div
        aria-hidden="true"
        className="relative h-[min(86vw,48svh)] md:h-[min(52svh,600px)] [container-type:size]"
      >
        <span
          className="pointer-events-none absolute left-1/2 top-[40%] md:top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black leading-none tracking-[-0.04em] opacity-[.14] select-none"
          style={{ fontSize: giantSize }}
        >
          {name}
        </span>

        <AnimatePresence initial={false}>
          <motion.div
            key={image}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={CROSSFADE}
          >
            <div className="absolute inset-0 float">
              <span
                className="absolute block"
                style={figureStyle(artworkId(image), {
                  height: "84cqh",
                  maxWidth: "90cqw",
                  centerX: "50%",
                  centerY: "54%",
                  maxSize: `${ARTWORK_SIZE}px`,
                })}
              >
                <Artwork
                  src={image}
                  alt=""
                  fill
                  priority
                  sizes={`(min-width: 768px) ${ARTWORK_SIZE}px, 90vw`}
                  className="object-contain"
                />
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 px-5 pb-6 md:px-10 md:pb-10">
        <div className="min-w-0">
          {/* La forma va en la línea del número, así el escenario mide lo
              mismo con cualquier forma */}
          <p title={formLabel ?? undefined} className="truncate text-body font-extrabold num">
            {detail.number} {String(pokemon.id).padStart(4, "0")}
            {formLabel && <span className="font-black"> · {formLabel}</span>}
          </p>
          <h1 id="pokemon-name" className="mt-1 text-hero font-black">
            {name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
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
            <dl className="flex flex-wrap gap-x-5 gap-y-1 text-body">
              <div className="flex gap-1.5">
                <dt>{detail.height}</dt>
                <dd className="font-black num">{measure.format(active.height)} m</dd>
              </div>
              <div className="flex gap-1.5">
                <dt>{detail.weight}</dt>
                <dd className="font-black num">{measure.format(active.weight)} kg</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Las formas y, al final de la misma fila, «Añadir al equipo» con la
            forma que se ve (sin variocolor: el equipo usa el artwork normal) */}
        <div className="flex max-w-xl flex-wrap gap-2 md:justify-end">
          {varieties.length > 1 && (
            <div role="group" aria-label={detail.forms} className="contents">
              {varieties.map((variant) => (
                <button
                  key={variant.name}
                  type="button"
                  aria-pressed={(selectedVariant?.name ?? pokemon.name) === variant.name}
                  onClick={() => onVariantChange(variant)}
                  className={control}
                >
                  {formatVariantLabel(variant.label, isEs)}
                </button>
              ))}
            </div>
          )}
          <AddToTeamButton
            slug={selectedVariant && !selectedVariant.isDefault ? selectedVariant.name : pokemon.name}
            locale={locale}
          />
        </div>
      </div>
    </section>
  );
}
