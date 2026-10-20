"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import TeamDefense from "@/components/team/TeamDefense";
import TeamFields, { type TeamSlot } from "@/components/team/TeamFields";
import TeamPicker from "@/components/team/TeamPicker";
import {
  TEAM_SIZE,
  getTeamServerSnapshot,
  getTeamSnapshot,
  setTeam,
  subscribeToTeam,
} from "@/lib/team";
import { getCachedMember, loadTeamMembers } from "@/lib/team-members";
import { Locale } from "@/proxy";

// Pide los miembros que faltan y, cuando llegan, limpia el equipo guardado:
// descarta los slugs desconocidos y cambia cada slug por el que devuelve la
// API (la forma por defecto vuelve como la especie). Si la API falla, esos
// huecos se quedan como fantasmas hasta la próxima visita.
function useTeamMembers(slugs: string[] | null, locale: Locale) {
  // Se incrementa al llegar datos nuevos para volver a leer la caché
  const [, setVersion] = useState(0);
  const key = slugs?.join(",") ?? null;

  useEffect(() => {
    if (key === null) return;
    const requested = key ? key.split(",") : [];
    if (requested.every((s) => getCachedMember(locale, s) !== undefined)) return;

    const controller = new AbortController();
    loadTeamMembers(requested, locale, controller.signal)
      .then((members) => {
        const cleaned = getTeamSnapshot().flatMap((slug) => {
          const member = members.has(slug) ? members.get(slug) : undefined;
          if (member === null) return [];
          return [member?.slug ?? slug];
        });
        setTeam(cleaned);
        setVersion((v) => v + 1);
      })
      .catch(() => {
        // Abortada o sin PokéAPI: los huecos se quedan como fantasmas
      });
    return () => controller.abort();
  }, [key, locale]);

  if (slugs === null) return null;
  return slugs.map((slug) => getCachedMember(locale, slug));
}

// Mueve un elemento de una posición a otra, desplazando los de en medio
function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Equipo (DESIGN.md §4.9): el equipo vive en el navegador, así que el
// servidor pinta fantasmas y el equipo aparece tras la hidratación
export default function TeamBuilder({ locale }: { locale: Locale }) {
  const slugs = useSyncExternalStore(subscribeToTeam, getTeamSnapshot, getTeamServerSnapshot);
  const members = useTeamMembers(slugs, locale);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  // Dónde va el foco en cuanto esté pintado, en orden de preferencia: un
  // control desactivado (← en el primero) no puede recibirlo
  const pendingFocus = useRef<string[] | null>(null);

  let slots: TeamSlot[] | null = null;
  if (members) {
    slots = Array.from({ length: TEAM_SIZE }, (_, i): TeamSlot => {
      if (i >= members.length) return { kind: "empty" };
      const member = members[i];
      return member ? { kind: "member", member } : { kind: "loading" };
    });
  }

  // Tras cada cambio el foco va a su sitio. El diálogo, al cerrarse, devuelve
  // el foco al hueco que lo abrió; este efecto corre después y lo mueve
  useEffect(() => {
    const selectors = pendingFocus.current;
    const root = fieldsRef.current;
    if (!selectors || !root) return;
    for (const selector of selectors) {
      const el = root.querySelector<HTMLElement>(selector);
      if (el && !(el as HTMLButtonElement).disabled) {
        pendingFocus.current = null;
        el.focus();
        return;
      }
    }
  });

  const count = slugs?.length ?? 0;
  const slot = (i: number) => `[data-slot="${i}"]`;

  function add(slug: string) {
    const current = getTeamSnapshot();
    if (current.length >= TEAM_SIZE) return;
    pendingFocus.current = [slot(current.length)];
    setTeam([...current, slug]);
    setPickerOpen(false);
  }

  // El foco sigue al miembro en la misma flecha; en un extremo, la otra
  function move(index: number, step: -1 | 1) {
    const current = getTeamSnapshot();
    const to = index + step;
    if (to < 0 || to >= current.length) return;
    const arrow = step < 0 ? "left" : "right";
    const other = step < 0 ? "right" : "left";
    pendingFocus.current = [
      `${slot(to)} [data-control="${arrow}"]`,
      `${slot(to)} [data-control="${other}"]`,
    ];
    setTeam(moveItem(current, index, to));
  }

  // Arrastre: el miembro cae en el sitio del campo de destino
  function reorder(from: number, to: number) {
    pendingFocus.current = [slot(to)];
    setTeam(moveItem(getTeamSnapshot(), from, to));
  }

  // Sustituye al miembro en su sitio. La forma nueva se pide antes de
  // cambiarla, para que el campo no pase por fantasma
  function changeForm(index: number, slug: string) {
    pendingFocus.current = [`${slot(index)} [data-control="form"]`, slot(index)];
    const replace = () => {
      const current = getTeamSnapshot();
      if (index >= current.length) return;
      setTeam(current.map((s, i) => (i === index ? slug : s)));
    };
    loadTeamMembers([slug], locale).then(replace, replace);
  }

  // Los siguientes se desplazan a la izquierda: el foco va al campo que ocupa
  // ahora ese sitio, o al hueco vacío si era el último
  function remove(index: number) {
    const current = getTeamSnapshot();
    pendingFocus.current = [slot(index), slot(Math.max(0, index - 1))];
    setTeam(current.filter((_, i) => i !== index));
  }

  return (
    <div ref={fieldsRef}>
      <TeamFields
        locale={locale}
        slots={slots}
        count={count}
        onAdd={() => setPickerOpen(true)}
        onClear={() => setTeam([])}
        onMove={move}
        onReorder={reorder}
        onChangeForm={changeForm}
        onRemove={remove}
      />
      <TeamPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        locale={locale}
        full={count >= TEAM_SIZE}
        onAdd={add}
      />
      <TeamDefense locale={locale} slots={slots} />
    </div>
  );
}
