import { ArrowLeft } from "lucide-react";
import type { TeamMember } from "@/lib/team";
import { offensiveCoverage } from "@/lib/team-analysis";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

const fill = (text: string, n: number) => text.replace("{n}", String(n));

// Flecha que vuelve hacia el rival: se lee «Fuego ← Agua», nunca «Fuego ·
// Agua», que parecía decir que Fuego pega a Agua
function Arrow({ className = "" }: { className?: string }) {
  return <ArrowLeft aria-hidden="true" strokeWidth={2.75} className={`size-4 shrink-0 ${className}`} />;
}

// Panel «Cobertura ofensiva» (DESIGN.md §4.9): qué tipos rivales golpea el
// equipo ×2 según los tipos de sus miembros, y cuáles se le escapan. Ambos
// grupos en el orden de la tabla de tipos. `members` es null hasta la
// hidratación: el panel pinta solo su título.
export default function TeamCoverage({ locale, members }: { locale: Locale; members: TeamMember[] | null }) {
  const { team, typeNames } = getDictionary(locale);
  const { covered, uncovered } = offensiveCoverage(members ?? []);

  let body = null;
  if (members && members.length === 0) {
    body = <p className="px-6 pt-5 text-body">{team.empty}</p>;
  } else if (members) {
    body = (
      <div className="grid gap-7 px-6 pt-5 lg:grid-cols-[3fr_2fr]">
        <div>
          <h3 className="mb-3 text-lead font-black">{fill(team.covered, covered.length)}</h3>
          <p
            aria-hidden="true"
            className="-mt-1 mb-3.5 text-small font-extrabold text-ink-soft"
          >
            {/* En línea, no en flex: en un móvil el texto parte en dos líneas */}
            <span className="inline-flex h-6 items-center px-2.5 rounded-pill bg-step text-[12px] text-ink align-middle">
              {team.keyRival}
            </span>
            <Arrow className="inline mx-1.5 align-[-3px]" />
            {team.keyHitBy}
          </p>
          <ul className="flex flex-wrap gap-2">
            {covered.map(({ rival, hitBy }) => (
              <li
                key={rival}
                className="inline-flex flex-wrap max-w-full min-h-11 items-center gap-1.5 py-1 pl-1 pr-3 rounded-[22px] bg-step text-ink"
              >
                <span
                  data-type={rival}
                  className="inline-flex h-9 items-center px-3.5 rounded-pill bg-field text-field-ink text-small font-extrabold"
                >
                  {typeNames[rival]}
                </span>
                <Arrow />
                <span className="sr-only">{team.hitBy}</span>
                {hitBy.map((type) => (
                  <span
                    key={type}
                    data-type={type}
                    className="inline-flex h-6 items-center px-2.5 rounded-pill bg-field text-field-ink text-[12px] font-extrabold"
                  >
                    {typeNames[type]}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-lead font-black">{fill(team.uncovered, uncovered.length)}</h3>
          {/* Sin campo de color: aquí no hay nada que celebrar */}
          <ul className="flex flex-wrap gap-2">
            {uncovered.map((type) => (
              <li
                key={type}
                className="inline-flex h-11 items-center px-4 rounded-pill bg-step text-small font-extrabold text-ink"
              >
                {typeNames[type]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="team-coverage-title" data-field="surface" className="mt-7 pb-7 rounded-surface bg-surface">
      <div className="px-6 pt-7">
        <h2 id="team-coverage-title" className="text-head font-black tracking-[-0.03em] leading-[1.05]">
          {team.coverage}
        </h2>
        <p className="mt-1.5 max-w-[60ch] text-body text-ink-soft">{team.coverageNote}</p>
      </div>
      {body}
    </section>
  );
}
