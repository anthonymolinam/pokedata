"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { GENERATIONS } from "@/constants/generations";
import { POKEMON_TYPES, type PokemonType } from "@/constants/typeChart";
import { isPokemonType } from "@/constants/typeColors";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Un Pokémon tiene como mucho dos tipos y el filtro es su intersección: al
// elegir un tercero, sustituye al segundo
const MAX_TYPES = 2;

// Capas flotantes (DESIGN.md §4.0): las únicas con sombra
const PANEL_SHADOW = "shadow-[0_18px_48px_rgb(21_22_28/0.16)]"; // taste-skill-ignore
const SHEET_SHADOW = "shadow-[0_-12px_32px_rgb(21_22_28/0.18)]"; // taste-skill-ignore
const PANEL_EASE = [0.22, 0.8, 0.24, 1] as const;

const pill =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill font-extrabold text-small cursor-pointer active:scale-[0.96] motion-safe:transition-transform duration-150";
const secondary = `${pill} bg-ink text-bone`;
const iconButton =
  "grid place-items-center size-11 rounded-pill bg-step cursor-pointer active:scale-[0.96] motion-safe:transition-transform duration-150";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// Escritorio y móvil cambian la capa: flotante bajo el botón u hoja inferior
const MOBILE_QUERY = "(max-width: 767px)";
const subscribeMobile = (onChange: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

interface PokemonFiltersBarProps {
  locale: Locale;
  // «Pokédex Nacional» o la región activa
  title: string;
  // Recuento («151 Pokémon»); llega aparte porque depende de los datos
  count: ReactNode;
}

// Barra de filtros (§4.3): título y recuento a la izquierda, botón «Filtros»
// con contador a la derecha, panel con tipos y regiones y una fila de chips
// removibles. Todo vive en la URL: ?types=fire,flying y ?gen=1, junto a la
// búsqueda del hero (?q=), que se conserva.
export default function PokemonFiltersBar({
  locale,
  title,
  count,
}: PokemonFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const { filters, typeNames } = getDictionary(locale);

  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );

  const urlTypes = (searchParams.get("types") ?? "")
    .split(",")
    .filter(isPokemonType)
    .slice(0, MAX_TYPES);
  const genParam = Number(searchParams.get("gen"));
  const urlGen = GENERATIONS.some((g) => g.id === genParam) ? genParam : null;
  const activeCount = urlTypes.length + (urlGen !== null ? 1 : 0);

  const [open, setOpen] = useState(false);
  const [draftTypes, setDraftTypes] = useState<PokemonType[]>([]);
  const [draftGen, setDraftGen] = useState<number | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const regionName = (id: number) => filters.regionNames[id - 1];

  const navigate = (types: string[], gen: number | null) => {
    const params = new URLSearchParams();
    if (types.length > 0) params.set("types", types.join(","));
    if (gen !== null) params.set("gen", String(gen));
    // La búsqueda del hero se mantiene al cambiar los filtros
    const search = searchParams.get("q");
    if (search) params.set("q", search);
    const query = params.toString();
    router.push(`/${locale}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const openPanel = () => {
    setDraftTypes(urlTypes);
    setDraftGen(urlGen);
    setOpen(true);
  };

  const toggleType = (type: PokemonType) => {
    setDraftTypes((current) => {
      if (current.includes(type)) return current.filter((t) => t !== type);
      if (current.length >= MAX_TYPES) return [current[0], type];
      return [...current, type];
    });
  };

  const apply = () => {
    navigate(draftTypes, draftGen);
    setOpen(false);
  };

  // Abierto: foco dentro del panel, Esc y clic fuera cierran, y en móvil la
  // página no se desplaza por detrás. Al cerrar, el foco vuelve al botón.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const { overflow } = document.body.style;
    if (isMobile) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    const button = buttonRef.current;
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      button?.focus();
    };
  }, [open, isMobile]);

  // El Tab no sale del panel mientras está abierto
  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const panelBody = (
    <div
      ref={panelRef}
      id="filters-panel"
      role="dialog"
      aria-modal={isMobile || undefined}
      aria-labelledby="filters-title"
      tabIndex={-1}
      onKeyDown={trapFocus}
      className="flex flex-1 min-h-0 flex-col outline-none"
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
        <h2 id="filters-title" className="text-lead font-black">
          {filters.title}
        </h2>
        <button
          type="button"
          aria-label={filters.close}
          onClick={() => setOpen(false)}
          className={iconButton}
        >
          <X aria-hidden="true" strokeWidth={2.5} className="size-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-6 pb-6">
        <section aria-labelledby="filters-types">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <h3 id="filters-types" className="font-extrabold">
              {filters.types}
            </h3>
            <p className="text-small text-ink-soft">{filters.typesHint}</p>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {POKEMON_TYPES.map((type) => {
              const selected = draftTypes.includes(type);
              return (
                <li key={type}>
                  <button
                    type="button"
                    data-type={type}
                    aria-pressed={selected}
                    onClick={() => toggleType(type)}
                    className={`${pill} w-full bg-field text-field-ink ${
                      selected ? "ring-3 ring-ink ring-offset-2 ring-offset-surface" : ""
                    }`}
                  >
                    {selected && (
                      <Check aria-hidden="true" strokeWidth={3.5} className="size-4 -ml-1" />
                    )}
                    {typeNames[type]}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="filters-region" className="mt-7">
          <h3 id="filters-region" className="font-extrabold mb-3">
            {filters.region}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {GENERATIONS.map((gen) => {
              const selected = draftGen === gen.id;
              return (
                <li key={gen.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setDraftGen(selected ? null : gen.id)}
                    className={`${pill} ${selected ? "bg-ink text-bone" : "bg-step text-ink hover:-translate-y-0.5"}`}
                  >
                    {regionName(gen.id)}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="flex items-center justify-end gap-2 px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-surface rounded-b-[inherit]">
        <button
          type="button"
          onClick={() => {
            setDraftTypes([]);
            setDraftGen(null);
          }}
          className={`${pill} bg-step text-ink`}
        >
          {filters.clear}
        </button>
        <button type="button" onClick={apply} className={secondary}>
          {filters.show}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 min-h-13 md:min-h-14">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 id="pokedex-title" className="text-head font-black">
            {title}
          </h2>
          <p className="text-body num">{count}</p>
        </div>

        <div ref={anchorRef} className="relative">
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? "filters-panel" : undefined}
            onClick={() => (open ? setOpen(false) : openPanel())}
            className={secondary}
          >
            <SlidersHorizontal aria-hidden="true" strokeWidth={2.5} className="size-4 -ml-1" />
            {filters.button}
            {activeCount > 0 && (
              <span className="grid place-items-center min-w-6 h-6 px-1.5 -mr-2 rounded-pill bg-surface text-ink font-black num">
                {activeCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {open &&
              (isMobile ? (
                <motion.div
                  key="sheet"
                  className="fixed inset-0 z-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    aria-hidden="true"
                    onClick={() => setOpen(false)}
                    className="absolute inset-0 bg-ink/40"
                  />
                  <motion.div
                    initial={{ y: reduceMotion ? 0 : "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: reduceMotion ? 0 : "100%" }}
                    transition={{ duration: 0.25, ease: PANEL_EASE }}
                    className={`absolute inset-x-0 bottom-0 max-h-[92svh] flex flex-col bg-surface text-ink rounded-t-surface ${SHEET_SHADOW}`}
                  >
                    {panelBody}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  transition={{ duration: 0.25, ease: PANEL_EASE }}
                  className={`absolute right-0 top-full mt-3 z-40 w-[35rem] max-w-[calc(100vw-2*var(--gutter))] max-h-[min(42rem,calc(100svh-11rem))] flex flex-col bg-surface text-ink rounded-surface ${PANEL_SHADOW}`}
                >
                  {panelBody}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chips de filtros activos: la fila solo existe con filtros */}
      {activeCount > 0 && (
        <ul aria-label={filters.active} className="mt-4 flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {urlTypes.map((type) => (
              <motion.li
                key={type}
                data-type={type}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center h-10 pl-4 pr-1 rounded-pill bg-field text-field-ink font-extrabold text-small"
              >
                {typeNames[type]}
                <button
                  type="button"
                  aria-label={`${filters.remove} ${typeNames[type]}`}
                  onClick={() =>
                    navigate(
                      urlTypes.filter((t) => t !== type),
                      urlGen,
                    )
                  }
                  className="relative grid place-items-center size-8 ml-1 rounded-pill cursor-pointer active:scale-[0.9] motion-safe:transition-transform duration-150 after:absolute after:-inset-1.5"
                >
                  <X aria-hidden="true" strokeWidth={3} className="size-4" />
                </button>
              </motion.li>
            ))}
            {urlGen !== null && (
              <motion.li
                key="region"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center h-10 pl-4 pr-1 rounded-pill bg-surface text-ink font-extrabold text-small"
              >
                {regionName(urlGen)}
                <button
                  type="button"
                  aria-label={`${filters.remove} ${regionName(urlGen)}`}
                  onClick={() => navigate(urlTypes, null)}
                  className="relative grid place-items-center size-8 ml-1 rounded-pill cursor-pointer active:scale-[0.9] motion-safe:transition-transform duration-150 after:absolute after:-inset-1.5"
                >
                  <X aria-hidden="true" strokeWidth={3} className="size-4" />
                </button>
              </motion.li>
            )}
          </AnimatePresence>
          <li>
            <button
              type="button"
              onClick={() => navigate([], null)}
              className="h-11 px-2 rounded-pill font-extrabold text-small underline underline-offset-4 decoration-2 cursor-pointer"
            >
              {filters.clearAll}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
