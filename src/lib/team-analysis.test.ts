import { test } from "node:test";
import assert from "node:assert/strict";
import type { StatKey, TeamMember } from "@/lib/team";
import {
  biggestRisk,
  defenseMatrix,
  memberMultiplier,
  offensiveCoverage,
  teamStats,
} from "@/lib/team-analysis";
import {
  parseStoredTeam,
  readTeamParam,
  sanitizeTeam,
  serializeTeam,
  teamParamUrl,
  withoutTeamParam,
} from "@/lib/team";

type Member = Pick<TeamMember, "slug" | "name" | "types" | "stats">;

const stats = (values: number[]): Record<StatKey, number> => {
  const [hp, attack, defense, spAtk, spDef, speed] = values;
  return {
    hp,
    attack,
    defense,
    "special-attack": spAtk,
    "special-defense": spDef,
    speed,
  };
};

// El equipo de la maqueta (mockups/team.html)
const MOCKUP_TEAM: Member[] = [
  { slug: "charizard", name: "Charizard", types: ["fire", "flying"], stats: stats([78, 84, 78, 109, 85, 100]) },
  { slug: "gyarados", name: "Gyarados", types: ["water", "flying"], stats: stats([95, 125, 79, 60, 100, 81]) },
  { slug: "scizor", name: "Scizor", types: ["bug", "steel"], stats: stats([70, 130, 100, 55, 80, 65]) },
  { slug: "ninetales-alola", name: "Ninetales", types: ["ice", "fairy"], stats: stats([73, 67, 75, 81, 100, 109]) },
];

test("multiplicador por atacante y miembro", () => {
  const [charizard, gyarados, scizor, ninetales] = MOCKUP_TEAM;
  assert.equal(memberMultiplier("rock", charizard), 4);
  assert.equal(memberMultiplier("electric", gyarados), 4);
  assert.equal(memberMultiplier("fire", scizor), 4);
  assert.equal(memberMultiplier("dragon", ninetales), 0);
  assert.equal(memberMultiplier("ground", charizard), 0);
  assert.equal(memberMultiplier("grass", charizard), 0.25);
  assert.equal(memberMultiplier("normal", scizor), 0.5);
  assert.equal(memberMultiplier("water", scizor), 1);
});

test("balance por fila", () => {
  const rows = defenseMatrix(MOCKUP_TEAM);
  assert.equal(rows.length, 18);
  assert.equal(rows[0].attacker, "normal");

  const rock = rows.find((r) => r.attacker === "rock")!;
  assert.deepEqual(rock.cells, [4, 2, 1, 2]);
  assert.deepEqual([rock.weak, rock.quadruple, rock.resist, rock.immune], [3, 1, 0, 0]);

  const ground = rows.find((r) => r.attacker === "ground")!;
  assert.deepEqual(ground.cells, [0, 0, 1, 1]);
  assert.deepEqual([ground.weak, ground.resist, ground.immune], [0, 0, 2]);
});

test("mayor riesgo del equipo de la maqueta: Roca", () => {
  const risk = biggestRisk(defenseMatrix(MOCKUP_TEAM));
  assert.ok(risk);
  assert.equal(risk.attacker, "rock");
  assert.equal(risk.weak, 3);
  assert.equal(risk.quadruple, 1);
  assert.equal(risk.resist + risk.immune, 0);
});

test("desempates del mayor riesgo", () => {
  // Un solo Charizard: Roca (×4) gana a Agua y Eléctrico (×2) con los mismos débiles
  const solo = biggestRisk(defenseMatrix([{ types: ["fire", "flying"] }]));
  assert.equal(solo?.attacker, "rock");

  // Pikachu + Pidgeot: Eléctrico, Hielo, Tierra y Roca hacen 1 débil y ningún
  // ×4. Eléctrico (1 resistente) y Tierra (1 inmune) pierden aunque Eléctrico
  // vaya antes en la tabla; Hielo y Roca empatan del todo y gana Hielo, que va
  // antes.
  const rows = defenseMatrix([{ types: ["electric"] }, { types: ["normal", "flying"] }]);
  const electric = rows.find((r) => r.attacker === "electric")!;
  assert.deepEqual([electric.weak, electric.resist], [1, 1]);
  assert.equal(biggestRisk(rows)?.attacker, "ice");
});

test("sin débiles o sin equipo no hay riesgo", () => {
  assert.equal(biggestRisk(defenseMatrix([])), null);
});

test("cobertura de la maqueta: 13 cubiertos y 5 sin cubrir", () => {
  const { covered, uncovered } = offensiveCoverage(MOCKUP_TEAM);
  assert.equal(covered.length, 13);
  assert.deepEqual(uncovered, ["normal", "water", "electric", "poison", "ghost"]);

  const fire = covered.find((c) => c.rival === "fire")!;
  assert.deepEqual(fire.hitBy, ["water"]);
  const grass = covered.find((c) => c.rival === "grass")!;
  assert.deepEqual(grass.hitBy, ["fire", "ice", "flying", "bug"]);
});

test("estadísticas: total medio 520 y el mejor de cada una", () => {
  const { averageTotal, stats: rows } = teamStats(MOCKUP_TEAM);
  assert.equal(averageTotal, 520);

  const attack = rows.find((r) => r.stat === "attack")!;
  assert.equal(attack.best?.member.name, "Scizor");
  assert.equal(attack.best?.value, 130);
  assert.equal(attack.average, 102);

  // Empate en Def. esp. (Gyarados y Ninetales, 100): gana el primero
  const spDef = rows.find((r) => r.stat === "special-defense")!;
  assert.equal(spDef.best?.member.slug, "gyarados");

  const empty = teamStats([]);
  assert.equal(empty.averageTotal, 0);
  assert.equal(empty.stats[0].best, null);
});

test("guardado: versión, slugs válidos y como mucho seis", () => {
  const team = ["charizard", "gyarados", "scizor", "ninetales-alola"];
  assert.deepEqual(parseStoredTeam(serializeTeam(team)), team);
  assert.deepEqual(parseStoredTeam(null), []);
  assert.deepEqual(parseStoredTeam("no es json"), []);
  assert.deepEqual(parseStoredTeam('{"v":2,"members":["pikachu"]}'), []);
  assert.deepEqual(parseStoredTeam('{"v":1,"members":["pikachu",3,"Mew"," eevee "]}'), ["pikachu", "mew", "eevee"]);
  assert.deepEqual(sanitizeTeam(["a", "b", "c", "d", "e", "f", "g"]).length, 6);
  assert.deepEqual(sanitizeTeam(["pikachu", "pikachu"]), ["pikachu", "pikachu"]);
});

test("enlace: lectura y escritura de ?t=", () => {
  assert.equal(readTeamParam(""), null);
  assert.deepEqual(readTeamParam("?t="), []);
  assert.deepEqual(
    readTeamParam("?t=charizard,../etc,ninetales-alola,,a b,1,2,3,4,5"),
    ["charizard", "ninetales-alola", "1", "2", "3", "4"],
  );

  const url = teamParamUrl("https://pokedata.app/es/equipo", ["charizard", "ninetales-alola"]);
  assert.equal(url, "https://pokedata.app/es/equipo?t=charizard,ninetales-alola");
  assert.equal(withoutTeamParam(url), "https://pokedata.app/es/equipo");
});
