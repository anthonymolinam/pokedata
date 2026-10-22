"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
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

// La hoja móvil flota sobre la página y es la única capa de los filtros con
// sombra (DESIGN.md §4.0); el panel de escritorio va en la página, sin ella
const SHEET_SHADOW = "shadow-(--shadow-sheet)";
const PANEL_EASE = [0.22, 0.8, 0.24, 1] as const;

const pill =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-pill font-extrabold text-small cursor-pointer active:scale-[0.96] motion-safe:transition-transform duration-150";
// Pastillas compactas del panel de escritorio (40px), para que todo quepa
// sin scroll
const compactPill =
  "inline-flex items-center justify-center gap-1.5 w-full h-10 px-3 rounded-pill font-extrabold text-small whitespace-nowrap cursor-pointer active:scale-[0.96] motion-safe:transition-transform duration-150 motion-safe:hover:-translate-y-0.5";
const secondary = `${pill} bg-ink text-bone`;
const iconButton =
  "grid place-items-center size-11 rounded-pill bg-control cursor-pointer active:scale-[0.96] motion-safe:transition-transform duration-150";
// Selección igual en tipos y regiones: ✓ y el borde único de selección
// (§2.3, regla 8), por dentro de la pastilla
const selectedRing = "ring-selected";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// Escritorio y móvil cambian la capa: panel dentro de la página u hoja inferior
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
// con contador a la derecha, panel con regiones y tipos y una fila de chips
// removibles. Todo vive en la URL: ?types=fire,flying y ?gen=1, junto a la
// búsqueda del hero (?q=), que se conserva. El panel se aplica con «Aplicar».
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

  // Los filtros aplicados cambian al momento, sin esperar a la nueva URL
  const [, startTransition] = useTransition();
  const [selection, setSelection] = useOptimistic({ types: urlTypes, gen: urlGen });
  const activeTypes = selection.types;
  const activeGen = selection.gen;
  const activeCount = activeTypes.length + (activeGen !== null ? 1 : 0);

  const [open, setOpen] = useState(false);
  // En el panel se elige un borrador, que solo se aplica con «Aplicar»
  const [draftTypes, setDraftTypes] = useState<PokemonType[]>([]);
  const [draftGen, setDraftGen] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const draftKey = `${[...draftTypes].sort().join(",")}|${draftGen ?? ""}`;
  const appliedKey = `${[...activeTypes].sort().join(",")}|${activeGen ?? ""}`;
  const dirty = draftKey !== appliedKey;

  const regionName = (id: number) => filters.regionNames[id - 1];

  const navigate = (types: PokemonType[], gen: number | null) => {
    const params = new URLSearchParams();
    if (types.length > 0) params.set("types", types.join(","));
    if (gen !== null) params.set("gen", String(gen));
    // La búsqueda del hero se mantiene al cambiar los filtros
    const search = searchParams.get("q");
    if (search) params.set("q", search);
    const query = params.toString();
    startTransition(() => {
      setSelection({ types, gen });
      router.push(`/${locale}${query ? `?${query}` : ""}`, { scroll: false });
    });
  };

  const openPanel = () => {
    setDraftTypes(activeTypes);
    setDraftGen(activeGen);
    setOpen(true);
  };

  const toggleType = (type: PokemonType) => {
    setDraftTypes((current) => {
      if (current.includes(type)) return current.filter((t) => t !== type);
      if (current.length >= MAX_TYPES) return [current[0], type];
      return [...current, type];
    });
  };

  const toggleGen = (id: number) =>
    setDraftGen((current) => (current === id ? null : id));

  const apply = () => {
    navigate(draftTypes, draftGen);
    setOpen(false);
  };

  // Abierto: Esc cierra. En móvil la hoja toma el foco sin desplazar la
  // página, que no se mueve por detrás. Al cerrar, el foco vuelve al botón
  // si estaba dentro del panel.
  useEffect(() => {
    if (!open) return;
    if (isMobile) sheetRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const { overflow } = document.body.style;
    if (isMobile) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    const button = buttonRef.current;
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      const focused = document.activeElement;
      if (focused === document.body || document.getElementById("filters-panel")?.contains(focused)) {
        button?.focus({ preventScroll: true });
      }
    };
  }, [open, isMobile]);

  // El Tab no sale de la hoja mientras está abierta
  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !sheetRef.current) return;
    const items = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  const closeButton = (
    <button
      type="button"
      aria-label={filters.close}
      onClick={() => setOpen(false)}
      className={iconButton}
    >
      <X aria-hidden="true" strokeWidth={2.5} className="size-5" />
    </button>
  );

  // «Limpiar» vacía el borrador; «Aplicar» está desactivado mientras el
  // borrador no cambie nada
  const actions = (
    <>
      <button
        type="button"
        onClick={() => {
          setDraftTypes([]);
          setDraftGen(null);
        }}
        className={`${pill} bg-control text-ink`}
      >
        {filters.clear}
      </button>
      <button
        type="button"
        onClick={apply}
        disabled={!dirty}
        className={`${secondary} disabled:bg-step disabled:text-ink-soft disabled:cursor-not-allowed disabled:active:scale-100`}
      >
        {filters.apply}
      </button>
    </>
  );

  const typesHeading = (
    <div className="flex items-baseline gap-3 mb-3">
      <h3 id="filters-types" className="font-extrabold">
        {filters.types}
      </h3>
      <p className="text-small text-ink-soft">{filters.typesHint}</p>
    </div>
  );

  // Escritorio: panel blanco dentro de la página, a todo el ancho, que empuja
  // las tarjetas. Las 9 regiones en una fila y los 18 tipos en dos (en
  // tableta, las regiones pasan a dos filas y los tipos a tres).
  const desktopPanel = (
    <div className="mt-4 rounded-surface bg-surface text-ink p-6">
      <section aria-labelledby="filters-region">
        <div className="flex items-center justify-between gap-4 -mt-1.5 mb-3">
          <h3 id="filters-region" className="font-extrabold">
            {filters.region}
          </h3>
          {closeButton}
        </div>
        <ul className="grid grid-cols-5 lg:grid-cols-9 gap-2">
          {GENERATIONS.map((gen) => {
            const selected = draftGen === gen.id;
            return (
              <li key={gen.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleGen(gen.id)}
                  className={`${compactPill} bg-control text-ink ${selected ? selectedRing : ""}`}
                >
                  {selected && (
                    <Check aria-hidden="true" strokeWidth={3.5} className="size-3.5 shrink-0 -ml-0.5" />
                  )}
                  {regionName(gen.id)}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="filters-types" className="mt-6">
        {typesHeading}
        <ul className="grid grid-cols-6 lg:grid-cols-9 gap-2">
          {POKEMON_TYPES.map((type) => {
            const selected = draftTypes.includes(type);
            return (
              <li key={type}>
                <button
                  type="button"
                  data-type={type}
                  aria-pressed={selected}
                  onClick={() => toggleType(type)}
                  className={`${compactPill} bg-field text-field-ink ${selected ? selectedRing : ""}`}
                >
                  {selected && (
                    <Check aria-hidden="true" strokeWidth={3.5} className="size-3.5 shrink-0 -ml-0.5" />
                  )}
                  {typeNames[type]}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex items-center justify-end gap-2 mt-6">{actions}</div>
    </div>
  );

  // Móvil: hoja inferior con bloques grandes, a dedo
  const sheetBody = (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filters-title"
      tabIndex={-1}
      onKeyDown={trapFocus}
      className="flex flex-1 min-h-0 flex-col outline-none"
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
        <h2 id="filters-title" className="text-lead font-black">
          {filters.title}
        </h2>
        {closeButton}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar px-6 pb-6">
        <section aria-labelledby="filters-types">
          {typesHeading}
          <ul className="grid grid-cols-2 gap-2">
            {POKEMON_TYPES.map((type) => {
              const selected = draftTypes.includes(type);
              return (
                <li key={type}>
                  <button
                    type="button"
                    data-type={type}
                    aria-pressed={selected}
                    onClick={() => toggleType(type)}
                    className={`${pill} w-full bg-field text-field-ink ${selected ? selectedRing : ""}`}
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
                    onClick={() => toggleGen(gen.id)}
                    className={`${pill} bg-control text-ink ${selected ? selectedRing : ""}`}
                  >
                    {selected && (
                      <Check aria-hidden="true" strokeWidth={3.5} className="size-4 -ml-1" />
                    )}
                    {regionName(gen.id)}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="flex items-center justify-end gap-2 px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-raised rounded-b-[inherit]">
        {actions}
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

        <button
          ref={buttonRef}
          type="button"
          aria-haspopup={isMobile ? "dialog" : undefined}
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
      </div>

      <AnimatePresence initial={false}>
        {open &&
          (isMobile ? (
            <motion.div
              key="sheet"
              id="filters-panel"
              className="fixed inset-0 z-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div
                aria-hidden="true"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-on-light/40"
              />
              <motion.div
                initial={{ y: reduceMotion ? 0 : "100%" }}
                animate={{ y: 0 }}
                exit={{ y: reduceMotion ? 0 : "100%" }}
                transition={{ duration: 0.25, ease: PANEL_EASE }}
                className={`absolute inset-x-0 bottom-0 max-h-[92svh] flex flex-col bg-raised text-ink rounded-t-surface ${SHEET_SHADOW}`}
              >
                {sheetBody}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="panel"
              id="filters-panel"
              role="region"
              aria-label={filters.title}
              initial={{ height: reduceMotion ? "auto" : 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: reduceMotion ? "auto" : 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: PANEL_EASE }}
              className="overflow-hidden"
            >
              {desktopPanel}
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Chips de filtros activos: la fila solo existe con filtros */}
      {activeCount > 0 && (
        <ul aria-label={filters.active} className="mt-4 flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false}>
            {activeTypes.map((type) => (
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
                      activeTypes.filter((t) => t !== type),
                      activeGen,
                    )
                  }
                  className="relative grid place-items-center size-8 ml-1 rounded-pill cursor-pointer active:scale-[0.9] motion-safe:transition-transform duration-150 after:absolute after:-inset-1.5"
                >
                  <X aria-hidden="true" strokeWidth={3} className="size-4" />
                </button>
              </motion.li>
            ))}
            {activeGen !== null && (
              <motion.li
                key="region"
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center h-10 pl-4 pr-1 rounded-pill bg-surface text-ink font-extrabold text-small"
              >
                {regionName(activeGen)}
                <button
                  type="button"
                  aria-label={`${filters.remove} ${regionName(activeGen)}`}
                  onClick={() => navigate(activeTypes, null)}
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
