import POKEMON_INDEX from "@/data/pokemon-index.json";
import { getDailyPokemonFor, type DailyPokemon } from "@/lib/daily";

// Los tres Pokémon de hoy, calculados en el servidor con la fecha UTC. Al
// cambiar el día a las 00:00 UTC cambian para todos a la vez.
export function getDailyPokemon(date = new Date()): DailyPokemon[] {
  return getDailyPokemonFor(POKEMON_INDEX, date);
}
