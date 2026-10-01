"use client";

import { usePathname, useRouter } from "next/navigation";
import { Locale } from "@/middleware";
import { ROUTE_MAP, REVERSE_ROUTE_MAP } from "@/constants/routes";
import {
  MULTILINGUAL_ALIASES,
  CANONICAL_TO_SPANISH,
} from "@/constants/pokemonAliases";

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;

    const segments = pathname.split("/").filter(Boolean);
    // segments[0] es el locale actual ('es' o 'en')
    segments[0] = targetLocale;

    // Caso 1: Rutas de segundo nivel como /es/tabla-de-tipos <-> /en/type-chart
    const currentSlug = segments[1];
    if (currentSlug && segments.length === 2) {
      // 1. Encontrar la carpeta interna canónica ('types')
      const internalKey =
        ROUTE_MAP[currentLocale]?.[currentSlug] || currentSlug;
      // 2. Obtener el slug en el idioma destino ('type-chart' o 'tabla-de-tipos')
      const targetSlug =
        REVERSE_ROUTE_MAP[targetLocale]?.[internalKey] || internalKey;

      segments[1] = targetSlug;
    }

    // Caso 2: Ficha de Pokémon /es/pokemon/[slug] <-> /en/pokemon/[slug]
    if (segments[1] === "pokemon" && segments[2]) {
      const pokeSlug = segments[2].toLowerCase();

      if (targetLocale === "en") {
        // Si vamos a inglés, convertimos alias en español al canónico oficial (ej: colmilargo -> great-tusk)
        segments[2] = MULTILINGUAL_ALIASES[pokeSlug] || pokeSlug;
      } else {
        // Si vamos a español, convertimos canónico a alias en español si existe (ej: great-tusk -> colmilargo)
        segments[2] = CANONICAL_TO_SPANISH[pokeSlug] || pokeSlug;
      }
    }

    const newPath = `/${segments.join("/")}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs font-mono">
      <button
        type="button"
        onClick={() => handleToggle("es")}
        className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
          currentLocale === "es"
            ? "bg-rose-500 text-white font-bold"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        ES
      </button>
      <span className="text-zinc-700">|</span>
      <button
        type="button"
        onClick={() => handleToggle("en")}
        className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
          currentLocale === "en"
            ? "bg-rose-500 text-white font-bold"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}
