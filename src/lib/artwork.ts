import ARTWORK_BOUNDS from "@/data/artwork-bounds.json";

// Geometría del artwork en la tarjeta (DESIGN.md §4.3), en % del ancho de la
// tarjeta (unidades cqi). La zona del artwork es la zona superior más una
// franja por encima de la tarjeta del 25 % de su altura: el artwork solo puede
// salirse por arriba y nunca entra en la zona reservada del nombre.
export const ART_TOP_ZONE = 62;
const ART_ZONE = ART_TOP_ZONE / 0.75;
// La figura mide el 85 % de la zona del artwork, limitada por el ancho
const FIGURE_HEIGHT = ART_ZONE * 0.85;
const FIGURE_MAX_WIDTH = 88;
// Línea de apoyo de la figura, un poco por encima de la zona reservada
const FIGURE_FLOOR = ART_TOP_ZONE - 4;

// Recuadro opaco de cada artwork en diezmilésimas del lienzo:
// [izquierda, arriba, derecha, abajo]. Lo genera scripts/artwork-bounds.mjs.
const BOUNDS: Record<string, number[]> = ARTWORK_BOUNDS;
// Sin datos (formas alternativas, artwork nuevo) se usa el lienzo entero y la
// imagen cae a object-fit: contain
const FULL_CANVAS = [0, 0, 10000, 10000];

export interface ArtworkFit {
  // Posición y lado del lienzo cuadrado, en cqi respecto a la tarjeta
  left: number;
  top: number;
  size: number;
  // Pie de la figura dentro del lienzo, para que el hover crezca hacia arriba
  origin: string;
}

const round = (value: number) => Math.round(value * 100) / 100;

export function getArtworkFit(id: number): ArtworkFit {
  const [l, t, r, b] = (BOUNDS[id] ?? FULL_CANVAS).map((v) => v / 10000);
  const size = Math.min(FIGURE_HEIGHT / (b - t), FIGURE_MAX_WIDTH / (r - l));
  const centerX = (l + r) / 2;

  return {
    left: round(50 - centerX * size),
    top: round(FIGURE_FLOOR - b * size),
    size: round(size),
    origin: `${round(centerX * 100)}% ${round(b * 100)}%`,
  };
}
