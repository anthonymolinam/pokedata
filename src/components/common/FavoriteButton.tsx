"use client";

import { useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import {
  getFavoritesServerSnapshot,
  getFavoritesSnapshot,
  subscribeToFavorites,
  toggleFavorite,
} from "@/lib/favorites";

// Corazón de favorito (DESIGN.md §4.10): el mismo control redondo que
// Variocolor. Sin marcar, en --surface con el corazón vacío en tinta; marcado,
// en --ink con el corazón relleno en hueso. Se guarda por especie, así que
// todas las formas de una especie comparten corazón.
//
// El servidor no conoce los favoritos: antes de hidratar no se pinta nada (su
// sitio ya está reservado, o va posicionado encima, así que nada se mueve).
export default function FavoriteButton({
  speciesId,
  label,
  title,
  className = "",
}: {
  speciesId: number;
  // Nombre fijo: «Favorito» en la ficha, «Favorito: Charizard» en la tarjeta
  label: string;
  title?: string;
  className?: string;
}) {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot,
  );
  // Cada vez que se marca, el corazón se vuelve a montar con la clase del
  // rebote; al desmarcar solo pierde el relleno
  const [pops, setPops] = useState(0);

  if (favorites === null) return null;
  const on = favorites.includes(speciesId);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={title}
      onClick={() => {
        if (toggleFavorite(speciesId)) setPops((n) => n + 1);
      }}
      className={`grid place-items-center rounded-pill cursor-pointer bg-surface text-ink aria-pressed:bg-ink aria-pressed:text-bone motion-safe:transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:-translate-y-0.5 active:scale-[0.96] ${className}`}
    >
      <Heart
        key={pops}
        aria-hidden="true"
        strokeWidth={2.5}
        fill={on ? "currentColor" : "none"}
        className={`size-5 ${on && pops > 0 ? "heart-pop" : ""}`}
      />
    </button>
  );
}
