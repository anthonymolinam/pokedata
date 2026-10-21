// Dado dibujado: cara del cinco con esquinas redondeadas. Va sobre un botón en
// --surface: el dado del Pokémon del día (§4.2) y el del equipo aleatorio (§4.9)
export default function Die() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-6">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="var(--ink)" />
      {[
        [8, 8],
        [16, 8],
        [12, 12],
        [8, 16],
        [16, 16],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill="var(--surface)" />
      ))}
    </svg>
  );
}
