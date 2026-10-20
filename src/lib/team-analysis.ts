import { POKEMON_TYPES, TYPE_CHART, type PokemonType } from "@/constants/typeChart";
import { calculateTypeWeaknesses } from "@/lib/type-matrix";
import { STAT_KEYS, type StatKey, type TeamMember } from "@/lib/team";

// Análisis del equipo (DESIGN.md §4.9): defensa, mayor riesgo, cobertura
// ofensiva y estadísticas base. Funciones puras: reciben los miembros en el
// orden del equipo, sin huecos, y la interfaz rellena las columnas vacías.

export type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4;

type DefenseMember = Pick<TeamMember, "types">;
type StatsMember = Pick<TeamMember, "slug" | "name" | "stats">;

// --- Defensa ---

// Lo que recibe un Pokémon de cada tipo atacante, según sus dos tipos
export function defenseProfile(types: readonly string[]): Record<PokemonType, Multiplier> {
  const e = calculateTypeWeaknesses([...types]);
  const profile = {} as Record<PokemonType, Multiplier>;
  for (const type of POKEMON_TYPES) profile[type] = 1;
  const buckets: [string[], Multiplier][] = [
    [e.weaknesses4x, 4],
    [e.weaknesses2x, 2],
    [e.resistancesHalf, 0.5],
    [e.resistancesQuarter, 0.25],
    [e.immunities0x, 0],
  ];
  for (const [list, value] of buckets) {
    for (const type of list) profile[type as PokemonType] = value;
  }
  return profile;
}

export function memberMultiplier(attacker: PokemonType, member: DefenseMember): Multiplier {
  return defenseProfile(member.types)[attacker];
}

export interface DefenseRow {
  attacker: PokemonType;
  // Una celda por miembro, en el orden del equipo
  cells: Multiplier[];
  // Balance: débiles (×2 y ×4), resistentes (×½ y ×¼) e inmunes, por separado
  weak: number;
  quadruple: number;
  resist: number;
  immune: number;
}

// Las 18 filas de la matriz, en el orden de la tabla de tipos
export function defenseMatrix(members: readonly DefenseMember[]): DefenseRow[] {
  const profiles = members.map((m) => defenseProfile(m.types));
  return POKEMON_TYPES.map((attacker) => {
    const cells = profiles.map((p) => p[attacker]);
    return {
      attacker,
      cells,
      weak: cells.filter((v) => v >= 2).length,
      quadruple: cells.filter((v) => v === 4).length,
      resist: cells.filter((v) => v === 0.5 || v === 0.25).length,
      immune: cells.filter((v) => v === 0).length,
    };
  });
}

// El atacante con más débiles; a igualdad, más ×4; luego menos resistentes
// más inmunes; luego el primero en la tabla de tipos. null si ningún tipo pega
// súper eficaz (o el equipo está vacío).
export function biggestRisk(rows: readonly DefenseRow[]): DefenseRow | null {
  let risk: DefenseRow | null = null;
  for (const row of rows) {
    if (row.weak === 0) continue;
    if (
      risk === null ||
      row.weak > risk.weak ||
      (row.weak === risk.weak && row.quadruple > risk.quadruple) ||
      (row.weak === risk.weak &&
        row.quadruple === risk.quadruple &&
        row.resist + row.immune < risk.resist + risk.immune)
    ) {
      risk = row;
    }
  }
  return risk;
}

// --- Cobertura ofensiva ---

export interface CoveredType {
  rival: PokemonType;
  // Los tipos del equipo que lo golpean ×2, en el orden de la tabla de tipos
  hitBy: PokemonType[];
}

export interface Coverage {
  covered: CoveredType[];
  uncovered: PokemonType[];
}

// Según los tipos de los miembros, no sus movimientos
export function offensiveCoverage(members: readonly DefenseMember[]): Coverage {
  const teamTypes = new Set(members.flatMap((m) => m.types));
  const attackers = POKEMON_TYPES.filter((t) => teamTypes.has(t));
  const coverage: Coverage = { covered: [], uncovered: [] };
  for (const rival of POKEMON_TYPES) {
    const hitBy = attackers.filter((atk) => TYPE_CHART[atk][rival] === 2);
    if (hitBy.length > 0) coverage.covered.push({ rival, hitBy });
    else coverage.uncovered.push(rival);
  }
  return coverage;
}

// --- Estadísticas base ---

export interface StatSummary<M extends StatsMember = StatsMember> {
  stat: StatKey;
  // Media del equipo, redondeada
  average: number;
  // El miembro con el valor más alto; a igualdad, el primero del equipo
  best: { member: M; value: number } | null;
}

export interface TeamStats<M extends StatsMember = StatsMember> {
  // Total medio: la media de las sumas de cada miembro, redondeada
  averageTotal: number;
  stats: StatSummary<M>[];
}

const average = (values: number[]) =>
  values.length === 0 ? 0 : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

export function teamStats<M extends StatsMember>(members: readonly M[]): TeamStats<M> {
  const totals = members.map((m) => STAT_KEYS.reduce((sum, key) => sum + m.stats[key], 0));
  return {
    averageTotal: average(totals),
    stats: STAT_KEYS.map((stat) => {
      let best: StatSummary<M>["best"] = null;
      for (const member of members) {
        const value = member.stats[stat];
        if (best === null || value > best.value) best = { member, value };
      }
      return { stat, average: average(members.map((m) => m.stats[stat])), best };
    }),
  };
}
