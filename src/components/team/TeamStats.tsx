"use client";

import type { CSSProperties } from "react";
import type { TeamMember } from "@/lib/team";
import { teamStats } from "@/lib/team-analysis";
import { useReveal } from "@/lib/use-reveal";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Panel «Estadísticas base» (DESIGN.md §4.9): el total medio del equipo y una
// barra por estadística con la media sobre 255 y el mejor miembro. Las barras
// crecen al entrar en pantalla y se deslizan a su nuevo valor cuando cambia el
// equipo (globals.css, .stat-bar). Sin miembros, las cifras son «–».
export default function TeamStats({ locale, members }: { locale: Locale; members: TeamMember[] | null }) {
  const { team } = getDictionary(locale);
  const ref = useReveal<HTMLElement>();
  const summary = teamStats(members ?? []);
  const hasMembers = (members?.length ?? 0) > 0;

  return (
    <section
      ref={ref}
      aria-labelledby="team-stats-title"
      data-field="surface"
      className="mt-7 grid gap-10 px-6 py-7 rounded-surface bg-surface lg:grid-cols-[minmax(220px,1fr)_2.4fr]"
    >
      <div>
        <h2 id="team-stats-title" className="text-head font-black tracking-[-0.03em] leading-[1.05]">
          {team.stats}
        </h2>
        <p className="mt-[18px] font-extrabold text-ink-soft">
          <span className={`block text-hero font-black num ${hasMembers ? "text-ink" : "text-ink-soft"}`}>
            {hasMembers ? summary.averageTotal : "–"}
          </span>
          {team.averageTotal}
        </p>
      </div>

      <dl className="grid content-center gap-3.5">
        {summary.stats.map(({ stat, average, best }) => (
          <div
            key={stat}
            data-reveal="pending"
            className="grid grid-cols-[96px_40px_1fr] items-center gap-3.5 lg:grid-cols-[110px_48px_1fr_190px]"
          >
            <dt className="text-small font-extrabold">{team.statNames[stat]}</dt>
            <dd className="text-right font-black num">{hasMembers ? average : "–"}</dd>
            <dd aria-hidden="true" className="h-3 overflow-hidden rounded-pill bg-step">
              <span
                className="stat-bar block h-full rounded-pill bg-ink"
                style={{ "--v": hasMembers ? Math.min(average / 255, 1) : 0 } as CSSProperties}
              />
            </dd>
            <dd className="truncate text-small font-bold text-ink-soft max-lg:hidden">
              {best && hasMembers
                ? team.best.replace("{name}", best.member.name).replace("{value}", String(best.value))
                : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
