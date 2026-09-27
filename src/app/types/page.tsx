import InteractiveTypeChart from "@/components/types/InteractiveTypeChart";

export const metadata = {
  title: "Type Chart | PokéData",
  description:
    "Complete matrix of elemental matchups, weaknesses, and resistances in Pokémon.",
};

export default function TypesPage() {
  return (
    <div className="min-h-[calc(100dvh-110px)] flex flex-col justify-start max-w-7xl mx-auto px-4 py-3 space-y-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
          Type Chart
        </h1>
        <p className="text-zinc-400 text-xs">
          Interactive matrix for elemental battle matchups and damage
          multipliers.
        </p>
      </div>

      <InteractiveTypeChart />
    </div>
  );
}
