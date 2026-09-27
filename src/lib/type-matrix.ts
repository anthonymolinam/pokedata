import { TYPE_CHART, POKEMON_TYPES, PokemonType } from "@/constants/typeChart";

export interface TypeEffectiveness {
  weaknesses4x: string[];
  weaknesses2x: string[];
  resistancesHalf: string[];
  resistancesQuarter: string[];
  immunities0x: string[];
  neutral1x: string[];
}

export function calculateTypeWeaknesses(types: string[]): TypeEffectiveness {
  const multipliers: Record<string, number> = {};

  POKEMON_TYPES.forEach((t) => {
    multipliers[t] = 1;
  });

  const validDefendingTypes = types
    .map((t) => t.toLowerCase())
    .filter((t): t is PokemonType => POKEMON_TYPES.includes(t as PokemonType));

  // Multiply the damage received from each attacker by each defending type
  POKEMON_TYPES.forEach((attackingType) => {
    validDefendingTypes.forEach((defendingType) => {
      const effect = TYPE_CHART[attackingType]?.[defendingType] ?? 1;
      multipliers[attackingType] *= effect;
    });
  });

  const effectiveness: TypeEffectiveness = {
    weaknesses4x: [],
    weaknesses2x: [],
    resistancesHalf: [],
    resistancesQuarter: [],
    immunities0x: [],
    neutral1x: [],
  };

  for (const [t, mult] of Object.entries(multipliers)) {
    if (mult === 4) effectiveness.weaknesses4x.push(t);
    else if (mult === 2) effectiveness.weaknesses2x.push(t);
    else if (mult === 0.5) effectiveness.resistancesHalf.push(t);
    else if (mult === 0.25) effectiveness.resistancesQuarter.push(t);
    else if (mult === 0) effectiveness.immunities0x.push(t);
    else if (mult === 1) effectiveness.neutral1x.push(t);
  }

  return effectiveness;
}

// Async alias to maintain compatibility with existing calls
export async function getTypeWeaknesses(
  types: string[],
): Promise<TypeEffectiveness> {
  return calculateTypeWeaknesses(types);
}
