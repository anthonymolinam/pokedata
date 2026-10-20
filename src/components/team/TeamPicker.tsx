"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PokemonSelectDialog } from "@/components/compare/PokemonSelectModal";
import { getDailyPokemonFor, type DailyPokemon } from "@/lib/daily";
import { loadTeamMembers } from "@/lib/team-members";
import type { PokemonSummary } from "@/lib/pokeapi";
import type { TeamForm } from "@/lib/team";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

interface TeamPickerProps {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  // Sin huecos libres: la franja lo dice y no deja añadir
  full: boolean;
  onAdd: (slug: string) => void;
}

// Los tres Pokémon del día, calculados en el navegador: la página del equipo
// es estática y el servidor los dejaría fijos en el día de la compilación. El
// índice solo se descarga al abrir el selector por primera vez.
let dailyCache: { day: string; pokemon: DailyPokemon[] } | null = null;

async function loadDaily(): Promise<DailyPokemon[]> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  if (dailyCache?.day !== day) {
    const { default: index } = await import("@/data/pokemon-index.json");
    dailyCache = { day, pokemon: getDailyPokemonFor(index, now) };
  }
  return dailyCache.pokemon;
}

// Selector «Añadir al equipo» (DESIGN.md §4.9): el diálogo del comparador con
// otro final. Tocar una tarjeta la marca y abre debajo la franja de formas de
// su especie, con «Añadir al equipo» a la derecha.
export default function TeamPicker({ open, onClose, locale, full, onAdd }: TeamPickerProps) {
  const { team } = getDictionary(locale);
  const id = useId();
  const [daily, setDaily] = useState<DailyPokemon[] | null>(null);
  const [picked, setPicked] = useState<PokemonSummary | null>(null);
  const [forms, setForms] = useState<TeamForm[] | null>(null);
  const [formSlug, setFormSlug] = useState<string | null>(null);
  // La última especie tocada: una respuesta que llega tarde no pisa a otra
  const pickedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    loadDaily().then((pokemon) => {
      if (!ignore) setDaily(pokemon);
    });
    return () => {
      ignore = true;
    };
  }, [open]);

  // Marca la especie y pide sus formas. Mientras llegan, la franja ya muestra
  // «Forma base» marcada y se puede añadir
  function pick(pokemon: PokemonSummary) {
    pickedRef.current = pokemon.name;
    setPicked(pokemon);
    setForms(null);
    setFormSlug(pokemon.name);
    loadTeamMembers([pokemon.name], locale)
      .then((members) => {
        const member = members.get(pokemon.name);
        if (!member || pickedRef.current !== pokemon.name) return;
        setForms(member.forms);
        setFormSlug(member.slug);
      })
      .catch(() => {
        // Sin PokéAPI se queda solo la forma base
      });
  }

  // Deja cargada la forma elegida, para que el campo aparezca al añadirla
  function chooseForm(slug: string) {
    setFormSlug(slug);
    loadTeamMembers([slug], locale).catch(() => {});
  }

  function handleClose() {
    pickedRef.current = null;
    setPicked(null);
    setForms(null);
    setFormSlug(null);
    onClose();
  }

  const shownForms: TeamForm[] = forms ?? (picked ? [{ slug: picked.name, name: null }] : []);

  return (
    <PokemonSelectDialog
      open={open}
      onClose={handleClose}
      title={team.selectTitle}
      locale={locale}
      suggestions={daily}
      selected={picked?.name ?? null}
      onSelect={pick}
      footer={
        picked && formSlug ? (
          <div
            data-field="raised"
            className="flex flex-wrap items-center gap-2 bg-step px-7 py-4 md:px-8 md:pb-6"
          >
            <span id={`${id}-forms`} className="mr-1.5 text-small font-extrabold">
              {team.form}
            </span>
            <div role="group" aria-labelledby={`${id}-forms`} className="flex flex-wrap gap-2">
              {shownForms.map((form) => (
                <button
                  key={form.slug}
                  type="button"
                  aria-pressed={form.slug === formSlug}
                  title={form.name?.full}
                  onClick={() => chooseForm(form.slug)}
                  className="h-10 cursor-pointer rounded-pill bg-raised px-4 text-small font-extrabold aria-pressed:bg-ink aria-pressed:text-bone motion-safe:transition-transform duration-150 active:scale-[0.96]"
                >
                  {form.name?.short ?? team.baseForm}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={full}
              onClick={() => onAdd(formSlug)}
              className="ml-auto h-11 cursor-pointer rounded-pill bg-ink px-4.5 text-small font-extrabold text-bone motion-safe:transition-transform duration-150 motion-safe:hover:-translate-y-0.5 active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-raised disabled:text-ink-soft disabled:translate-y-0 disabled:scale-100"
            >
              {full ? team.full : team.addToTeam}
            </button>
          </div>
        ) : null
      }
    />
  );
}
