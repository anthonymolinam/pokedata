"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { SPECIES_CLASS_KEYS } from "@/constants/speciesClasses";
import {
  getDiceFilters,
  getDiceFiltersServer,
  setDiceFilter,
  subscribeToDiceFilters,
} from "@/lib/dice-filters";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Opciones del dado (DESIGN.md §4.9): botón redondo de 44px junto al dado, con
// el mismo globo, que abre una capa flotante con un interruptor por clase de
// especie (legendarios, singulares, ultraentes y paradoja). En la columna de
// escritorio se abre encima del botón; junto al título (móvil y tableta),
// debajo de la fila de botones, que es su antepasado posicionado: así en
// móvil empieza en el margen de la página y no se sale por la derecha. Esc,
// tocar fuera o sacar el foco la cierran; con Esc el foco vuelve al botón.
export default function DiceOptionsButton({
  locale,
  placement,
}: {
  locale: Locale;
  placement: "above" | "below";
}) {
  const { team } = getDictionary(locale);
  const filters = useSyncExternalStore(subscribeToDiceFilters, getDiceFilters, getDiceFiltersServer);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('[role="switch"]')?.focus();
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className={placement === "above" ? "relative" : undefined}
      onBlur={(e) => {
        // Tabular fuera de la capa la cierra
        if (open && !root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={team.diceOptions}
        data-tip={team.diceOptions}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className="icon-tip relative grid place-items-center size-11 shrink-0 rounded-pill bg-surface dark:bg-control text-ink cursor-pointer motion-safe:transition-transform duration-150 motion-safe:hover:-translate-y-0.5 active:scale-[0.92]"
      >
        <SlidersHorizontal aria-hidden="true" strokeWidth={2.5} className="size-5" />
      </button>

      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-labelledby={`${id}-title`}
          data-field="raised"
          className={`menu-in absolute z-30 w-[min(20rem,calc(100vw-32px))] rounded-[18px] bg-raised p-1.5 text-ink shadow-(--shadow-overlay) ${
            placement === "above"
              ? "bottom-[calc(100%+10px)] right-0"
              : "top-[calc(100%+10px)] max-sm:left-0 sm:right-0"
          }`}
        >
          <p id={`${id}-title`} className="px-3 pb-1 pt-2.5 text-body font-black">
            {team.diceIncludes}
          </p>
          <ul>
            {SPECIES_CLASS_KEYS.map((key) => {
              const on = filters[key];
              const { label, examples } = team.diceClasses[key];
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-describedby={`${id}-${key}`}
                    onClick={() => setDiceFilter(key, !on)}
                    className="flex w-full min-h-14 cursor-pointer items-center gap-4 rounded-[12px] px-3 py-2 text-left hover:bg-step focus-visible:bg-step"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-extrabold">{label}</span>
                      <span id={`${id}-${key}`} className="block truncate text-small text-ink-soft">
                        {examples}
                      </span>
                    </span>
                    {/* El estado no va solo en el color: la bola cambia de
                        lado y, encendido, lleva la marca Check */}
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-12 shrink-0 items-center rounded-pill p-1 motion-safe:transition-colors duration-150 ${
                        on ? "bg-ink" : "bg-step"
                      }`}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-pill motion-safe:transition-transform duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                          on ? "translate-x-5 bg-bone text-ink" : "bg-ink-soft"
                        }`}
                      >
                        {on && <Check strokeWidth={3.5} className="size-3" />}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="px-3 pb-2.5 pt-1.5 text-small text-ink-soft">{team.diceNote}</p>
        </div>
      )}
    </div>
  );
}
