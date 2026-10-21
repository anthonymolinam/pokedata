"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Plus } from "lucide-react";
import Toast, { type ToastMessage } from "@/components/common/Toast";
import { TEAM_SIZE, getTeamServerSnapshot, getTeamSnapshot, setTeam, subscribeToTeam } from "@/lib/team";
import { getLocalizedPath } from "@/constants/routes";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

type State = "add" | "in" | "full";

const STATE_CLASS: Record<State, string> = {
  add: "bg-surface text-ink",
  in: "bg-ink text-bone",
  full: "bg-step text-ink",
};

// «Añadir al equipo» de la ficha (DESIGN.md §4.4): añade la forma que se ve.
// Tres estados: añadir (botón), «En tu equipo» y «Equipo completo» (enlaces a
// la página del equipo). El estado sale del equipo guardado, que el servidor
// no conoce: el primer pintado es «añadir» y se corrige tras la hidratación
// sin cambiar de tamaño, porque las tres etiquetas ocupan la misma celda y
// manda la más ancha.
export default function AddToTeamButton({ slug, locale }: { slug: string; locale: Locale }) {
  const { team } = getDictionary(locale);
  const slugs = useSyncExternalStore(subscribeToTeam, getTeamSnapshot, getTeamServerSnapshot);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const hideToast = useCallback(() => setToast(null), []);
  const linkRef = useRef<HTMLAnchorElement>(null);
  // Tras añadir, el botón pasa a enlace: el foco sigue en él
  const focusLink = useRef(false);
  const teamHref = getLocalizedPath(locale, "team");

  let state: State = "add";
  if (slugs?.includes(slug)) state = "in";
  else if (slugs && slugs.length >= TEAM_SIZE) state = "full";

  useEffect(() => {
    if (focusLink.current && linkRef.current) {
      focusLink.current = false;
      linkRef.current.focus();
    }
  });

  function add() {
    const current = getTeamSnapshot();
    if (current.length >= TEAM_SIZE) return;
    focusLink.current = true;
    setTeam([...current, slug]);
    setToast((prev) => ({
      text: team.added,
      id: (prev?.id ?? 0) + 1,
      action: { href: teamHref, label: team.viewTeam },
    }));
  }

  const labels: Record<State, string> = { add: team.addToTeam, in: team.inTeam, full: team.full };
  const content = (
    <span className="inline-grid">
      {(Object.keys(labels) as State[]).map((key) => (
        <span
          key={key}
          aria-hidden={key !== state || undefined}
          className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 ${
            key === state ? "" : "invisible"
          }`}
        >
          {key === "add" && <Plus aria-hidden="true" strokeWidth={2.75} className="size-4" />}
          {key === "in" && <Check aria-hidden="true" strokeWidth={3} className="size-4" />}
          {labels[key]}
        </span>
      ))}
    </span>
  );
  const className = `inline-flex min-h-11 items-center rounded-pill px-4 text-small font-extrabold cursor-pointer motion-safe:transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:-translate-y-0.5 active:scale-[0.96] ${STATE_CLASS[state]}`;

  return (
    <>
      {state === "add" ? (
        <button type="button" onClick={add} className={className}>
          {content}
        </button>
      ) : (
        <Link ref={linkRef} href={teamHref} className={className}>
          {content}
        </Link>
      )}
      <Toast message={toast} onDone={hideToast} duration={2500} />
    </>
  );
}
