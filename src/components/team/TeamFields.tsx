"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type Ref } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, X, type LucideIcon } from "lucide-react";
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

// Lo que se puede hacer con un miembro; quien usa la fila guarda el cambio y
// lleva el foco a su sitio
export interface MemberActions {
  onMove: (index: number, step: -1 | 1) => void;
  onReorder: (from: number, to: number) => void;
  onChangeForm: (index: number, slug: string) => void;
  onRemove: (index: number) => void;
}

interface TeamFieldsProps extends MemberActions {
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

// Altura del campo (§4.9): 290px desde 1024px y 300px por debajo. En táctil
// crece a 330px para la fila de controles, así la ficha no se mueve
const SLOT_HEIGHT = "h-[300px] lg:h-[290px] no-hover:h-[330px] lg:no-hover:h-[330px]";

// Botones de la columna de balance: secundario en tinta y terciario en superficie
const sideButton = `h-11 w-full px-4.5 rounded-pill font-extrabold text-small motion-safe:transition-transform ${spring} motion-safe:hover:-translate-y-0.5 active:scale-[0.96]`;

// Movimiento de los campos (§6): entrada «pop» como las tarjetas (600ms con
// rebote y 45ms de escalonado la primera vez); al añadir, el nuevo entra con
// «pop»; al quitar, sale con escala a 0.94 y fundido mientras los siguientes
// se deslizan; al reordenar, los campos se cruzan. Huecos y fantasmas no
// tienen salida: el campo que ocupa su sitio entra encima. Con movimiento
// reducido solo queda el fundido: sin subida, sin escala y sin deslizamiento.
const BOUNCE = [0.34, 1.56, 0.64, 1] as const;
const POP = { opacity: 0, y: 30, scale: 0.94 };
const SHOWN = { opacity: 1, y: 0, scale: 1 };

function slotMotion(
  kind: TeamSlot["kind"],
  index: number,
  firstReveal: boolean,
  layoutKey: string,
  reduced: boolean,
): HTMLMotionProps<"li"> {
  if (kind === "loading") {
    return { exit: { opacity: 0, transition: { duration: 0 } } };
  }
  const layout = { duration: 0.35, ease: BOUNCE };
  const pop = firstReveal || kind === "member";
  return {
    layout: !reduced,
    layoutDependency: layoutKey,
    initial: pop && !reduced ? POP : { opacity: 0 },
    animate: SHOWN,
    transition: pop
      ? { duration: 0.6, ease: BOUNCE, delay: firstReveal ? index * 0.045 : 0, layout }
      : { duration: 0.2, ease: "easeOut", layout },
    exit:
      kind === "member"
        ? { opacity: 0, scale: reduced ? 1 : 0.94, transition: { duration: 0.2, ease: "easeOut" } }
        : { opacity: 0, transition: { duration: 0 } },
  };
}

// Clave estable de cada miembro: su slug y cuántas veces ha salido antes (se
// permiten repetidos). Al reordenar, cada campo conserva su clave
function memberKeys(slots: TeamSlot[]): string[] {
  const seen = new Map<string, number>();
  return slots.map((slot, i) => {
    if (slot.kind !== "member") return `${slot.kind}-${i}`;
    const n = seen.get(slot.member.slug) ?? 0;
    seen.set(slot.member.slug, n + 1);
    return `${slot.member.slug}#${n}`;
  });
}

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
  ...actions
}: TeamFieldsProps) {
  const { team } = getDictionary(locale);
  const shown: TeamSlot[] = slots ?? Array.from({ length: TEAM_SIZE }, () => ({ kind: "loading" }));
  const keys = memberKeys(shown);
  // Arrastre con puntero: el campo arrastrado y el campo de destino
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  // La primera vez que llega el equipo, los seis campos entran escalonados
  // por su sitio, también los miembros que llegan después que los huecos;
  // en cuanto no queda ninguno cargando, solo entra el que cambia
  const [revealed, setRevealed] = useState(false);
  const firstReveal = slots !== null && !revealed;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (slots?.every((s) => s.kind !== "loading")) setRevealed(true);
  }, [slots]);
  const layoutKey = keys.join(",");
  const reduced = useReducedMotion() ?? false;

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
        className="relative grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-16 lg:col-[2/8] lg:grid-cols-subgrid lg:gap-y-0"
      >
        {/* popLayout: el campo que sale deja su sitio enseguida, así la
            rejilla nunca tiene siete elementos */}
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((slot, i) => {
            const motionProps = slotMotion(slot.kind, i, firstReveal, layoutKey, reduced);
            if (slot.kind === "member") {
              return (
                <MemberField
                  key={keys[i]}
                  motionProps={motionProps}
                  member={slot.member}
                  index={i}
                  last={i === count - 1}
                  locale={locale}
                  actions={actions}
                  dragging={dragFrom === i}
                  dropTarget={dragOver === i && dragFrom !== null && dragFrom !== i}
                  onDragStart={() => setDragFrom(i)}
                  onDragEnter={() => setDragOver(i)}
                  onDragEnd={() => {
                    setDragFrom(null);
                    setDragOver(null);
                  }}
                  onDrop={(from) => {
                    if (from !== i) actions.onReorder(from, i);
                    setDragFrom(null);
                    setDragOver(null);
                  }}
                />
              );
            }
            if (slot.kind === "empty") {
              return (
                <motion.li key={keys[i]} {...motionProps} className={SLOT_HEIGHT}>
                  <EmptySlot index={i} label={team.add} shortLabel={team.addShort} onAdd={onAdd} />
                </motion.li>
              );
            }
            return <GhostField key={keys[i]} motionProps={motionProps} />;
          })}
        </AnimatePresence>
      </ol>

      <div className="hidden lg:flex flex-col gap-2.5 self-end">
        <button
          type="button"
          onClick={onShare}
          disabled={count === 0}
          className={`${sideButton} bg-ink text-bone disabled:bg-step disabled:text-ink-soft disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed`}
        >
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

interface MemberFieldProps {
  // AnimatePresence le pasa una ref para sacarlo del flujo al quitarlo
  ref?: Ref<HTMLLIElement>;
  motionProps: HTMLMotionProps<"li">;
  member: TeamMember;
  index: number;
  last: boolean;
  locale: Locale;
  actions: MemberActions;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  // Recibe el sitio del campo arrastrado, que viaja con el propio arrastre
  onDrop: (from: number) => void;
}

// Campo de un miembro: el campo de su tipo principal, el artwork que se sale
// 64px por arriba (48px en móvil), la ficha de alto fijo abajo y los controles
function MemberField({
  ref,
  motionProps,
  member,
  index,
  last,
  locale,
  actions,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: MemberFieldProps) {
  const { team, common, typeNames } = getDictionary(locale);
  const label = member.form ? `${member.name}, ${member.form.full}` : member.name;
  const [menuOpen, setMenuOpen] = useState(false);
  const formButtonRef = useRef<HTMLButtonElement>(null);
  const hasForms = member.forms.length > 1;
  const withName = (text: string) => text.replace("{name}", member.name);
  // Mientras sale, el campo deja de ser su hueco: el foco va al que lo ocupa
  const present = useIsPresent();

  // El inicio y el final del arrastre nativo van por el DOM: en un elemento
  // de Framer Motion, onDragStart y onDragEnd son los de su propio arrastre
  const liRef = useRef<HTMLLIElement | null>(null);
  const drag = useRef({ index, onDragStart, onDragEnd });
  useEffect(() => {
    drag.current = { index, onDragStart, onDragEnd };
  });
  useEffect(() => {
    const li = liRef.current;
    if (!li) return;
    const start = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(drag.current.index));
      drag.current.onDragStart();
    };
    const end = () => drag.current.onDragEnd();
    li.addEventListener("dragstart", start);
    li.addEventListener("dragend", end);
    return () => {
      li.removeEventListener("dragstart", start);
      li.removeEventListener("dragend", end);
    };
  }, []);
  const setRefs = (node: HTMLLIElement | null) => {
    liRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // El li lleva el movimiento de Framer Motion (transform) y el campo de
  // dentro, el hover con su transición: así no se pisan
  return (
    <motion.li
      ref={setRefs}
      {...motionProps}
      tabIndex={-1}
      data-slot={present ? index : undefined}
      aria-label={label}
      data-type={member.types[0] ?? "normal"}
      draggable
      onDragEnter={onDragEnter}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        // Solo un sitio del equipo: un texto arrastrado desde fuera no cuenta
        const from = e.dataTransfer.getData("text/plain");
        if (/^[0-5]$/.test(from)) onDrop(Number(from));
      }}
      className={`group relative ${SLOT_HEIGHT} rounded-surface focus-visible:outline-ink ${
        dropTarget ? "outline-3 outline-offset-4 outline-ink" : ""
      }`}
    >
      <div
        className={`relative h-full flex flex-col p-1.5 rounded-surface bg-field text-field-ink overflow-x-clip motion-safe:transition-transform ${spring} motion-safe:group-hover:-translate-y-1.5 ${
          dragging ? "opacity-50" : ""
        }`}
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
            draggable={false}
            className={`h-full w-auto max-w-[140%] max-h-[475px] aspect-square flex-none object-contain motion-safe:transition-transform ${spring} motion-safe:group-hover:scale-[1.06]`}
          />
        </div>

        {/* Ficha: cuatro filas siempre en la misma posición. La de la forma
            existe aunque no haya forma, y los tipos se apoyan abajo. Con
            puntero, la fila de la forma cede su sitio a los controles al pasar
            el ratón (por eso mide 24px). En táctil, el margen de abajo es la
            fila de controles. Entre
            1024 y 1279px la ficha mide menos de 80px: menos relleno lateral y,
            bajo 72px de contenido, etiquetas de 11px («Fantasma» cabe) */}
        <div className="relative z-2 @container flex-none h-[140px] grid grid-rows-[18px_24px_auto_1fr] can-hover:grid-rows-[18px_24px_24px_1fr] no-hover:mb-[42px] p-2.5 lg:max-xl:px-1.5 rounded-[16px] lg:rounded-[20px] type-tag text-ink">
          <p className="text-small lg:max-xl:text-[12px] font-extrabold text-ink-soft num leading-[18px]">
            {String(member.id).padStart(4, "0")}
          </p>
          <p className="text-[clamp(14px,calc(100cqi/(var(--chars)*0.5+1)),20px)] lg:max-xl:text-[clamp(10px,calc(100cqi/(var(--chars)*0.5+1)),20px)] font-black tracking-[-0.03em] leading-6 whitespace-nowrap">
            {member.name}
          </p>
          <p
            title={member.form?.full}
            className={`row-start-3 col-start-1 text-small lg:max-xl:text-[12px] font-extrabold text-ink-soft leading-[18px] truncate can-hover:transition-opacity can-hover:duration-150 can-hover:group-hover:opacity-0 can-hover:group-focus-within:opacity-0 ${
              menuOpen ? "can-hover:opacity-0" : ""
            }`}
          >
            {member.form?.short ?? " "}
          </p>
          <ul aria-label={common.types} className="row-start-4 flex flex-wrap content-end gap-1">
            {member.types.map((type) => (
              <li
                key={type}
                data-type={type}
                className="inline-flex items-center h-6 px-[9px] @max-[72px]:px-1.5 rounded-pill bg-field text-field-ink text-[12px] @max-[72px]:text-[11px] font-extrabold"
              >
                {typeNames[type]}
              </li>
            ))}
          </ul>
          {/* Controles: con puntero van dentro de la ficha, bajo el nombre, en
              el sitio de la forma (que se aparta), y aparecen al pasar el ratón
              o con el foco dentro, sin tapar el artwork; en táctil, fila propia
              bajo la ficha, siempre visible */}
          <div
            className={`z-3 flex justify-between gap-0.5 can-hover:col-start-1 can-hover:row-start-3 can-hover:self-start can-hover:transition-opacity can-hover:duration-150 can-hover:group-hover:opacity-100 can-hover:group-focus-within:opacity-100 no-hover:absolute no-hover:inset-x-0 no-hover:top-full no-hover:mt-1.5 ${
              menuOpen ? "" : "can-hover:opacity-0"
            }`}
          >
            <div className="flex gap-1 can-hover:gap-0.5">
              <ControlButton
                icon={ArrowLeft}
                control="left"
                label={withName(team.moveLeft)}
                disabled={index === 0}
                onClick={() => actions.onMove(index, -1)}
              />
              <ControlButton
                icon={ArrowRight}
                control="right"
                label={withName(team.moveRight)}
                disabled={last}
                onClick={() => actions.onMove(index, 1)}
              />
            </div>
            <div className="flex gap-1 can-hover:gap-0.5">
              <ControlButton
                ref={formButtonRef}
                icon={RefreshCw}
                control="form"
                label={hasForms ? team.changeForm : team.noOtherForms}
                disabled={!hasForms}
                expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              />
              <ControlButton
                icon={X}
                control="remove"
                label={withName(team.remove)}
                onClick={() => actions.onRemove(index)}
              />
            </div>
          </div>
        </div>

        {menuOpen && (
          <FormMenu
            member={member}
            label={team.changeForm}
            baseLabel={team.baseForm}
            trigger={formButtonRef}
            onClose={(returnFocus) => {
              setMenuOpen(false);
              if (returnFocus) formButtonRef.current?.focus();
            }}
            onChoose={(slug) => {
              setMenuOpen(false);
              if (slug === member.slug) formButtonRef.current?.focus();
              else actions.onChangeForm(index, slug);
            }}
          />
        )}
      </div>
    </motion.li>
  );
}

interface ControlButtonProps {
  icon: LucideIcon;
  control: string;
  label: string;
  disabled?: boolean;
  expanded?: boolean;
  onClick: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}

// Botón redondo: con puntero, dentro de la ficha, de 24px (menos si los cuatro
// no caben a lo ancho, con el área ampliada por un pseudoelemento); en
// táctil, sobre el campo, de 36px (44px de área). Desactivado, al 35 %
function ControlButton({ icon: Icon, control, label, disabled, expanded, onClick, ref }: ControlButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      data-control={control}
      aria-label={label}
      title={label}
      aria-haspopup={expanded !== undefined ? "true" : undefined}
      aria-expanded={expanded}
      disabled={disabled}
      onClick={onClick}
      className={`member-control relative grid place-items-center rounded-pill text-ink cursor-pointer after:absolute after:content-[''] size-9 after:-inset-1 can-hover:size-[min(24px,calc((100cqi-4px)/4))] can-hover:after:-inset-1 motion-safe:transition-transform ${spring} motion-safe:hover:scale-[1.08] active:scale-[0.96] disabled:opacity-35 disabled:cursor-default disabled:scale-100`}
    >
      <Icon aria-hidden="true" strokeWidth={2.5} className="size-4 can-hover:size-[min(14px,calc((100cqi-4px)/7))]" />
    </button>
  );
}

interface FormMenuProps {
  member: TeamMember;
  label: string;
  baseLabel: string;
  trigger: React.RefObject<HTMLButtonElement | null>;
  // returnFocus: con Esc el foco vuelve al botón; al tocar fuera, se queda
  // donde se tocó
  onClose: (returnFocus: boolean) => void;
  onChoose: (slug: string) => void;
}

// Menú «Cambiar forma»: capa flotante dentro del campo, encima de los
// controles (sobre la ficha con puntero, sobre la fila táctil en móvil), con una opción por forma. La actual va
// rellena en tinta. Las flechas recorren las opciones
function FormMenu({ member, label, baseLabel, trigger, onClose, onChoose }: FormMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  // El último onClose, sin volver a montar los escuchadores en cada render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const menu = menuRef.current;
    menu?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menu?.contains(target) || trigger.current?.contains(target)) return;
      onCloseRef.current(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current(true);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [trigger]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const options = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])];
    const current = options.indexOf(document.activeElement as HTMLElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = options.length - 1;
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (current + 1) % options.length;
    else next = (current - 1 + options.length) % options.length;
    options[next]?.focus();
  }

  return (
    <div
      ref={menuRef}
      role="radiogroup"
      aria-label={label}
      data-field="raised"
      onKeyDown={onKeyDown}
      className="menu-in absolute inset-x-1.5 z-10 grid gap-0.5 rounded-[18px] bg-raised p-1.5 text-ink shadow-(--shadow-overlay) can-hover:bottom-[98px] no-hover:bottom-[52px]"
    >
      {member.forms.map((form) => {
        const checked = form.slug === member.slug;
        return (
          <button
            key={form.slug}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            title={form.name?.full}
            onClick={() => onChoose(form.slug)}
            className="flex min-h-10 cursor-pointer items-center rounded-[12px] px-2.5 text-left text-small font-extrabold hover:bg-step aria-checked:ring-selected"
          >
            {form.name?.short ?? baseLabel}
          </button>
        );
      })}
    </div>
  );
}

// Hueco vacío: todo el campo es un único botón que abre el selector. Como el
// campo, deja de marcar su hueco mientras sale
function EmptySlot({
  index,
  label,
  shortLabel,
  onAdd,
}: {
  index: number;
  label: string;
  shortLabel: string;
  onAdd?: () => void;
}) {
  const present = useIsPresent();
  return (
    <button
      type="button"
      data-slot={present ? index : undefined}
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
function GhostField({ ref, motionProps }: { ref?: Ref<HTMLLIElement>; motionProps: HTMLMotionProps<"li"> }) {
  return (
    <motion.li
      ref={ref}
      {...motionProps}
      aria-hidden="true"
      className={`${SLOT_HEIGHT} flex flex-col justify-end p-1.5 rounded-surface bg-step skeleton-in`}
    >
      <div className="h-[140px] grid content-start gap-2 p-2.5 rounded-[16px] lg:rounded-[20px] bg-ground">
        <div className="h-3.5 w-10 rounded-pill bg-step" />
        <div className="h-5 w-3/4 rounded-pill bg-step" />
      </div>
    </motion.li>
  );
}
