"use client";

import type { CSSProperties, ReactNode } from "react";
import Artwork from "@/components/common/Artwork";
import type { TeamSlot } from "@/components/team/TeamFields";
import { artworkUrl } from "@/lib/artwork";
import { TEAM_SIZE, type TeamMember } from "@/lib/team";
import { biggestRisk, defenseMatrix, type DefenseRow, type Multiplier } from "@/lib/team-analysis";
import { POKEMON_TYPES } from "@/constants/typeChart";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

type Dictionary = ReturnType<typeof getDictionary>;

const fill = (text: string, n: number) => text.replace("{n}", String(n));

// Cómo se escribe cada multiplicador en el tooltip y para lectores de pantalla
const MULTIPLIER_TEXT: Record<Multiplier, string> = {
  4: "4",
  2: "2",
  1: "1",
  0.5: "½",
  0.25: "¼",
  0: "0",
};

// Las columnas de la matriz siguen a los huecos de la fila de campos: un
// miembro que aún se está cargando deja su columna vacía como un hueco
function columnsOf(slots: TeamSlot[] | null): (TeamMember | null)[] {
  return Array.from({ length: TEAM_SIZE }, (_, i) => {
    const slot = slots?.[i];
    return slot?.kind === "member" ? slot.member : null;
  });
}

// «3 débiles (1 a ×4), 0 resistentes (1 inmune)»: resistentes cuenta las
// resistencias y las inmunidades juntas
function riskSummary(row: DefenseRow, team: Dictionary["team"]): string {
  const sturdy = row.resist + row.immune;
  let text = fill(row.weak === 1 ? team.weakOne : team.weakMany, row.weak);
  if (row.quadruple) text += ` ${fill(team.quadruple, row.quadruple)}`;
  text += `, ${fill(sturdy === 1 ? team.resistOne : team.resistMany, sturdy)}`;
  if (row.immune) text += ` ${fill(row.immune === 1 ? team.immuneOne : team.immuneMany, row.immune)}`;
  return text;
}

// Panel «Defensa» (DESIGN.md §4.9): el aviso de mayor riesgo y la matriz de
// lo que recibe cada miembro de cada tipo atacante. Comparte la plantilla de
// columnas con la fila de campos, así que cada columna cae bajo su miembro.
export default function TeamDefense({ locale, slots }: { locale: Locale; slots: TeamSlot[] | null }) {
  const { team, typeNames } = getDictionary(locale);
  const columns = columnsOf(slots);
  const members = columns.filter((m): m is TeamMember => m !== null);
  // Cada columna apunta a su posición entre los miembros cargados
  const memberIndex = columns.map((m) => (m ? members.indexOf(m) : -1));
  const rows = defenseMatrix(members);
  const risk = biggestRisk(rows);

  // La clave cambia con el texto: el aviso nuevo entra con fundido (§6)
  let notice: ReactNode = " ";
  let noticeKey = "none";
  if (slots !== null && members.length === 0) {
    notice = team.empty;
    noticeKey = "empty";
  } else if (slots !== null && !risk) {
    notice = team.noRisk;
    noticeKey = "no-risk";
  } else if (risk) {
    noticeKey = `${risk.attacker}|${riskSummary(risk, team)}`;
    notice = (
      <>
        <b className="font-black">{team.riskLabel}</b>
        <span
          data-type={risk.attacker}
          className="inline-flex items-center h-7 px-3 rounded-pill bg-field text-field-ink text-small font-extrabold"
        >
          {typeNames[risk.attacker]}
        </span>
        <span>— {riskSummary(risk, team)}</span>
      </>
    );
  }

  return (
    <section aria-labelledby="team-defense-title" data-field="surface" className="mt-7 pb-6 rounded-surface bg-surface">
      <div className="px-6 pt-7">
        <h2 id="team-defense-title" className="text-head font-black tracking-[-0.03em] leading-[1.05]">
          {team.defense}
        </h2>
        <p className="mt-1.5 max-w-[60ch] text-body text-ink-soft">{team.defenseNote}</p>
      </div>

      <p
        aria-live="polite"
        className="mx-6 mt-5 flex items-center min-h-14 px-[18px] py-3.5 rounded-[20px] bg-step font-extrabold"
      >
        <span key={noticeKey} className="notice-in flex flex-wrap items-center gap-2">
          {notice}
        </span>
      </p>

      {/* Por debajo de 1024px la matriz tiene su propio scroll (§4.9 «Móvil») */}
      <div className="relative mt-[18px] max-lg:overflow-x-auto">
        <div
          role="table"
          aria-label={team.matrixLabel}
          className="grid gap-y-1 max-lg:w-max max-lg:min-w-full max-lg:px-6 max-lg:gap-x-2 max-lg:grid-cols-[96px_repeat(6,56px)_186px] lg:team-grid"
        >
          <div
            role="row"
            className="col-span-full grid grid-cols-subgrid items-center px-1 py-2 mb-1 bg-surface text-small font-extrabold text-ink-soft lg:sticky lg:top-18 lg:z-5"
          >
            {/* En el scroll de móvil, «Ataca» y las etiquetas se quedan fijas a la izquierda */}
            <span
              role="columnheader"
              className="self-stretch flex items-center bg-surface max-lg:sticky max-lg:left-0 max-lg:z-2 max-lg:-mr-2 max-lg:pr-2"
            >
              {team.attacks}
            </span>
            {columns.map((member, i) =>
              member ? (
                <span
                  key={`${member.slug}-${i}`}
                  role="columnheader"
                  data-type={member.types[0]}
                  title={member.name}
                  className="cell-in relative justify-self-center grid place-items-center size-10 rounded-pill bg-field overflow-hidden"
                >
                  <Artwork
                    src={artworkUrl(member.artworkId)}
                    alt={member.name}
                    width={475}
                    height={475}
                    sizes="46px"
                    className="size-[46px] max-w-none object-contain translate-y-[3px]"
                  />
                </span>
              ) : (
                <span key={`empty-${i}`} role="columnheader" className="justify-self-center size-10 rounded-pill bg-step">
                  <span className="sr-only">{team.emptySlot}</span>
                </span>
              ),
            )}
            <span role="columnheader" className="grid grid-cols-3 gap-1 text-center">
              <span>{team.weak}</span>
              <span>{team.resist}</span>
              <span>{team.immune}</span>
            </span>
          </div>

          {POKEMON_TYPES.map((attacker, r) => {
            const row = rows[r];
            const isRisk = risk?.attacker === attacker;
            return (
              <div
                key={attacker}
                role="row"
                data-type={attacker}
                data-risk={isRisk || undefined}
                className="defense-row col-span-full grid grid-cols-subgrid items-center"
              >
                {/* El fondo de la fila tapa las celdas que pasan por debajo de la
                    etiqueta fija y por el hueco hasta la primera columna */}
                <span role="rowheader" className="defense-label max-lg:sticky max-lg:left-0 max-lg:z-2 max-lg:-mr-2 max-lg:pr-2">
                  <span
                    className={`flex items-center h-8 px-3 rounded-pill bg-field text-field-ink text-small font-extrabold whitespace-nowrap ${
                      isRisk ? "ring-selected" : ""
                    }`}
                  >
                    {typeNames[attacker]}
                  </span>
                </span>
                {columns.map((member, i) =>
                  member ? (
                    <Cell
                      key={`${member.slug}-${i}`}
                      row={r}
                      value={row.cells[memberIndex[i]]}
                      tip={`${typeNames[attacker]} → ${member.name}: ×${MULTIPLIER_TEXT[row.cells[memberIndex[i]]]}`}
                      risk={isRisk}
                    />
                  ) : (
                    <span key={`empty-${i}`} role="cell" className="h-8" />
                  ),
                )}
                <span role="cell" className="grid grid-cols-3 gap-1 text-center">
                  <Count value={row.weak} label={team.weak} risk={isRisk} alarm />
                  <Count value={row.resist} label={team.resist} risk={isRisk} />
                  <Count value={row.immune} label={team.immune} risk={isRisk} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Celda de un miembro, con la jerarquía ×4 > ×2 > ×½ > ×1: el tamaño, la forma
// y el texto distinguen cada valor, nunca solo el color. Su clave lleva el
// miembro de la columna: cuando cambia, la columna entra de nuevo con escala y
// fundido, escalonada por fila (§6)
interface CellProps {
  value: Multiplier;
  tip: string;
  risk: boolean;
  row: number;
}

function Cell({ value, tip, risk, row }: CellProps) {
  const pill = "h-[26px] w-full max-w-16 rounded-pill grid place-items-center";
  let content: ReactNode;

  if (value === 4) {
    // El aro va en el campo del atacante; sobre el tinte de la fila de riesgo
    // no se vería, así que pasa a su tinta
    content = (
      <span
        className={`-my-0.5 h-9 w-full rounded-[10px] grid place-items-center bg-ink text-bone text-[1.0625rem] outline-3 -outline-offset-3 ${
          risk ? "outline-field-ink" : "outline-field"
        }`}
      >
        ×4
      </span>
    );
  } else if (value === 2 || value === 0.5 || value === 0.25) {
    content = (
      <span className={`${pill} ${value === 2 ? "bg-ink text-bone" : "bg-step text-ink"}`}>
        <span aria-hidden="true">{MULTIPLIER_TEXT[value]}</span>
        <span className="sr-only">×{MULTIPLIER_TEXT[value]}</span>
      </span>
    );
  } else if (value === 0) {
    content = (
      <span className="type-zero h-8 w-full rounded-md grid place-items-center">
        <span className="px-[5px] rounded-sm bg-ink text-bone leading-[1.45]">
          <span aria-hidden="true">0</span>
          <span className="sr-only">×0</span>
        </span>
      </span>
    );
  } else {
    content = <span className="sr-only">×1</span>;
  }

  return (
    <span
      role="cell"
      data-tip={tip}
      style={{ "--row": row } as CSSProperties}
      className="cell-in relative grid place-items-center h-8 text-small font-black num"
    >
      {content}
    </span>
  );
}

// Recuento del balance; el 0 se escribe «–». Los débiles se marcan: 3 o más
// en tinta, 2 en step. En la fila de riesgo las cifras sueltas van en tinta
// sobre el tinte claro (35 %) y en la tinta del campo sobre el oscuro (80 %),
// donde el gris y la tinta normal se pierden
interface CountProps {
  value: number;
  label: string;
  risk: boolean;
  alarm?: boolean;
}

function Count({ value, label, risk, alarm }: CountProps) {
  const riskInk = "text-ink dark:text-field-ink";
  let tone = risk ? riskInk : "";
  if (value === 0) tone = `${risk ? riskInk : "text-ink-soft"} font-bold`;
  else if (alarm && value >= 3) tone = "bg-ink text-bone";
  else if (alarm && value === 2) tone = "bg-step text-ink";

  return (
    <span className={`grid place-items-center h-8 rounded-pill text-small font-black num ${tone}`}>
      <span className="sr-only">{label}: </span>
      <span aria-hidden={value === 0 || undefined}>{value === 0 ? "–" : value}</span>
      {value === 0 && <span className="sr-only">0</span>}
    </span>
  );
}
