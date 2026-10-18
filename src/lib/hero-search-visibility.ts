import { useSyncExternalStore } from "react";

// Si el buscador grande del hero está en pantalla (DESIGN.md §4.1). Lo publica
// HeroSearch y lo leen la cabecera, para ocultar el compacto, y el atajo Ctrl K,
// para enfocar el que se ve. Fuera de la portada siempre es false.
let visible = false;
const listeners = new Set<() => void>();

export function setHeroSearchVisible(next: boolean) {
  if (next === visible) return;
  visible = next;
  listeners.forEach((listener) => listener());
}

export function isHeroSearchVisible() {
  return visible;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// En el servidor se supone a la vista: la portada se pinta con el compacto
// oculto y no parpadea al hidratar. Quien lo lea lo combina con estar en ella.
export function useHeroSearchVisible() {
  return useSyncExternalStore(subscribe, isHeroSearchVisible, () => true);
}
