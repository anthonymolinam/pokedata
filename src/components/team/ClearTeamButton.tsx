"use client";

import { Trash2 } from "lucide-react";

// «Vaciar equipo» (§4.9): papelera en un botón redondo de 44px en --surface,
// junto al dado y con el mismo globo. Se puede deshacer, así que va a la vista
// con los otros botones del equipo. Con el equipo vacío, desactivado al 35 %
export default function ClearTeamButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-tip={label}
      disabled={disabled}
      onClick={onClick}
      className="icon-tip relative grid place-items-center size-11 shrink-0 rounded-pill bg-surface text-ink cursor-pointer motion-safe:transition-transform duration-150 motion-safe:hover:-translate-y-0.5 active:scale-[0.92] disabled:opacity-35 disabled:cursor-default disabled:translate-y-0 disabled:scale-100"
    >
      <Trash2 aria-hidden="true" strokeWidth={2.5} className="size-5" />
    </button>
  );
}
