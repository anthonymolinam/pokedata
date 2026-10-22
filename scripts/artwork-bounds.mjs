// Mide el recuadro opaco del artwork oficial de cada Pokémon (DESIGN.md §4.3)
// y lo guarda en src/data/artwork-bounds.json. La tarjeta usa esos recuadros
// para que todas las figuras midan lo mismo aunque cada lienzo tenga márgenes
// transparentes distintos (Caterpie ocupa la mitad del suyo, Venusaur casi todo).
//
// Uso: npm run artwork-bounds [-- --from 1 --to 1025]
// Las formas tienen id propio desde el 10001: --from 10001 --to 10330
// No tiene dependencias: descarga cada PNG y lo decodifica con zlib.

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/artwork-bounds.json");
const ARTWORK_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

// Un píxel cuenta como figura a partir de este alfa (0–255): deja fuera el
// halo casi invisible del recorte sin comerse los bordes suaves
const ALPHA_THRESHOLD = 16;
const CONCURRENCY = 12;

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const FROM = argValue("--from", 1);
const TO = argValue("--to", 1025);

// --- PNG mínimo: color 0, 2, 3, 4 y 6 a 8 o 16 bits, sin entrelazado ---

const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function decodeAlpha(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("no es un PNG");

  let offset = 8;
  let width = 0;
  let height = 0;
  let depth = 8;
  let colorType = 6;
  let interlace = 0;
  let paletteAlpha = null;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "tRNS" && colorType === 3) {
      paletteAlpha = data;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  if (interlace) throw new Error("PNG entrelazado");
  if (depth !== 8 && depth !== 16) throw new Error(`profundidad ${depth}`);
  const channels = CHANNELS[colorType];
  if (!channels) throw new Error(`tipo de color ${colorType}`);

  const bytesPerPixel = channels * (depth / 8);
  const stride = width * bytesPerPixel;
  const raw = inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = y * stride;
    const prev = out - stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= bytesPerPixel ? pixels[out + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[prev + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? pixels[prev + x - bytesPerPixel] : 0;
      let value = line[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) value += paeth(left, up, upLeft);
      pixels[out + x] = value & 0xff;
    }
  }

  // Alfa de cada píxel; sin canal alfa ni tRNS, todo el lienzo es opaco
  const alphaAt = (x, y) => {
    const i = y * stride + x * bytesPerPixel;
    if (colorType === 6) return pixels[i + (depth === 16 ? 6 : 3)];
    if (colorType === 4) return pixels[i + (depth === 16 ? 2 : 1)];
    if (colorType === 3) return paletteAlpha?.[pixels[i]] ?? 255;
    return 255;
  };

  return { width, height, alphaAt };
}

function opaqueBounds({ width, height, alphaAt }) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alphaAt(x, y) < ALPHA_THRESHOLD) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return null;

  // Fracción del lienzo en diezmilésimas: [izquierda, arriba, derecha, abajo]
  const scale = (v, size) => Math.round((v / size) * 10000);
  return [
    scale(left, width),
    scale(top, height),
    scale(right + 1, width),
    scale(bottom + 1, height),
  ];
}

async function measure(id) {
  const res = await fetch(`${ARTWORK_URL}/${id}.png`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return opaqueBounds(decodeAlpha(Buffer.from(await res.arrayBuffer())));
}

async function main() {
  let bounds = {};
  try {
    bounds = JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    // Primera ejecución
  }

  const ids = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i);
  const failed = [];
  let done = 0;

  const worker = async () => {
    while (ids.length) {
      const id = ids.shift();
      try {
        const box = await measure(id);
        if (box) bounds[id] = box;
        else failed.push(`${id} (vacío)`);
      } catch (error) {
        failed.push(`${id} (${error.message})`);
      }
      done++;
      if (done % 100 === 0) console.log(`${done} medidos`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const sorted = Object.fromEntries(
    Object.entries(bounds).sort(([a], [b]) => Number(a) - Number(b)),
  );
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(sorted) + "\n");

  console.log(`${Object.keys(sorted).length} recuadros en ${OUT}`);
  if (failed.length) console.log(`Sin datos (caen a object-fit: contain): ${failed.join(", ")}`);
}

main();
