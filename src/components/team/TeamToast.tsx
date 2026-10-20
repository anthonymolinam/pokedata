"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  text: string;
  // Cambia con cada aviso, para repetir uno igual y que se vuelva a anunciar
  id: number;
}

// Aviso flotante (DESIGN.md §4.9): «Enlace copiado» en tinta con texto hueso,
// abajo y centrado, durante 1,6s. La región role="status" existe siempre, para
// que el lector de pantalla anuncie el texto en cuanto aparece. Al irse se
// funde con el último texto, que solo se cambia con el siguiente aviso.
export default function TeamToast({ message, onDone }: { message: ToastMessage | null; onDone: () => void }) {
  const [last, setLast] = useState<ToastMessage | null>(null);
  if (message && message !== last) setLast(message);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, 1600);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  return (
    <div
      role="status"
      className={`pointer-events-none fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-ink px-5 py-3 text-small font-extrabold text-bone shadow-(--shadow-overlay) motion-safe:transition-[opacity,translate] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] ${
        message ? "opacity-100" : "opacity-0 motion-safe:translate-y-5"
      } ${last ? "" : "invisible"}`}
    >
      {last && <span key={last.id}>{last.text}</span>}
    </div>
  );
}
