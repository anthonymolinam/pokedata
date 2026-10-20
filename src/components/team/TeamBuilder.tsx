"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import TeamFields, { type TeamSlot } from "@/components/team/TeamFields";
import {
  TEAM_SIZE,
  getTeamServerSnapshot,
  getTeamSnapshot,
  setTeam,
  subscribeToTeam,
  type TeamMember,
} from "@/lib/team";
import { Locale } from "@/proxy";

// Datos de los miembros ya pedidos a /api/team, por idioma y slug: reordenar
// o quitar no vuelve a pedir nada. null es un slug que PokéAPI no conoce.
const memberCache = new Map<string, TeamMember | null>();
const cacheKey = (locale: Locale, slug: string) => `${locale}:${slug}`;

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
    const missing = [...new Set(requested)].filter((s) => !memberCache.has(cacheKey(locale, s)));
    if (missing.length === 0) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ slugs: missing.join(","), locale });
    fetch(`/api/team?${params}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(({ members }: { members: (TeamMember | null)[] }) => {
        const canonical = new Map<string, string | null>();
        missing.forEach((slug, i) => {
          const member = members[i] ?? null;
          memberCache.set(cacheKey(locale, slug), member);
          if (member) memberCache.set(cacheKey(locale, member.slug), member);
          canonical.set(slug, member?.slug ?? null);
        });
        const current = getTeamSnapshot();
        const cleaned = current.flatMap((slug) => {
          const next = canonical.has(slug) ? canonical.get(slug) : slug;
          return next ? [next] : [];
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
  return slugs.map((slug) => memberCache.get(cacheKey(locale, slug)));
}

// Equipo (DESIGN.md §4.9): el equipo vive en el navegador, así que el
// servidor pinta fantasmas y el equipo aparece tras la hidratación
export default function TeamBuilder({ locale }: { locale: Locale }) {
  const slugs = useSyncExternalStore(subscribeToTeam, getTeamSnapshot, getTeamServerSnapshot);
  const members = useTeamMembers(slugs, locale);

  let slots: TeamSlot[] | null = null;
  if (members) {
    slots = Array.from({ length: TEAM_SIZE }, (_, i): TeamSlot => {
      if (i >= members.length) return { kind: "empty" };
      const member = members[i];
      return member ? { kind: "member", member } : { kind: "loading" };
    });
  }

  return (
    <TeamFields
      locale={locale}
      slots={slots}
      count={slugs?.length ?? 0}
      onClear={() => setTeam([])}
    />
  );
}
