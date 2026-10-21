"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export interface ToastMessage {
  text: string;
  // Cambia con cada aviso, para repetir uno igual y que se vuelva a anunciar
  id: number;
  // Enlace o botón tras el texto: «Añadido a tu equipo · Ver equipo»,
  // «Equipo aleatorio · Deshacer»
  action?: { label: string } & ({ href: string } | { onClick: () => void });
}

interface ToastProps {
  message: ToastMessage | null;
  onDone: () => void;
  duration?: number;
}

// Aviso flotante (DESIGN.md §4.4 y §4.9): en tinta con texto hueso, abajo y
// centrado. La región role="status" existe siempre, para que el lector de
// pantalla anuncie el texto en cuanto aparece. Al irse se funde con el último
// texto, que solo se cambia con el siguiente aviso. Es una capa flotante, así
// que lleva sombra. Solo recibe el puntero si trae acción y está a la vista.
// Se pinta en <body>: dentro del escenario de la ficha (isolate) las tarjetas
// y el pie le pasaban por encima. z-55 lo deja sobre la página y la cabecera
// (z-50) y bajo el menú móvil y los filtros (z-60); los diálogos van en la
// capa superior del navegador.
export default function Toast({ message, onDone, duration = 1600 }: ToastProps) {
  const [last, setLast] = useState<ToastMessage | null>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (message && message !== last) setLast(message);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [message, onDone, duration]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="status"
      className={`fixed bottom-7 left-1/2 z-55 -translate-x-1/2 w-max max-w-[calc(100vw-2*var(--gutter))] rounded-pill bg-ink px-5 py-3 text-small font-extrabold text-bone shadow-(--shadow-overlay) motion-safe:transition-[opacity,translate] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] ${
        message ? "opacity-100" : "pointer-events-none opacity-0 motion-safe:translate-y-5"
      } ${last ? "" : "invisible"} ${message?.action ? "" : "pointer-events-none"}`}
    >
      {last && (
        <span key={last.id}>
          {last.text}
          {/* El separador va pegado a la acción: si no cabe, bajan juntos */}
          {last.action && (
            <span className="whitespace-nowrap">
              {" · "}
              {"href" in last.action ? (
                <Link href={last.action.href} tabIndex={message ? undefined : -1} className={actionClass}>
                  {last.action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={last.action.onClick}
                  tabIndex={message ? undefined : -1}
                  className={`cursor-pointer ${actionClass}`}
                >
                  {last.action.label}
                </button>
              )}
            </span>
          )}
        </span>
      )}
    </div>,
    document.body,
  );
}

const actionClass = "underline decoration-2 underline-offset-4 focus-visible:outline-bone";

function subscribeNoop() {
  return () => {};
}
