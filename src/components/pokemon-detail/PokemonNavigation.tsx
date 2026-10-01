"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AdjacentPokemon, formatPokemonDisplayName } from "@/lib/pokeapi";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";

interface PokemonNavigationProps {
  prev: AdjacentPokemon | null;
  next: AdjacentPokemon | null;
  locale?: string;
}

export default function PokemonNavigation({
  prev,
  next,
  locale = "es",
}: PokemonNavigationProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const getPokemonUrl = (pokemonName: string) => {
    const cleanName = pokemonName.toLowerCase();
    const slug =
      locale === "es" && CANONICAL_TO_SPANISH[cleanName]
        ? CANONICAL_TO_SPANISH[cleanName]
        : cleanName;

    return `/${locale}/pokemon/${slug}`;
  };

  const prevUrl = prev ? getPokemonUrl(prev.name) : null;
  const nextUrl = next ? getPokemonUrl(next.name) : null;

  // Keyboard navigation shortcuts with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside form inputs
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "ArrowLeft" && prevUrl) {
        startTransition(() => {
          router.push(prevUrl);
        });
      } else if (e.key === "ArrowRight" && nextUrl) {
        startTransition(() => {
          router.push(nextUrl);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevUrl, nextUrl, router]);

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Previous Button */}
      {prev && prevUrl ? (
        <Link
          href={prevUrl}
          className="group flex items-center gap-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 px-3.5 py-2 rounded-2xl transition-all duration-200"
          title={`Go to ${formatPokemonDisplayName(prev.name)} (Left Arrow)`}
        >
          <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src={prev.image}
              alt={prev.name}
              fill
              sizes="36px"
              className="object-contain group-hover:scale-110 transition-transform duration-200"
            />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-[10px] font-mono text-zinc-500 block leading-none">
              #{String(prev.id).padStart(4, "0")}
            </span>
            <span className="font-bold text-xs text-zinc-300 group-hover:text-white transition-colors">
              {formatPokemonDisplayName(prev.name)}
            </span>
          </div>
        </Link>
      ) : (
        <div className="w-24" /> /* Spacer to keep center alignment */
      )}

      {/* Return to Pokédex list */}
      <Link
        href={`/${locale}`}
        className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800"
      >
        Pokédex
      </Link>

      {/* Next Button */}
      {next && nextUrl ? (
        <Link
          href={nextUrl}
          className="group flex items-center gap-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 px-3.5 py-2 rounded-2xl transition-all duration-200 text-right"
          title={`Go to ${formatPokemonDisplayName(next.name)} (Right Arrow)`}
        >
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-zinc-500 block leading-none">
              #{String(next.id).padStart(4, "0")}
            </span>
            <span className="font-bold text-xs text-zinc-300 group-hover:text-white transition-colors">
              {formatPokemonDisplayName(next.name)}
            </span>
          </div>
          <div className="relative w-9 h-9 shrink-0">
            <Image
              src={next.image}
              alt={next.name}
              fill
              sizes="36px"
              className="object-contain group-hover:scale-110 transition-transform duration-200"
            />
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors shrink-0" />
        </Link>
      ) : (
        <div className="w-24" /> /* Spacer to keep center alignment */
      )}
    </div>
  );
}
