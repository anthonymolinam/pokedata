// Pokébola del logo (DESIGN.md §4.0): formas planas, sin degradados.
// Mitad superior en el acento rojo, inferior en blanco, banda y botón en tinta.
export default function Pokeball({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="16" cy="16" r="15.5" fill="var(--ink)" />
      <circle cx="16" cy="16" r="13" fill="var(--surface)" />
      <path d="M3 16a13 13 0 0 1 26 0Z" fill="var(--accent)" />
      <rect x="2" y="14.5" width="28" height="3" fill="var(--ink)" />
      <circle cx="16" cy="16" r="5.5" fill="var(--ink)" />
      <circle cx="16" cy="16" r="3" fill="var(--surface)" />
    </svg>
  );
}
