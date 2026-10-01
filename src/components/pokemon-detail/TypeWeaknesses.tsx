import { TypeEffectiveness } from "@/lib/type-matrix";
import { TYPE_COLORS } from "@/constants/typeColors";

interface TypeWeaknessesProps {
  effectiveness: TypeEffectiveness;
  locale?: string;
}

interface GroupConfig {
  label: string;
  badge: string;
  badgeColor: string;
  types: string[];
}

const TYPE_TRANSLATIONS_ES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  steel: "Acero",
  dark: "Siniestro",
  fairy: "Hada",
};

export default function TypeWeaknesses({
  effectiveness,
  locale = "es",
}: TypeWeaknessesProps) {
  const isEs = locale === "es";

  const groups: GroupConfig[] = [
    {
      label: isEs ? "Superdébil" : "Super Weak",
      badge: "4×",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      types: effectiveness.weaknesses4x,
    },
    {
      label: isEs ? "Débil" : "Weak",
      badge: "2×",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      types: effectiveness.weaknesses2x,
    },
    {
      label: isEs ? "Resistente" : "Resistant",
      badge: "½×",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      types: effectiveness.resistancesHalf,
    },
    {
      label: isEs ? "Superresistente" : "Super Resistant",
      badge: "¼×",
      badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/40",
      types: effectiveness.resistancesQuarter,
    },
    {
      label: isEs ? "Inmune" : "Immune",
      badge: "0×",
      badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
      types: effectiveness.immunities0x,
    },
  ];

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {isEs
            ? "Eficacia de Tipos (Debilidades y Resistencias)"
            : "Defensive Matchups (Weaknesses & Resistances)"}
        </h3>
        <p className="text-xs text-zinc-400">
          {isEs
            ? "Multiplicadores de daño recibidos según el tipo de ataque atacante."
            : "Damage multipliers received based on incoming attack types."}
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
                {group.types.map((type) => {
                  const displayType =
                    isEs && TYPE_TRANSLATIONS_ES[type.toLowerCase()]
                      ? TYPE_TRANSLATIONS_ES[type.toLowerCase()]
                      : type;

                  return (
                    <span
                      key={type}
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                        TYPE_COLORS[type.toLowerCase()] ||
                        "bg-zinc-700 text-white"
                      }`}
                    >
                      {displayType}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
