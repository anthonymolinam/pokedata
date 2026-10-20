"use client";

import type { CSSProperties } from "react";
import Artwork from "@/components/common/Artwork";
import { artworkUrl } from "@/lib/artwork";
import { TEAM_SIZE, type TeamMember } from "@/lib/team";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Hueco de la fila: un miembro, un miembro que aún se está cargando o vacío
export type TeamSlot =
  | { kind: "member"; member: TeamMember }
  | { kind: "loading" }
  | { kind: "empty" };

interface TeamFieldsProps {
  locale: Locale;
  // null en el primer pintado: el servidor no conoce el equipo guardado
  slots: TeamSlot[] | null;
  count: number;
  onAdd?: () => void;
  onShare?: () => void;
  onClear: () => void;
}

// Curva de rebote de la dirección Pop (§6)
const spring = "ease-[cubic-bezier(.34,1.56,.64,1)] duration-[350ms]";

// Altura del campo (§4.9): 290px desde 1024px y 300px por debajo
const SLOT_HEIGHT = "h-[300px] lg:h-[290px]";

// Botones de la columna de balance: secundario en tinta y terciario en superficie
const sideButton = `h-11 w-full px-4.5 rounded-pill font-extrabold text-small motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-0.5 active:scale-[0.96]`;

// Fila de los seis campos (DESIGN.md §4.9). Desde 1024px comparte columnas con
// la matriz de Defensa: el recuento a la izquierda, los seis campos y los
// botones a la derecha. Por debajo, los campos van en su propia rejilla de 3 o
// 2 columnas, sin recuento ni botones laterales.
export default function TeamFields({
  locale,
  slots,
  count,
  onAdd,
  onShare,
  onClear,
}: TeamFieldsProps) {
  const { team } = getDictionary(locale);
  const shown = slots ?? Array.from({ length: TEAM_SIZE }, () => ({ kind: "loading" }) as const);

  // Un único tamaño de nombre para todo el equipo: el que permite el nombre
  // más largo, con un mínimo de 7 letras
  const chars = Math.max(
    7,
    ...shown.map((s) => (s.kind === "member" ? s.member.name.length : 0)),
  );

  return (
    <div
      className="pt-14 lg:pt-16 lg:team-grid"
      style={{ "--chars": chars } as CSSProperties}
    >
      <p
        aria-hidden="true"
        className="hidden lg:block self-end pb-1.5"
      >
        <span className="block text-head font-black num leading-none">
          {slots ? `${count}/${TEAM_SIZE}` : " "}
        </span>
        <span className="text-small font-extrabold text-ink-soft">{team.members}</span>
      </p>

      <ol
        aria-label={team.listLabel.replace("{n}", String(count))}
        className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-16 lg:col-[2/8] lg:grid-cols-subgrid lg:gap-y-0"
      >
        {shown.map((slot, i) => {
          if (slot.kind === "member") {
            return <MemberField key={`${slot.member.slug}-${i}`} member={slot.member} index={i} locale={locale} />;
          }
          if (slot.kind === "empty") {
            return (
              <li key={`empty-${i}`} className={SLOT_HEIGHT}>
                <EmptySlot label={team.add} shortLabel={team.addShort} onAdd={onAdd} />
              </li>
            );
          }
          return <GhostField key={`ghost-${i}`} />;
        })}
      </ol>

      <div className="hidden lg:flex flex-col gap-2.5 self-end">
        <button type="button" onClick={onShare} className={`${sideButton} bg-ink text-bone`}>
          {team.share}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={count === 0}
          className={`${sideButton} bg-surface text-ink disabled:bg-step disabled:text-ink-soft disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed`}
        >
          {team.clear}
        </button>
      </div>
    </div>
  );
}

// Campo de un miembro: el campo de su tipo principal, el artwork que se sale
// 64px por arriba (48px en móvil) y la ficha de alto fijo abajo
function MemberField({ member, index, locale }: { member: TeamMember; index: number; locale: Locale }) {
  const { common, typeNames } = getDictionary(locale);
  const label = member.form ? `${member.name}, ${member.form.full}` : member.name;

  return (
    <li
      tabIndex={-1}
      data-slot={index}
      aria-label={label}
      data-type={member.types[0] ?? "normal"}
      className={`group relative ${SLOT_HEIGHT} flex flex-col p-1.5 rounded-surface bg-field text-field-ink overflow-x-clip focus-visible:outline-ink motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-1.5`}
    >
      {/* Su alto manda; el ancho puede llegar al 140 % de la columna porque el
          lienzo tiene márgenes transparentes. Los lados se recortan con clip */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-1 flex flex-1 min-h-0 items-end justify-center -mt-12 lg:-mt-16 mb-1.5"
      >
        <Artwork
          src={artworkUrl(member.artworkId)}
          alt=""
          width={475}
          height={475}
          sizes="200px"
          loading="eager"
          className={`h-full w-auto max-w-[140%] max-h-[475px] aspect-square flex-none object-contain motion-safe:transition-transform ${spring} motion-safe:group-hover:scale-[1.06]`}
        />
      </div>

      {/* Ficha: cuatro filas siempre en la misma posición. La de la forma
          existe aunque no haya forma, y los tipos se apoyan abajo */}
      <div className="relative z-2 @container flex-none h-[140px] grid grid-rows-[auto_auto_auto_1fr] p-2.5 rounded-[16px] lg:rounded-[20px] type-tag text-ink">
        <p className="text-small font-extrabold text-ink-soft num leading-[18px]">
          {String(member.id).padStart(4, "0")}
        </p>
        <p className="text-[clamp(14px,calc(100cqi/(var(--chars)*0.6+0.4)),20px)] font-black tracking-[-0.03em] leading-6 whitespace-nowrap">
          {member.name}
        </p>
        <p
          title={member.form?.full}
          className="text-small font-extrabold text-ink-soft leading-[18px] truncate"
        >
          {member.form?.short ?? " "}
        </p>
        <ul aria-label={common.types} className="flex flex-wrap content-end gap-1">
          {member.types.map((type) => (
            <li
              key={type}
              data-type={type}
              className="inline-flex items-center h-6 px-[9px] rounded-pill bg-field text-field-ink text-[12px] font-extrabold"
            >
              {typeNames[type]}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

// Hueco vacío: todo el campo es un único botón que abre el selector
function EmptySlot({
  label,
  shortLabel,
  onAdd,
}: {
  label: string;
  shortLabel: string;
  onAdd?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onAdd}
      className={`group flex h-full w-full flex-col items-center justify-center gap-4 rounded-surface bg-step text-ink cursor-pointer focus-visible:outline-ink hover:bg-[color-mix(in_srgb,var(--ink)_9%,var(--step))] focus-visible:bg-[color-mix(in_srgb,var(--ink)_9%,var(--step))] motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5 motion-safe:active:-translate-y-1.5 motion-safe:active:scale-[0.98]`}
    >
      <svg
        aria-hidden="true"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        className={`text-ink-soft group-hover:text-ink group-focus-visible:text-ink motion-safe:transition-transform ${spring} motion-safe:group-hover:rotate-25 motion-safe:group-hover:scale-[1.08] motion-safe:group-focus-visible:rotate-25 motion-safe:group-focus-visible:scale-[1.08]`}
      >
        <circle cx="32" cy="32" r="28" />
        <path d="M4 32h18M42 32h18" />
        <circle cx="32" cy="32" r="9" />
      </svg>
      <span
        className={`inline-flex items-center h-10 px-4 rounded-pill bg-ink text-bone text-small font-extrabold motion-safe:transition-transform ${spring} motion-safe:group-hover:scale-[1.06]`}
      >
        {shortLabel}
      </span>
    </button>
  );
}

// Campo fantasma (§4.8): la forma del real en --step, con la ficha reservada,
// sin parpadeo; entra con opacidad a los 300ms
function GhostField() {
  return (
    <li aria-hidden="true" className={`${SLOT_HEIGHT} flex flex-col justify-end p-1.5 rounded-surface bg-step skeleton-in`}>
      <div className="h-[140px] grid content-start gap-2 p-2.5 rounded-[16px] lg:rounded-[20px] bg-ground">
        <div className="h-3.5 w-10 rounded-pill bg-step" />
        <div className="h-5 w-3/4 rounded-pill bg-step" />
      </div>
    </li>
  );
}
