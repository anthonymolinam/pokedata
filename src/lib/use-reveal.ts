"use client";

import { useEffect, useRef } from "react";

// Marca un bloque como pendiente y lo muestra una vez al entrar en pantalla
// (data-reveal="pending" → "shown"). Sin JavaScript o con movimiento reducido
// el bloque nunca se marca, así que se ve ya terminado.
export function useReveal<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    block.dataset.reveal = "pending";
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
