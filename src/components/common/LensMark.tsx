// Marca de PokéData (DESIGN.md §4.0 y §4.1): una P roja cuyo hueco es una lente
// azul con su aro blanco y un brillo. Formas planas, sin degradados, y colores
// fijos, iguales en los dos temas (§2.4): sobre el fondo oscuro la silueta la
// dibujan el rojo y el aro blanco.
// Con `spin`, el brillo da una vuelta alrededor de la lente al pasar el ratón
// por el enlace que la contiene (`group`) o al enfocarlo con el teclado, como
// un reflejo que recorre el cristal. Con movimiento reducido no se mueve.
export default function LensMark({
  className = "",
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M9 3H17.5A10.5 10.5 0 0 1 17.5 24H13V25A4 4 0 0 1 5 25V7A4 4 0 0 1 9 3Z"
        fill="var(--accent)"
      />
      <circle cx="17.5" cy="13.5" r="7" fill="var(--lens-white)" />
      <circle cx="17.5" cy="13.5" r="5.2" fill="var(--lens)" />
      <g
        className={
          spin
            ? "[transform-box:view-box] origin-[17.5px_13.5px] motion-safe:transition-transform motion-safe:duration-600 motion-safe:ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:group-hover:rotate-360 motion-safe:group-focus-visible:rotate-360"
            : undefined
        }
        fill="var(--lens-white)"
      >
        <circle cx="15.6" cy="11.6" r="1.7" />
        <circle cx="19.6" cy="15.9" r="0.8" />
      </g>
    </svg>
  );
}
