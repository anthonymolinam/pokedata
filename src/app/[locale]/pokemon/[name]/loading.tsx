// Ficha fantasma (DESIGN.md §4.8): la misma composición que la ficha, en
// --step, mientras el servidor pide los datos a PokéAPI (varios segundos si
// no están en caché). Entra con opacidad a los 300ms, así que una carga
// rápida no llega a mostrarla.
export default function PokemonLoading() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-5 md:gap-8 skeleton-in">
      {/* Escenario: el hueco del artwork y, debajo, número, nombre y tipos */}
      <div className="rounded-[22px] md:rounded-[32px] bg-step">
        <div className="h-[min(86vw,48svh)] md:h-[min(52svh,600px)]" />
        <div className="flex flex-col gap-3 px-5 pb-6 md:px-10 md:pb-10">
          <div className="h-5 w-20 rounded-pill bg-ground" />
          <div className="h-12 w-3/5 max-w-sm rounded-pill bg-ground md:h-16" />
          <div className="flex gap-1.5">
            <div className="h-7 w-16 rounded-pill bg-ground" />
            <div className="h-7 w-16 rounded-pill bg-ground" />
          </div>
        </div>
      </div>

      {/* Estadísticas y debilidades */}
      <div className="grid gap-5 md:gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {[6, 4].map((rows, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-surface bg-surface p-6 md:p-10">
            <div className="mb-2 h-9 w-1/2 rounded-pill bg-step" />
            {Array.from({ length: rows }, (_, row) => (
              <div key={row} className="h-5 rounded-pill bg-step" />
            ))}
          </div>
        ))}
      </div>

      {/* Cadena evolutiva */}
      <div className="flex flex-col gap-6 rounded-surface bg-surface p-6 md:p-10">
        <div className="h-9 w-2/5 rounded-pill bg-step" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`aspect-[4/5] rounded-surface bg-step ${i === 2 ? "max-sm:hidden" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
