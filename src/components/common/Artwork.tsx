"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { spriteUrl } from "@/lib/artwork";

type ArtworkProps = Omit<ImageProps, "src" | "unoptimized" | "quality"> & {
  src: string;
};

// Artwork de PokéAPI servido desde jsDelivr tal cual, sin pasar por el
// optimizador de Next (su cuota se agota en el plan gratuito de Vercel). Si
// la imagen no carga se queda una Poké Ball tenue en lugar del icono roto.
export default function Artwork({ src, alt, onError, ...props }: ArtworkProps) {
  const url = spriteUrl(src);
  // Se guarda la URL que falló para que un cambio de Pokémon o de forma
  // vuelva a intentarlo
  const [failed, setFailed] = useState<string | null>(null);

  if (failed === url) {
    return (
      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg viewBox="0 0 100 100" className="w-2/5 h-2/5" fill="none" stroke="currentColor" strokeWidth="6">
          <circle cx="50" cy="50" r="44" />
          <path d="M6 50h30M64 50h30" />
          <circle cx="50" cy="50" r="13" />
        </svg>
      </span>
    );
  }

  return (
    <Image
      {...props}
      src={url}
      alt={alt}
      unoptimized
      onError={(e) => {
        setFailed(url);
        onError?.(e);
      }}
    />
  );
}
