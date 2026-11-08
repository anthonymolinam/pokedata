// Iconos de la marca de la lente (DESIGN.md §5): icon.svg, favicon.ico,
// apple-icon.png y los PNG del manifiesto. Repite las formas de LensMark.tsx;
// si la marca cambia, se cambian aquí y se ejecuta `npm run logo-icons`.
// sharp llega con Next. Con `--preview <carpeta>` escribe ahí en vez de en el proyecto
import { writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const out = process.argv[2] === "--preview" ? process.argv[3] + "/" : root;

const RED = "#cc2e0b", WHITE = "#ffffff", LENS = "#3d7bef";
// small: sin el brillo pequeño, que a 16px es medio píxel
const mark = (small = false) =>
  `<path d="M9 3H17.5A10.5 10.5 0 0 1 17.5 24H13V25A4 4 0 0 1 5 25V7A4 4 0 0 1 9 3Z" fill="${RED}"/>` +
  `<circle cx="17.5" cy="13.5" r="7" fill="${WHITE}"/><circle cx="17.5" cy="13.5" r="5.2" fill="${LENS}"/>` +
  `<circle cx="15.6" cy="11.6" r="1.7" fill="${WHITE}"/>` + (small ? "" : `<circle cx="19.6" cy="15.9" r="0.8" fill="${WHITE}"/>`);
// La P ocupa x 5–28 e y 3–29 (23 × 26). En la pestaña el icono va pegado al
// título, así que el encuadre llena el alto y apoya la P en el borde derecho:
// el aire que sobra (3 de 26, unos 2px a 16px) queda a la izquierda, contra
// el borde de la pestaña, y no entre la P y el texto
const VB = "2 3 26 26";
const tight = (small) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}">${mark(small)}</svg>`;
// Sobre fondo blanco a sangre; `scale` es el lado de la marca respecto al icono
const plate = (scale) => {
  const side = 27 / scale, x = 3 - (side - 27) / 2, y = 2.5 - (side - 27) / 2; // centrada
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${side} ${side}"><rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${WHITE}"/>${mark()}</svg>`;
};
const png = (svg, size) => sharp(Buffer.from(svg), { density: 72 * size / 27 * 4 }).resize(size, size).png().toBuffer();

const ico = async () => {
  const frames = await Promise.all([[16, true], [32, false], [48, false]].map(([s, small]) => png(tight(small), s).then((b) => [s, b])));
  const head = Buffer.alloc(6 + 16 * frames.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(frames.length, 4);
  let offset = head.length;
  frames.forEach(([s, b], i) => {
    const e = 6 + i * 16;
    head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(b.length, e + 8); head.writeUInt32LE(offset, e + 12); offset += b.length;
  });
  return Buffer.concat([head, ...frames.map(([, b]) => b)]);
};

mkdirSync(out + "public/icons", { recursive: true });
mkdirSync(out + "src/app", { recursive: true });
writeFileSync(out + "src/app/icon.svg", tight(false) + "\n");
writeFileSync(out + "src/app/favicon.ico", await ico());
writeFileSync(out + "src/app/apple-icon.png", await png(plate(0.68), 180));
writeFileSync(out + "public/icons/icon-192.png", await png(plate(0.72), 192));
writeFileSync(out + "public/icons/icon-512.png", await png(plate(0.72), 512));
// Maskable: la marca dentro del círculo seguro del 80 %
writeFileSync(out + "public/icons/icon-maskable-512.png", await png(plate(0.54), 512));
if (out !== root) for (const s of [16, 32]) writeFileSync(out + `fav-${s}.png`, await png(tight(s === 16), s));
console.log(`Iconos escritos en ${out}`);
