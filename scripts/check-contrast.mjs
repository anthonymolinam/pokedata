// Recalcula desde globals.css las tablas de contraste de DESIGN.md (§2.1,
// §2.2 y §2.4) y falla si algún par baja de su umbral: 4.5:1 en texto y 3:1
// en los bordes de campo y los gráficos (WCAG 2.x). Las cifras del documento
// salen de aquí, no a mano.
//
// Además comprueba que los dos bloques oscuros de globals.css son iguales y
// que typeColors.ts y theme.ts repiten los mismos valores que el CSS.
//
// Uso: npm run check-contrast [-- --md]
//   --md  imprime las tablas en Markdown, listas para pegar en DESIGN.md
// Sin dependencias. Sale con código 1 si algo falla.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(ROOT, path), "utf8");
const MD = process.argv.includes("--md");

const TEXT = 4.5;
const GRAPHIC = 3;

const TYPES = [
  ["normal", "Normal"],
  ["fire", "Fuego"],
  ["water", "Agua"],
  ["electric", "Eléctrico"],
  ["grass", "Planta"],
  ["ice", "Hielo"],
  ["fighting", "Lucha"],
  ["poison", "Veneno"],
  ["ground", "Tierra"],
  ["flying", "Volador"],
  ["psychic", "Psíquico"],
  ["bug", "Bicho"],
  ["rock", "Roca"],
  ["ghost", "Fantasma"],
  ["dragon", "Dragón"],
  ["dark", "Siniestro"],
  ["steel", "Acero"],
  ["fairy", "Hada"],
];

// --- Lectura de globals.css -------------------------------------------------

const css = read("src/app/globals.css").replace(/\/\*[\s\S]*?\*\//g, "");

// Cuerpo del bloque que abre en `from` (la posición de su «{»)
function blockAt(source, from) {
  let depth = 0;
  for (let i = from; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(from + 1, i);
  }
  throw new Error("Bloque sin cerrar");
}

// Sin `nested`, solo bloques de primer nivel (sin sangría): así no confunde el
// bloque de tokens con el @media de la variante dark: de Tailwind
function block(source, selector, nested = false) {
  const match = new RegExp(`(^|\\n)${nested ? "[ \\t]*" : ""}${selector.replace(/[[\]().*"]/g, "\\$&")}\\s*\\{`).exec(source);
  if (!match) throw new Error(`No encuentro ${selector} en globals.css`);
  return blockAt(source, match.index + match[0].length - 1);
}

function declarations(body) {
  const vars = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[name] = value.trim().toLowerCase();
  }
  return vars;
}

const light = declarations(block(css, ":root"));
const darkForced = declarations(block(css, ':root[data-theme="dark"]'));
const darkAuto = declarations(
  block(block(css, "@media (prefers-color-scheme: dark)"), ':root:not([data-theme="light"])', true),
);

// Cada tema es el claro con sus sustituciones encima; var() se resuelve en el
// mismo tema, igual que en el navegador
const themes = { claro: light, oscuro: { ...light, ...darkForced } };

function token(theme, name, seen = []) {
  const value = themes[theme][name];
  if (value === undefined) throw new Error(`${name} no existe en el tema ${theme}`);
  if (seen.includes(name)) throw new Error(`Referencia circular en ${name}`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  if (ref) return token(theme, ref[1], [...seen, name]);
  if (!/^#[0-9a-f]{6}$/.test(value)) throw new Error(`${name} no es un color plano: ${value}`);
  return value;
}

// --- Contraste WCAG 2.x -----------------------------------------------------

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (channels) =>
  "#" + channels.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");

function luminance(color) {
  const [r, g, b] = rgb(color).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// `top` al `alpha` sobre `bottom`, como lo mezcla el navegador (en sRGB)
const over = (top, alpha, bottom) =>
  hex(rgb(top).map((c, i) => c * alpha + rgb(bottom)[i] * (1 - alpha)));

// Dos decimales hacia abajo: una cifra nunca promete más de lo que hay
const fmt = (value) => (Math.floor(value * 100) / 100).toFixed(2);

// --- Comprobaciones ---------------------------------------------------------

const failures = [];

function check(label, value, min) {
  if (min !== undefined && value < min) {
    failures.push(`${label}: ${fmt(value)}:1, por debajo de ${min}:1`);
  }
  return fmt(value);
}

function pair(theme, fg, bg, min) {
  return check(`${fg} sobre ${bg} (${theme})`, ratio(token(theme, fg), token(theme, bg)), min);
}

// Coherencia: los dos bloques oscuros y las copias en TypeScript
for (const name of new Set([...Object.keys(darkForced), ...Object.keys(darkAuto)])) {
  if (darkForced[name] !== darkAuto[name]) {
    failures.push(
      `${name} difiere entre los bloques oscuros: ${darkForced[name] ?? "falta"} (forzado) y ${darkAuto[name] ?? "falta"} (automático)`,
    );
  }
}

const typeColors = read("src/constants/typeColors.ts");
const tsConst = (name) => new RegExp(`${name} = "(#[0-9A-Fa-f]{6})"`).exec(typeColors)?.[1].toLowerCase();
const tsInk = { INK: token("claro", "--on-light"), BONE: token("claro", "--on-dark") };
for (const [name, cssName] of [["GROUND", "--ground"], ["SURFACE", "--surface"], ["INK", "--ink"], ["BONE", "--bone"]]) {
  if (tsConst(name) !== token("claro", cssName)) {
    failures.push(`typeColors.ts: ${name} = ${tsConst(name)}, en globals.css ${cssName} = ${token("claro", cssName)}`);
  }
}
for (const [type] of TYPES) {
  const row = new RegExp(`${type}: \\{ field: "(#\\w+)", ink: (\\w+), step: "(#\\w+)", deep: "(#\\w+)" \\}`).exec(typeColors);
  if (!row) {
    failures.push(`typeColors.ts: no encuentro la fila de ${type}`);
    continue;
  }
  const [, field, ink, step, deep] = row;
  const expected = { "": field, "-ink": tsInk[ink], "-step": step, "-deep": deep };
  for (const [suffix, value] of Object.entries(expected)) {
    const cssValue = token("claro", `--type-${type}${suffix}`);
    if (value?.toLowerCase() !== cssValue) {
      failures.push(`typeColors.ts: ${type}${suffix || " field"} = ${value}, en globals.css ${cssValue}`);
    }
  }
}

const themeTs = read("src/lib/theme.ts");
for (const theme of ["light", "dark"]) {
  const value = new RegExp(`${theme}: "(#[0-9A-Fa-f]{6})"`).exec(themeTs)?.[1].toLowerCase();
  const cssValue = token(theme === "light" ? "claro" : "oscuro", "--ground");
  if (value !== cssValue) failures.push(`theme.ts: THEME_COLORS.${theme} = ${value}, en globals.css --ground = ${cssValue}`);
}

// §2.1: tokens globales en los dos temas
const GLOBAL_ROWS = [
  ["`--ink` sobre `--ground` / `--surface` / `--step` / `--raised` / `--raised-step`", "--ink", ["--ground", "--surface", "--step", "--raised", "--raised-step"], TEXT],
  ["`--ink` sobre `--control` (pastillas y botones neutros)", "--ink", ["--control"], TEXT],
  ["`--control` sobre `--surface` / `--raised` (borde de la pastilla; en oscuro, 3:1 sobre los paneles)", "--control", ["--surface", "--raised"]],
  ["`--ink-soft` sobre `--ground` / `--surface` / `--step` / `--raised`", "--ink-soft", ["--ground", "--surface", "--step", "--raised"], TEXT],
  ["`--bone` sobre `--ink` (botones, «Total», tooltips)", "--bone", ["--ink"], TEXT],
  ["`--on-dark` / `--on-dark-soft` sobre `--footer`", ["--on-dark", "--on-dark-soft"], "--footer", TEXT],
  ["`--accent` sobre `--ground` (mitad del logo, gráfico)", "--accent", ["--ground"], GRAPHIC],
];

// En oscuro la pastilla neutra tiene que verse como botón sobre el panel
pair("oscuro", "--control", "--surface", GRAPHIC);

const globalTable = GLOBAL_ROWS.map(([label, fg, bg, min]) => {
  const cells = Object.keys(themes).map((theme) => {
    const pairs = Array.isArray(fg) ? fg.map((f) => [f, bg]) : bg.map((b) => [fg, b]);
    return pairs.map(([f, b]) => pair(theme, f, b, min)).join(" / ");
  });
  return [label, ...cells];
});

// §2.2: los 18 tipos en claro. deep/fondo es informativo: los que no llegan
// salen en cursiva y por eso existe la regla 1 del §2.3
const lightTypeTable = TYPES.map(([type, name]) => {
  const t = (suffix) => token("claro", `--type-${type}${suffix}`);
  const inkName = t("-ink") === token("claro", "--on-light") ? "ink" : "bone";
  const onGround = ratio(t("-deep"), token("claro", "--ground"));
  return [
    name,
    `\`${t("").toUpperCase()}\``,
    inkName,
    check(`${name}: field/ink (claro)`, ratio(t(""), t("-ink")), TEXT),
    `\`${t("-step").toUpperCase()}\``,
    `\`${t("-deep").toUpperCase()}\``,
    check(`${name}: deep/superficie (claro)`, ratio(t("-deep"), token("claro", "--surface")), TEXT),
    onGround < TEXT ? `*${fmt(onGround)}*` : fmt(onGround),
  ];
});

// §2.4: los 18 tipos en oscuro. El campo necesita 3:1 contra el fondo para
// que se vea el borde de la tarjeta; glow es el tipo como texto
const darkTypeTable = TYPES.map(([type, name]) => {
  const t = (suffix) => token("oscuro", `--type-${type}${suffix}`);
  const changed = t("") !== token("claro", `--type-${type}`);
  const field = `\`${t("").toUpperCase()}\``;
  return [
    name,
    changed ? `**${field}**` : field,
    check(`${name}: campo/fondo (oscuro)`, ratio(t(""), token("oscuro", "--ground")), GRAPHIC),
    check(`${name}: field/ink (oscuro)`, ratio(t(""), t("-ink")), TEXT),
    t("-text") === t("") ? "= field" : `\`${t("-text").toUpperCase()}\``,
    check(`${name}: glow/superficie (oscuro)`, ratio(t("-text"), token("oscuro", "--surface")), TEXT),
    check(`${name}: glow/fondo (oscuro)`, ratio(t("-text"), token("oscuro", "--ground")), TEXT),
  ];
});

// §2.3, regla 4: etiquetas de tipo dentro de un campo. Pastilla de
// superficie al 80 % (en oscuro, --ground) con texto en --ink
const tagWorst = Object.fromEntries(
  Object.keys(themes).map((theme) => {
    const base = token(theme, theme === "claro" ? "--surface" : "--ground");
    const results = TYPES.map(([type, name]) => {
      const pill = over(base, 0.8, token(theme, `--type-${type}`));
      return [name, ratio(token(theme, "--ink"), pill)];
    });
    for (const [name, value] of results) check(`${name}: etiqueta de tipo (${theme})`, value, TEXT);
    return [theme, results.sort((a, b) => a[1] - b[1])[0]];
  }),
);

// --- Salida -----------------------------------------------------------------

function table(head, rows) {
  if (!MD) {
    const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
    const line = (cells) => cells.map((c, i) => String(c).padEnd(widths[i])).join("  ");
    return [line(head), ...rows.map(line)].join("\n");
  }
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}

const plain = (s) => (MD ? s : s.replace(/[`*]/g, ""));
const out = [
  "§2.1 Tokens globales (umbral 4.5:1; el acento, 3:1)",
  table(["Par", "Claro", "Oscuro"], globalTable.map((r) => r.map(plain))),
  "",
  "§2.2 Tipos en claro (field/ink y deep/blanco, 4.5:1; deep/fondo es informativo)",
  table(["Tipo", "`field`", "`field-ink`", "field/ink", "`step`", "`deep`", "deep/blanco", "deep/fondo"].map(plain), lightTypeTable.map((r) => r.map(plain))),
  "",
  "§2.4 Tipos en oscuro (campo/fondo 3:1; el resto 4.5:1)",
  table(["Tipo", "`field` en oscuro", "campo/fondo", "field/ink", "`glow`", "glow/superficie", "glow/fondo"].map(plain), darkTypeTable.map((r) => r.map(plain))),
  "",
  "§2.3 regla 4, etiquetas de tipo dentro de un campo (peor caso, 4.5:1)",
  ...Object.entries(tagWorst).map(([theme, [name, value]]) => `  ${theme}: ${fmt(value)}:1, sobre ${name}`),
  "",
];
console.log(out.join("\n"));

if (failures.length) {
  console.error(`FALLA (${failures.length}):\n` + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log("OK: todos los pares llegan a su umbral y los valores coinciden en todos los ficheros.");
