"use client";

import { useEffect, useRef } from "react";

// Muestra una vez, al entrar en pantalla, un bloque que se pinta con
// data-reveal="pending" (pasa a "shown"). El bloque lleva el atributo desde el
// servidor, para que el estado inicial esté ya en el primer pintado; el CSS
// decide qué significa: sin JavaScript o con movimiento reducido no oculta nada
// (globals.css). Para repetir la entrada con otros datos, el bloque se vuelve a
// montar con otra key.
export function useReveal<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        block.dataset.reveal = "shown";
        observer.disconnect();
      },
      { threshold },
    );
    observer.observe(block);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
