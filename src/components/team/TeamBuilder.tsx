"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import TeamCoverage from "@/components/team/TeamCoverage";
import TeamDefense from "@/components/team/TeamDefense";
import TeamFields, { type TeamSlot } from "@/components/team/TeamFields";
import TeamPicker from "@/components/team/TeamPicker";
import TeamStats from "@/components/team/TeamStats";
import Toast, { type ToastMessage } from "@/components/common/Toast";
import {
  TEAM_SIZE,
  getSharedServerSnapshot,
  getTeamServerSnapshot,
  getTeamSnapshot,
  isViewingSharedTeam,
  leaveSharedTeam,
  replaceShownTeam,
  setTeam,
  shareTeamUrl,
  subscribeToTeam,
} from "@/lib/team";
import { getDictionary } from "@/constants/translations";
import { getCachedMember, loadTeamMembers } from "@/lib/team-members";
import { Locale } from "@/proxy";

// Pide los miembros que faltan y, cuando llegan, limpia el equipo que se ve:
// descarta los slugs desconocidos y cambia cada slug por el que devuelve la
// API (la forma por defecto vuelve como la especie). Si la API falla, esos
// huecos se quedan como fantasmas hasta la próxima visita. Un equipo
// compartido se limpia en su enlace, sin convertirse en el propio.
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
        replaceShownTeam(cleaned);
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
  const { team } = getDictionary(locale);
  const slugs = useSyncExternalStore(subscribeToTeam, getTeamSnapshot, getTeamServerSnapshot);
  const shared = useSyncExternalStore(subscribeToTeam, isViewingSharedTeam, getSharedServerSnapshot);
  const members = useTeamMembers(slugs, locale);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  // Estable: el aviso reinicia su temporizador si cambia
  const hideToast = useCallback(() => setToast(null), []);
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

  // Los miembros ya cargados, en orden: los paneles de cobertura y
  // estadísticas los analizan sin huecos. null hasta la hidratación
  const loaded = slots?.flatMap((s) => (s.kind === "member" ? [s.member] : [])) ?? null;

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

  function notify(text: string) {
    setToast((prev) => ({ text, id: (prev?.id ?? 0) + 1 }));
  }

  // Escribe ?t= en la URL y la comparte: en táctil con la hoja nativa; si
  // no, al portapapeles. Si nada funciona, el aviso manda a la barra, que ya
  // tiene el enlace.
  async function share() {
    const url = shareTeamUrl();
    if (window.matchMedia("(hover: none)").matches && typeof navigator.share === "function") {
      try {
        await navigator.share({ url, title: document.title });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      notify(team.linkCopied);
    } catch {
      notify(team.copyFallback);
    }
  }

  // La banda desaparece: el foco va al primer campo del equipo que queda
  function saveShared() {
    pendingFocus.current = [slot(0)];
    setTeam(getTeamSnapshot());
  }

  function backToMine() {
    pendingFocus.current = [slot(0)];
    leaveSharedTeam();
  }

  return (
    <div ref={fieldsRef}>
      {shared && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-[18px] py-3.5 rounded-[20px] bg-step">
          <p className="font-extrabold">{team.sharedNotice}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ml-auto">
            <button
              type="button"
              onClick={saveShared}
              className="h-11 cursor-pointer px-4.5 rounded-pill bg-ink text-small font-extrabold text-bone motion-safe:transition-transform duration-150 motion-safe:hover:-translate-y-0.5 active:scale-[0.96]"
            >
              {team.saveShared}
            </button>
            <button
              type="button"
              onClick={backToMine}
              className="cursor-pointer text-small font-extrabold underline decoration-2 underline-offset-4 hover:decoration-ink-soft"
            >
              {team.backToMine}
            </button>
          </div>
        </div>
      )}
      <TeamFields
        locale={locale}
        slots={slots}
        count={count}
        onAdd={() => setPickerOpen(true)}
        onShare={share}
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
      <TeamCoverage locale={locale} members={loaded} />
      <TeamStats locale={locale} members={loaded} />
      <Toast message={toast} onDone={hideToast} />
    </div>
  );
}
