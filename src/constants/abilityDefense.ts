import type { PokemonType } from "@/constants/typeChart";

// Habilidades que cambian el daño que recibe un Pokémon según el tipo del
// ataque (DESIGN.md §4.4). La ficha las muestra como aviso en Debilidades y no
// toca los multiplicadores base, que son los del tipo.
export type AbilityDefenseEffect =
  | { kind: "immune" | "half" | "double" | "more"; types: PokemonType[] }
  | { kind: "filter" | "wonder-guard" };

export const ABILITY_DEFENSE: Record<string, AbilityDefenseEffect[]> = {
  levitate: [{ kind: "immune", types: ["ground"] }],
  "earth-eater": [{ kind: "immune", types: ["ground"] }],
  "flash-fire": [{ kind: "immune", types: ["fire"] }],
  "well-baked-body": [{ kind: "immune", types: ["fire"] }],
  "water-absorb": [{ kind: "immune", types: ["water"] }],
  "storm-drain": [{ kind: "immune", types: ["water"] }],
  "dry-skin": [
    { kind: "immune", types: ["water"] },
    { kind: "more", types: ["fire"] },
  ],
  "volt-absorb": [{ kind: "immune", types: ["electric"] }],
  "lightning-rod": [{ kind: "immune", types: ["electric"] }],
  "motor-drive": [{ kind: "immune", types: ["electric"] }],
  "sap-sipper": [{ kind: "immune", types: ["grass"] }],
  "thick-fat": [{ kind: "half", types: ["fire", "ice"] }],
  heatproof: [{ kind: "half", types: ["fire"] }],
  "water-bubble": [{ kind: "half", types: ["fire"] }],
  "purifying-salt": [{ kind: "half", types: ["ghost"] }],
  fluffy: [{ kind: "double", types: ["fire"] }],
  filter: [{ kind: "filter" }],
  "solid-rock": [{ kind: "filter" }],
  "prism-armor": [{ kind: "filter" }],
  "wonder-guard": [{ kind: "wonder-guard" }],
};
