import { ART_TOP_ZONE } from "@/lib/artwork";

// Rejilla de tarjetas (DESIGN.md §4.3): 4 columnas desde 1080px, 3 desde 768px
// y 2 por debajo. Los huecos entre filas dejan sitio al artwork que se sale por
// arriba, y el relleno superior hace lo mismo con la primera fila.
export const CARD_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-13 pt-6 md:grid-cols-3 md:gap-x-5 md:gap-y-18 md:pt-10 min-[67.5rem]:grid-cols-4";

// Tarjeta fantasma de carga (§4.8): la misma forma que la real, en --step,
// con la zona reservada y sin parpadeo en bucle
export function PokemonCardSkeleton() {
  return (
    <div className="flex flex-col rounded-surface bg-step @container [--card-pad:max(0.875rem,6.5cqi)]">
      <div style={{ height: `${ART_TOP_ZONE}cqi` }} />
      <div className="flex flex-col gap-[max(0.375rem,2.5cqi)] px-(--card-pad) pt-3 pb-(--card-pad) min-h-[84px] md:min-h-24">
        <div className="h-[max(1rem,var(--step-lead))] w-1/2 rounded-pill bg-ground" />
        <div className="flex gap-1">
          <div className="h-6 w-14 rounded-pill bg-ground" />
          <div className="h-6 w-14 rounded-pill bg-ground" />
        </div>
      </div>
    </div>
  );
}

// Página de tarjetas fantasma. Entran con opacidad a los 300ms, así que una
// carga rápida no llega a mostrarlas.
export function PokemonGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div aria-hidden="true" className={`${CARD_GRID} skeleton-in`}>
      {Array.from({ length: count }, (_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}
