"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale } from "@/proxy";
import { ROUTE_MAP, REVERSE_ROUTE_MAP } from "@/constants/routes";
import {
  MULTILINGUAL_ALIASES,
  CANONICAL_TO_SPANISH,
} from "@/constants/pokemonAliases";

export default function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // La misma página en el otro idioma, traduciendo el slug de la ruta y del Pokémon
  const getTargetPath = (targetLocale: Locale) => {
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

    const basePath = `/${segments.join("/")}`;
    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // Control segmentado (DESIGN.md §4.1): ES y EN a la vez sobre una pista
  // --step; el activo se rellena en blanco y el otro enlaza a la misma página
  const options: { locale: Locale; label: string; name: string }[] = [
    { locale: "es", label: "ES", name: "Español" },
    { locale: "en", label: "EN", name: "English" },
  ];

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-0.5 p-1 rounded-pill bg-step font-extrabold text-small"
    >
      {options.map((option) => {
        const segment =
          "relative grid place-items-center h-9 min-w-10 px-2.5 rounded-pill after:absolute after:-inset-x-0.5 after:-inset-y-1";
        return currentLocale === option.locale ? (
          <span
            key={option.locale}
            lang={option.locale}
            aria-current="true"
            className={`${segment} bg-surface text-ink`}
          >
            <span aria-hidden="true">{option.label}</span>
            <span className="sr-only">{option.name}</span>
          </span>
        ) : (
          <Link
            key={option.locale}
            href={getTargetPath(option.locale)}
            lang={option.locale}
            hrefLang={option.locale}
            className={`${segment} text-ink-soft hover:text-ink active:scale-[0.96] transition-transform duration-150`}
          >
            <span aria-hidden="true">{option.label}</span>
            <span className="sr-only">{option.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
