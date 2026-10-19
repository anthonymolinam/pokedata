"use client";

import { useEffect, useRef } from "react";

// Muestra una vez, al entrar en pantalla, cada pieza de un bloque pintada con
// data-reveal="pending" (pasa a "shown"). Se observa cada pieza por separado,
// no el bloque entero: así la que está a la vista al cargar se muestra
// enseguida y la que está más abajo espera a que se baje hasta ella, en vez de
// terminar fuera de pantalla. Las que entran a la vez se escalonan en su orden
// (--reveal-order). El atributo viene ya del servidor, para que el estado
// inicial esté en el primer pintado; el CSS decide qué significa: sin
// JavaScript o con movimiento reducido no oculta nada (globals.css). Para
// repetir la entrada con otros datos, el bloque se vuelve a montar con otra key.
export function useReveal<T extends HTMLElement>(threshold = 0.6) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const piece = entry.target as HTMLElement;
          piece.style.setProperty("--reveal-order", String(order++));
          piece.dataset.reveal = "shown";
          observer.unobserve(piece);
        }
      },
      { threshold },
    );
    block
      .querySelectorAll<HTMLElement>('[data-reveal="pending"]')
      .forEach((piece) => observer.observe(piece));
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
