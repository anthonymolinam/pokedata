"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface PokemonArtworkViewerProps {
  name: string;
  defaultImage: string;
  shinyImage?: string | null;
}

export default function PokemonArtworkViewer({
  name,
  defaultImage,
  shinyImage,
}: PokemonArtworkViewerProps) {
  const [isShiny, setIsShiny] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      {/* Shiny toggle button */}
      {shinyImage && (
        <button
          type="button"
          onClick={() => setIsShiny(!isShiny)}
          className={`cursor-pointer absolute top-0 right-0 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-200 ${
            isShiny
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/20"
              : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          }`}
          title={
            isShiny ? "View regular version" : "View Shiny version"
          }
        >
          <Sparkles
            className={`w-3.5 h-3.5 ${isShiny ? "text-amber-400 fill-amber-400" : "text-zinc-500"}`}
          />
          <span>{isShiny ? "Shiny" : "Normal"}</span>
        </button>
      )}

      {/* Fixed Artwork container with both images preloaded */}
      <div className="relative w-60 h-60 my-4">
        {/* Imagen Normal */}
        <Image
          src={defaultImage}
          alt={`${name} regular`}
          fill
          priority
          sizes="240px"
          className={`object-contain drop-shadow-2xl transition-opacity duration-300 ${
            isShiny && shinyImage
              ? "opacity-0 pointer-events-none"
              : "opacity-100"
          }`}
        />

        {/* Imagen Shiny precargada */}
        {shinyImage && (
          <Image
            src={shinyImage}
            alt={`${name} shiny`}
            fill
            priority
            sizes="240px"
            className={`object-contain drop-shadow-2xl transition-opacity duration-300 ${
              isShiny ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        )}
      </div>
    </div>
  );
}
