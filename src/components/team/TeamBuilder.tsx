"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

// Equipo (DESIGN.md §4.9): el equipo vive en el navegador, así que el
// servidor pinta fantasmas y el equipo aparece tras la hidratación
export default function TeamBuilder({ locale }: { locale: Locale }) {
  const slugs = useSyncExternalStore(subscribeToTeam, getTeamSnapshot, getTeamServerSnapshot);
  const members = useTeamMembers(slugs, locale);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);
  // Hueco que recibe el foco en cuanto su miembro esté pintado
  const pendingFocus = useRef<number | null>(null);

  let slots: TeamSlot[] | null = null;
  if (members) {
    slots = Array.from({ length: TEAM_SIZE }, (_, i): TeamSlot => {
      if (i >= members.length) return { kind: "empty" };
      const member = members[i];
      return member ? { kind: "member", member } : { kind: "loading" };
    });
  }

  // Al añadir, el foco va al campo nuevo. El diálogo, al cerrarse, devuelve
  // el foco al hueco que lo abrió; este efecto corre después y lo mueve
  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null || slots?.[index]?.kind !== "member") return;
    pendingFocus.current = null;
    fieldsRef.current?.querySelector<HTMLElement>(`[data-slot="${index}"]`)?.focus();
  });

  const count = slugs?.length ?? 0;

  function add(slug: string) {
    const current = getTeamSnapshot();
    if (current.length >= TEAM_SIZE) return;
    pendingFocus.current = current.length;
    setTeam([...current, slug]);
    setPickerOpen(false);
  }

  return (
    <div ref={fieldsRef}>
      <TeamFields
        locale={locale}
        slots={slots}
        count={count}
        onAdd={() => setPickerOpen(true)}
        onClear={() => setTeam([])}
      />
      <TeamPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        locale={locale}
        full={count >= TEAM_SIZE}
        onAdd={add}
      />
    </div>
  );
}
