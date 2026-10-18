"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Locale } from "@/proxy";
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
  const searchParams = useSearchParams();

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

    const basePath = `/${segments.join("/")}`;
    const queryString = searchParams.toString();
    const newPath = queryString ? `${basePath}?${queryString}` : basePath;

    router.push(newPath);
  };

  // Botones rectos en el campo de la barra: el idioma activo se rellena en tinta
  const options: { locale: Locale; label: string; name: string }[] = [
    { locale: "es", label: "ES", name: "Español" },
    { locale: "en", label: "EN", name: "English" },
  ];

  return (
    <div className="flex items-center gap-1 font-bold text-small">
      {options.map((option) => {
        const isActive = currentLocale === option.locale;
        return (
          <button
            key={option.locale}
            type="button"
            lang={option.locale}
            aria-label={option.name}
            aria-pressed={isActive}
            onClick={() => handleToggle(option.locale)}
            className={`h-11 min-w-11 px-3 cursor-pointer active:scale-[0.97] transition-transform duration-150 ${
              isActive
                ? "bg-field-ink text-field"
                : "bg-field-step text-field-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
