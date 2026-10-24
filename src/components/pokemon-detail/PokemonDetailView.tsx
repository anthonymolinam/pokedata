/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PokemonDetail,
  PokemonVariety,
  EvolutionStage,
  AdjacentPokemon,
  getPokemonVariantSummary,
} from "@/lib/pokeapi";
import { calculateTypeWeaknesses } from "@/lib/type-matrix";
import { Locale } from "@/proxy";
import PokemonStage from "./PokemonStage";
import BaseStats from "./BaseStats";
import EvolutionTree from "./EvolutionTree";
import TypeWeaknesses from "./TypeWeaknesses";
import PokemonAbilities from "./PokemonAbilities";
import PokemonNavigation from "./PokemonNavigation";

interface PokemonDetailViewProps {
  pokemon: PokemonDetail;
  evolutionChain: EvolutionStage | null;
  initialVariantName?: string;
  prevPokemon: AdjacentPokemon | null;
  nextPokemon: AdjacentPokemon | null;
  locale?: string;
}

export default function PokemonDetailView({
  pokemon,
  evolutionChain,
  initialVariantName,
  prevPokemon,
  nextPokemon,
  locale: rawLocale = "es",
}: PokemonDetailViewProps) {
  const locale: Locale = rawLocale === "en" ? "en" : "es";
  // Initialize with the variant specified in initialVariantName if it exists
  const [selectedVariant, setSelectedVariant] = useState<PokemonVariety | null>(
    () => {
      if (pokemon.varieties && pokemon.varieties.length > 1) {
        if (initialVariantName) {
          const matched = pokemon.varieties.find(
            (v) => v.name.toLowerCase() === initialVariantName.toLowerCase(),
          );
          if (matched) return matched;
        }
        return (
          pokemon.varieties.find((v) => v.isDefault) || pokemon.varieties[0]
        );
      }
      return null;
    },
  );

  const [customChain, setCustomChain] = useState<EvolutionStage | null>(
    evolutionChain,
  );

  // Synchronize if initialVariantName changes due to external navigation
  useEffect(() => {
    if (!initialVariantName || !pokemon.varieties) return;
    const matched = pokemon.varieties.find(
      (v) => v.name.toLowerCase() === initialVariantName.toLowerCase(),
    );
    if (matched) {
      setSelectedVariant(matched);
    }
  }, [initialVariantName, pokemon.varieties]);

  const activeTypes = selectedVariant ? selectedVariant.types : pokemon.types;
  const activeStats = selectedVariant ? selectedVariant.stats : pokemon.stats;
  const activeAbilities = selectedVariant
    ? selectedVariant.abilities
    : pokemon.abilities;

  // 1. Weaknesses recalculated on the fly
  const activeWeaknesses = useMemo(() => {
    return calculateTypeWeaknesses(activeTypes);
  }, [activeTypes]);

  // Handle variant change by updating the URL query string
  const handleVariantChange = (variant: PokemonVariety) => {
    setSelectedVariant(variant);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (variant.isDefault) {
        url.searchParams.delete("variant");
      } else {
        url.searchParams.set("variant", variant.name);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  // 2. Synchronize evolution chain with the active region
  useEffect(() => {
    if (!evolutionChain) {
      setCustomChain(null);
      return;
    }

    const variantName = selectedVariant?.name.toLowerCase() || "";
    const regionMatch = variantName.match(/-(alola|galar|hisui|paldea)/);
    const regionTag = regionMatch ? regionMatch[1] : null;

    if (!regionTag) {
      setCustomChain(evolutionChain);
      return;
    }

    let isMounted = true;

    async function resolveRegionalChain(
      node: EvolutionStage,
    ): Promise<EvolutionStage> {
      const baseSpeciesName = node.name.split("-")[0];
      const regionalPokemonName = `${baseSpeciesName}-${regionTag}`;

      let updatedSummary = {
        name: node.name,
        image: node.image,
        types: node.types,
      };

      try {
        const regionalData =
          await getPokemonVariantSummary(regionalPokemonName);
        if (regionalData) {
          updatedSummary = {
            name: regionalData.name,
            image: regionalData.image,
            types: regionalData.types,
          };
        }
      } catch (err) {
        console.error("No regional form found for node:", node.name, err);
      }

      const evolvesTo = await Promise.all(
        node.evolvesTo.map(resolveRegionalChain),
      );

      return {
        ...node,
        ...updatedSummary,
        evolvesTo,
      };
    }

    resolveRegionalChain(evolutionChain).then((adapted) => {
      if (isMounted) setCustomChain(adapted);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedVariant, evolutionChain]);

  // Ficha (DESIGN.md §4.4): el escenario y, debajo, paneles blancos con una
  // composición distinta cada uno
  return (
    <div className="flex flex-col gap-5 md:gap-8">
      <PokemonStage
        pokemon={pokemon}
        selectedVariant={selectedVariant}
        onVariantChange={handleVariantChange}
        locale={locale}
      />

      <div className="grid gap-5 md:gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Al pasar a otro Pokémon (el buscador reutiliza la página) o a otra
            forma, el panel se vuelve a montar y las barras crecen de nuevo */}
        <BaseStats
          key={`${pokemon.name}:${selectedVariant?.name ?? ""}`}
          stats={activeStats}
          primaryType={activeTypes[0]?.toLowerCase() ?? "normal"}
          locale={locale}
        />
        {/* Habilidades bajo Debilidades: su aviso queda justo encima de la
            habilidad que lo explica */}
        <div className="flex flex-col gap-5 md:gap-8">
          <TypeWeaknesses
            effectiveness={activeWeaknesses}
            abilities={activeAbilities}
            locale={locale}
          />
          <PokemonAbilities abilities={activeAbilities} locale={locale} />
        </div>
      </div>

      {/* Cadena evolutiva, con las formas regionales de la forma activa */}
      <EvolutionTree
        currentPokemonName={
          selectedVariant ? selectedVariant.name : pokemon.name
        }
        chain={customChain}
        locale={locale}
      />

      <PokemonNavigation
        prev={prevPokemon}
        next={nextPokemon}
        locale={locale}
      />
    </div>
  );
}
