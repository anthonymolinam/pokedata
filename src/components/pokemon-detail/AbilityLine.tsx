"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { PokemonAbility } from "@/lib/pokeapi";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface AbilityLineProps {
  abilities: PokemonAbility[];
  locale: Locale;
}

// Habilidades en la línea de tipos, altura y peso del escenario (DESIGN.md
// §4.4): «Habilidades Inmunidad · Sebo · Gula (oculta)». Cada nombre es un
// botón que abre su texto de los juegos en un globo: con el ratón al pasar,
// con el teclado al enfocar y en táctil al tocar. Esc, tocar fuera o salir
// lo cierran. El globo se abre encima de la fila entera (su antepasado
// posicionado) y empieza en la vertical de su habilidad, corrido a la
// izquierda lo justo para no salirse de la fila. El texto también va en un
// aria-describedby oculto, así que el lector no depende del globo.
export default function AbilityLine({ abilities, locale }: AbilityLineProps) {
  const { detail } = getDictionary(locale);
  const other: Locale = locale === "es" ? "en" : "es";
  const [open, setOpen] = useState<string | null>(null);
  const pointer = useRef<string>("mouse");
  const root = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    const el = tip.current;
    const row = el?.offsetParent;
    const button = root.current?.querySelector(`[data-ability="${open}"]`);
    if (!el || !row || !button) return;
    const start = button.getBoundingClientRect().left - row.getBoundingClientRect().left;
    el.style.left = `${Math.max(0, Math.min(start, row.clientWidth - el.offsetWidth))}px`;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (abilities.length === 0) return null;

  const textOf = (ability: PokemonAbility) => {
    const text = ability.text[locale] ?? ability.text[other];
    return text ? { text, lang: ability.text[locale] ? undefined : other } : null;
  };
  const current = abilities.find((a) => a.slug === open);
  const currentText = current && textOf(current);

  return (
    <div ref={root} className="flex flex-wrap items-center gap-x-2.5">
      <dt>{detail.abilities}</dt>
      <dd className="flex flex-wrap items-center">
        {abilities.map((ability, index) => {
          const text = textOf(ability);
          return (
            <span key={ability.slug} className="inline-flex items-center">
              {index > 0 && (
                <span aria-hidden="true" className="px-2.5 font-black">
                  ·
                </span>
              )}
              {text ? (
                <button
                  type="button"
                  data-ability={ability.slug}
                  aria-describedby={`${id}-${ability.slug}`}
                  aria-expanded={open === ability.slug}
                  onPointerDown={(e) => (pointer.current = e.pointerType)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(ability.slug)}
                  onPointerLeave={(e) =>
                    e.pointerType === "mouse" && setOpen((o) => (o === ability.slug ? null : o))
                  }
                  onFocus={(e) => e.currentTarget.matches(":focus-visible") && setOpen(ability.slug)}
                  onBlur={() => setOpen((o) => (o === ability.slug ? null : o))}
                  onClick={() => {
                    // Con ratón ya lo abrió el hover; en táctil y con Intro, alterna
                    if (pointer.current === "mouse" && open === ability.slug) return;
                    setOpen((o) => (o === ability.slug ? null : ability.slug));
                  }}
                  className="ability-name cursor-pointer font-black"
                >
                  {ability.name[locale]}
                </button>
              ) : (
                <span className="font-black">{ability.name[locale]}</span>
              )}
              {ability.hidden && <span className="ml-1">{detail.hiddenSuffix}</span>}
              {text && (
                <span id={`${id}-${ability.slug}`} lang={text.lang} className="sr-only">
                  {text.text}
                </span>
              )}
            </span>
          );
        })}
      </dd>

      {current && currentText && (
        <div
          ref={tip}
          aria-hidden="true"
          className="ability-tip absolute bottom-full left-0 z-20 mb-2 w-max max-w-[min(22rem,100%)] rounded-lg bg-ink px-3.5 py-2.5 text-small text-bone"
        >
          <span className="font-extrabold">{current.name[locale]}</span>
          <span lang={currentText.lang} className="block">
            {currentText.text}
          </span>
        </div>
      )}
    </div>
  );
}
