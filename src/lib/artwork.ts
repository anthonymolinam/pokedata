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

const ARTWORK_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

// Lado real del artwork oficial de PokéAPI, en píxeles
export const ARTWORK_SIZE = 475;

export function artworkUrl(id: number): string {
  return `${ARTWORK_URL}/${id}.png`;
}

interface FigureBox {
  // Altura y ancho máximos de la figura, en cualquier longitud CSS
  height: string;
  maxWidth: string;
  // Dónde va la figura: su centro horizontal y su pie, o su centro vertical
  centerX: string;
  bottom?: string;
  centerY?: string;
  // Tope del lienzo, para no ampliar la imagen por encima de su tamaño real
  maxSize?: string;
}

// Coloca el lienzo cuadrado del artwork para que la figura opaca mida `height`
// (o `maxWidth` si es muy ancha) en el sitio indicado. Devuelve un estilo para
// un elemento con position: absolute; el tamaño va en la variable --art.
export function figureStyle(id: number, box: FigureBox): Record<string, string> {
  const [l, t, r, b] = (BOUNDS[id] ?? FULL_CANVAS).map((v) => v / 10000);
  const centerX = (l + r) / 2;
  const top = box.bottom
    ? `calc(${box.bottom} - var(--art) * ${round(b)})`
    : `calc(${box.centerY ?? "50%"} - var(--art) * ${round((t + b) / 2)})`;

  return {
    "--art": `min(${box.height} / ${round(b - t)}, ${box.maxWidth} / ${round(r - l)}${box.maxSize ? `, ${box.maxSize}` : ""})`,
    left: `calc(${box.centerX} - var(--art) * ${round(centerX)})`,
    top,
    width: "var(--art)",
    height: "var(--art)",
    transformOrigin: `${round(centerX * 100)}% ${round(b * 100)}%`,
  };
}

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
