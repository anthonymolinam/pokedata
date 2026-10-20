"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface ToastMessage {
  text: string;
  // Cambia con cada aviso, para repetir uno igual y que se vuelva a anunciar
  id: number;
  // Enlace tras el texto: «Añadido a tu equipo · Ver equipo»
  action?: { href: string; label: string };
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
// que lleva sombra. Solo recibe el puntero si trae enlace y está a la vista.
export default function Toast({ message, onDone, duration = 1600 }: ToastProps) {
  const [last, setLast] = useState<ToastMessage | null>(null);
  if (message && message !== last) setLast(message);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, duration);
    return () => clearTimeout(timer);
  }, [message, onDone, duration]);

  return (
    <div
      role="status"
      className={`fixed bottom-7 left-1/2 z-50 -translate-x-1/2 max-w-[calc(100vw-2*var(--gutter))] rounded-pill bg-ink px-5 py-3 text-small font-extrabold text-bone shadow-(--shadow-overlay) motion-safe:transition-[opacity,translate] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] ${
        message ? "opacity-100" : "pointer-events-none opacity-0 motion-safe:translate-y-5"
      } ${last ? "" : "invisible"} ${message?.action ? "" : "pointer-events-none"}`}
    >
      {last && (
        <span key={last.id}>
          {last.text}
          {last.action && (
            <>
              {" · "}
              <Link
                href={last.action.href}
                tabIndex={message ? undefined : -1}
                className="underline decoration-2 underline-offset-4 focus-visible:outline-bone"
              >
                {last.action.label}
              </Link>
            </>
          )}
        </span>
      )}
    </div>
  );
}
