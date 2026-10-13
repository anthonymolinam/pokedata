"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Edit3 } from "lucide-react";
import { PokemonDetail, PokemonVariety } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/constants/typeColors";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getLocalizedPath } from "@/constants/routes";
import { getDictionary } from "@/constants/translations";
import PokemonSelectModal from "./PokemonSelectModal";

interface CompareHeaderProps {
  pokemon1: PokemonDetail | null;
  pokemon2: PokemonDetail | null;
  p1Slug: string;
  p2Slug: string;
  locale?: string;
}

const TYPE_TRANSLATIONS_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  steel: "Acero",
  dark: "Siniestro",
  fairy: "Hada",
};

function formatVariantLabel(label: string, isEs: boolean): string {
  if (!label || !isEs) return label || "";
  const lower = label.trim().toLowerCase();

  const exactMatches: Record<string, string> = {
    default: "Base",
    base: "Forma base",
    "base form": "Forma base",
    standard: "Estándar",
    normal: "Normal",
    "alolan form": "Alola",
    alola: "Alola",
    "galarian form": "Galar",
    galar: "Galar",
    "hisuian form": "Hisui",
    hisui: "Hisui",
    "paldean form": "Paldea",
    paldea: "Paldea",
    origin: "Origen",
    altered: "Modificada",
    therian: "Tótem",
    incarnate: "Avatar",
    gmax: "Gigamax",
    gigantamax: "Gigamax",
    mega: "Mega",
    "mega x": "Mega X",
    "mega y": "Mega Y",
    hero: "Guerrero avezado",
    crowned: "Forma Suprema",
    blade: "Forma Filo",
    shield: "Forma Escudo",
    attack: "Forma Ataque",
    defense: "Forma Defensa",
    speed: "Forma Velocidad",
  };

  return exactMatches[lower] || label;
}

export default function CompareHeader({
  pokemon1,
  pokemon2,
  p1Slug,
  p2Slug,
  locale = "es",
}: CompareHeaderProps) {
  const router = useRouter();
  const isEs = locale === "es";
  const dict = getDictionary(locale);
  const basePath = getLocalizedPath(locale, "compare");

  const [activeSlot, setActiveSlot] = useState<1 | 2 | null>(null);

  const handleSelectPokemon = (selectedSlug: string) => {
    const currentParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    const currentP1 = currentParams.get("p1") || p1Slug;
    const currentP2 = currentParams.get("p2") || p2Slug;

    if (activeSlot === 1) {
      currentParams.set("p1", selectedSlug);
      currentParams.set("p2", currentP2);
    } else if (activeSlot === 2) {
      currentParams.set("p1", currentP1);
      currentParams.set("p2", selectedSlug);
    }

    router.push(`${basePath}?${currentParams.toString()}`);
  };

  const handleVariantSelect = (slot: 1 | 2, variant: PokemonVariety) => {
    const currentParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    const currentP1 = currentParams.get("p1") || p1Slug;
    const currentP2 = currentParams.get("p2") || p2Slug;

    if (slot === 1) {
      currentParams.set("p1", variant.name);
      currentParams.set("p2", currentP2);
    } else {
      currentParams.set("p1", currentP1);
      currentParams.set("p2", variant.name);
    }

    router.replace(`${basePath}?${currentParams.toString()}`, {
      scroll: false,
    });
  };

  const formatName = (name: string) => {
    const lower = name.toLowerCase();
    if (isEs && CANONICAL_TO_SPANISH[lower]) {
      return CANONICAL_TO_SPANISH[lower].replace(/-/g, " ");
    }
    return name.replace(/-/g, " ");
  };

  const cleanP1Slug = p1Slug.toLowerCase();
  const cleanP2Slug = p2Slug.toLowerCase();

  return (
    <>
      <div className="space-y-4">
        {/* Fila superior: Tarjetas + Botón central */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          {/* Tarjeta Pokémon 1 */}
          <div
            onClick={() => setActiveSlot(1)}
            className="group relative flex flex-col items-center bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-4 sm:p-6 text-center cursor-pointer transition-all hover:bg-zinc-900/80 min-h-50 justify-center"
          >
            <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 group-hover:text-white transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </div>

            {pokemon1 ? (
              <>
                <span className="text-[11px] font-mono text-zinc-500">
                  #{String(pokemon1.id).padStart(4, "0")}
                </span>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 my-2">
                  <Image
                    src={pokemon1.image}
                    alt={pokemon1.name}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h2 className="font-bold text-sm sm:text-base text-white capitalize mb-2">
                  {formatName(pokemon1.name)}
                </h2>
                <div className="flex gap-1 flex-wrap justify-center">
                  {pokemon1.types.map((t) => (
                    <span
                      key={t}
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        TYPE_COLORS[t.toLowerCase()] || "bg-zinc-700 text-white"
                      }`}
                    >
                      {isEs && TYPE_TRANSLATIONS_ES[t.toLowerCase()]
                        ? TYPE_TRANSLATIONS_ES[t.toLowerCase()]
                        : t}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-xs text-zinc-500">
                {dict.compare.selectPrompt1}
              </div>
            )}
          </div>

          {/* Botón Central Swap */}
          <div className="flex items-center justify-center shrink-0">
            <Link
              href={`${basePath}?p1=${p2Slug}&p2=${p1Slug}`}
              title={dict.compare.swapTooltip}
              className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-full transition-all border border-zinc-700 shadow-xl active:scale-90"
            >
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>

          {/* Tarjeta Pokémon 2 */}
          <div
            onClick={() => setActiveSlot(2)}
            className="group relative flex flex-col items-center bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-4 sm:p-6 text-center cursor-pointer transition-all hover:bg-zinc-900/80 min-h-50 justify-center"
          >
            <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 group-hover:text-white transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </div>

            {pokemon2 ? (
              <>
                <span className="text-[11px] font-mono text-zinc-500">
                  #{String(pokemon2.id).padStart(4, "0")}
                </span>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 my-2">
                  <Image
                    src={pokemon2.image}
                    alt={pokemon2.name}
                    fill
                    sizes="(max-width: 640px) 96px, 112px"
                    className="object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h2 className="font-bold text-sm sm:text-base text-white capitalize mb-2">
                  {formatName(pokemon2.name)}
                </h2>
                <div className="flex gap-1 flex-wrap justify-center">
                  {pokemon2.types.map((t) => (
                    <span
                      key={t}
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        TYPE_COLORS[t.toLowerCase()] || "bg-zinc-700 text-white"
                      }`}
                    >
                      {isEs && TYPE_TRANSLATIONS_ES[t.toLowerCase()]
                        ? TYPE_TRANSLATIONS_ES[t.toLowerCase()]
                        : t}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-xs text-zinc-500">
                {dict.compare.selectPrompt2}
              </div>
            )}
          </div>
        </div>

        {/* Fila inferior: Variantes */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 sm:gap-6">
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
            {pokemon1?.varieties && pokemon1.varieties.length > 1 && (
              <>
                {pokemon1.varieties.map((v) => {
                  const isSelected = cleanP1Slug === v.name.toLowerCase();
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleVariantSelect(1, v)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-rose-500 border-transparent text-white shadow-xs shadow-rose-500/30"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {formatVariantLabel(v.label, isEs)}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          <div className="w-10 sm:w-11" aria-hidden="true" />

          <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
            {pokemon2?.varieties && pokemon2.varieties.length > 1 && (
              <>
                {pokemon2.varieties.map((v) => {
                  const isSelected = cleanP2Slug === v.name.toLowerCase();
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleVariantSelect(2, v)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-rose-500 border-transparent text-white shadow-xs shadow-rose-500/30"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {formatVariantLabel(v.label, isEs)}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      <PokemonSelectModal
        isOpen={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        onSelect={handleSelectPokemon}
        currentPokemonSlug={activeSlot === 1 ? p1Slug : p2Slug}
        locale={locale}
      />
    </>
  );
}
