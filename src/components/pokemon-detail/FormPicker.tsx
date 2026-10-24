"use client";

import { KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { PokemonVariety } from "@/lib/pokeapi";
import { formatVariantLabel } from "@/lib/pokemon-names";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface FormPickerProps {
  varieties: PokemonVariety[];
  selected: string;
  onChange: (variant: PokemonVariety) => void;
  locale: Locale;
  pill: string;
}

const MAX_LINES = 2;
const GAP = 8;

// Líneas que ocupan unas pastillas de estos anchos al partirse en `width`
function lineCount(widths: number[], width: number): number {
  let lines = 0;
  let used = Infinity;
  for (const w of widths) {
    if (used + GAP + w > width) {
      lines++;
      used = w;
    } else used += GAP + w;
  }
  return lines;
}

// Índices de las formas que caben en dos líneas junto a «+N formas». La
// seleccionada entra siempre: si no estaba entre las primeras, sustituye a la
// última que cabía
function fit(widths: number[], more: number, width: number, selected: number): number[] {
  const all = widths.map((_, i) => i);
  if (lineCount(widths, width) <= MAX_LINES) return all;
  for (let k = widths.length - 1; k > 0; k--) {
    const shown = selected < k ? all.slice(0, k) : [...all.slice(0, k - 1), selected];
    if (lineCount([...shown.map((i) => widths[i]), more], width) <= MAX_LINES) return shown;
  }
  return [selected];
}

// Antes de medir (servidor e hidratación) se adivina: con muchas formas,
// las cinco primeras más la seleccionada
function guess(count: number, selected: number): number[] {
  const all = Array.from({ length: count }, (_, i) => i);
  if (count <= 6) return all;
  return selected < 5 ? all.slice(0, 5) : [...all.slice(0, 4), selected];
}

// Selector de formas del escenario (DESIGN.md §4.4): pastillas en una o dos
// líneas bajo la etiqueta «Formas», alineadas a la derecha desde 768px. Las que no caben se agrupan en
// «+N formas», que abre un menú encima con el resto. Una copia invisible de
// todas las pastillas da sus anchos; al cambiar el ancho se vuelve a repartir.
export default function FormPicker({ varieties, selected, onChange, locale, pill }: FormPickerProps) {
  const { detail } = getDictionary(locale);
  const isEs = locale === "es";
  const selectedIndex = Math.max(0, varieties.findIndex((v) => v.name === selected));
  const [shown, setShown] = useState(() => guess(varieties.length, selectedIndex));
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useLayoutEffect(() => {
    const box = root.current;
    const marks = ruler.current;
    if (!box || !marks) return;
    const measure = () => {
      const widths = [...marks.children].map((el) => el.getBoundingClientRect().width);
      const more = widths.pop() ?? 0;
      const next = fit(widths, more, box.clientWidth, selectedIndex);
      setShown((prev) => (prev.join() === next.join() ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [varieties, selectedIndex, locale]);

  const hidden = varieties.filter((_, i) => !shown.includes(i));

  // El menú, encima del botón y dentro del ancho del selector
  useLayoutEffect(() => {
    const el = menu.current;
    const button = trigger.current;
    const box = root.current;
    if (!open || !el || !button || !box) return;
    const end = button.getBoundingClientRect().right - box.getBoundingClientRect().left;
    el.style.left = `${Math.max(0, Math.min(end - el.offsetWidth, box.clientWidth - el.offsetWidth))}px`;
    el.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
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

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next = 0;
    if (e.key === "End") next = items.length - 1;
    else if (e.key === "ArrowDown") next = (current + 1) % items.length;
    else if (e.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  const label = (v: PokemonVariety) => formatVariantLabel(v.label, isEs);
  const moreLabel = (n: number) => (n === 1 ? detail.moreForm : detail.moreForms.replace("{n}", String(n)));

  return (
    <div ref={root} className="relative w-full">
      {/* La etiqueta visible separa las formas de «Añadir al equipo» */}
      <p id={labelId} className="mb-2 text-body md:text-right">
        {detail.forms}
      </p>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2 md:justify-end">
        {shown.map((i) => {
          const variant = varieties[i];
          return (
            <button
              key={variant.name}
              type="button"
              aria-pressed={variant.name === selected}
              onClick={() => onChange(variant)}
              className={pill}
            >
              {label(variant)}
            </button>
          );
        })}
        {hidden.length > 0 && (
          <button
            ref={trigger}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={pill}
          >
            {moreLabel(hidden.length)}
          </button>
        )}
      </div>

      {open && hidden.length > 0 && (
        <div
          ref={menu}
          role="menu"
          aria-label={detail.forms}
          data-field="raised"
          onKeyDown={onMenuKey}
          className="menu-in absolute bottom-full z-20 mb-2 grid max-h-[min(30rem,55svh)] w-max min-w-48 max-w-full gap-0.5 overflow-y-auto rounded-[18px] bg-raised p-1.5 text-ink shadow-(--shadow-overlay)"
        >
          {hidden.map((variant) => (
            <button
              key={variant.name}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(variant);
                setOpen(false);
                trigger.current?.focus();
              }}
              className="flex min-h-11 cursor-pointer items-center rounded-[12px] px-3 text-left text-small font-extrabold hover:bg-step focus-visible:bg-step"
            >
              {label(variant)}
            </button>
          ))}
        </div>
      )}

      {/* Regla: todas las pastillas y el botón «+N», para medir sus anchos */}
      <div
        ref={ruler}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 flex w-max"
      >
        {varieties.map((variant) => (
          <span key={variant.name} className={`${pill} inline-flex items-center whitespace-nowrap`}>
            {label(variant)}
          </span>
        ))}
        <span className={`${pill} inline-flex items-center whitespace-nowrap`}>
          {moreLabel(varieties.length)}
        </span>
      </div>
    </div>
  );
}
