import { TypeEffectiveness } from "@/lib/type-matrix";
import { TYPE_COLORS } from "@/constants/typeColors";

interface TypeWeaknessesProps {
  effectiveness: TypeEffectiveness;
}

interface GroupConfig {
  label: string;
  badge: string;
  badgeColor: string;
  types: string[];
}

export default function TypeWeaknesses({ effectiveness }: TypeWeaknessesProps) {
  const groups: GroupConfig[] = [
    {
      label: "Super Weak",
      badge: "4×",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      types: effectiveness.weaknesses4x,
    },
    {
      label: "Weak",
      badge: "2×",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      types: effectiveness.weaknesses2x,
    },
    {
      label: "Resistant",
      badge: "½×",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      types: effectiveness.resistancesHalf,
    },
    {
      label: "Super Resistant",
      badge: "¼×",
      badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
      types: effectiveness.resistancesQuarter,
    },
    {
      label: "Immune",
      badge: "0×",
      badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
      types: effectiveness.immunities0x,
    },
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          Defensive Matchups (Weaknesses & Resistances)
        </h3>
        <p className="text-xs text-zinc-400">
          Damage multipliers received based on incoming attack types.
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          if (group.types.length === 0) return null;

          return (
            <div
              key={group.label}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-2xl bg-zinc-950/40 border border-zinc-800/40"
            >
              <div className="flex items-center gap-2 min-w-36">
                <span
                  className={`text-xs font-mono font-black px-2 py-0.5 rounded-md border ${group.badgeColor}`}
                >
                  {group.badge}
                </span>
                <span className="text-xs font-medium text-zinc-300">
                  {group.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 flex-1">
                {group.types.map((type) => (
                  <span
                    key={type}
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                      TYPE_COLORS[type] || "bg-zinc-700 text-white"
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
