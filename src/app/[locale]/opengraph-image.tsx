import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { artworkUrl } from "@/lib/artwork";
import { getDictionary } from "@/constants/translations";

// Imagen para compartir del sitio (DESIGN.md §5), 1200×630 en cada idioma:
// la marca y su frase a la izquierda y, a la derecha, tres columnas como las
// del Pokémon del día (§4.2), cada una en el campo de su tipo y con el
// artwork asomando por arriba. Las fichas de Pokémon llevan su propio artwork.
// Satori no lee woff2: Nunito va aquí en ttf (fonts/og, misma licencia OFL)

export const alt = "PokéData";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Colores fijos de globals.css (§2.1): el suelo claro, la tinta, el acento de
// la P y la lente del logo y los campos de tipo, iguales en los dos temas
const GROUND = "#f3f4f8";
const INK = "#15161c";
const ACCENT = "#cc2e0b";
const LENS = "#3d7bef";
const WHITE = "#ffffff";

const COLUMNS = [
  { id: 6, name: "Charizard", field: "#ee8130", lift: 0 },
  { id: 25, name: "Pikachu", field: "#f7d02c", lift: 56 },
  { id: 7, name: "Squirtle", field: "#6390f0", lift: 0 },
];


export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { footer } = getDictionary(locale === "en" ? "en" : "es");
  // Rutas literales, para que el despliegue incluya los ttf en la función
  const [black, extraBold] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/og/Nunito-900.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/og/Nunito-800.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 64px 0 80px",
          background: GROUND,
          color: INK,
          fontFamily: "Nunito",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
          {/* La marca de la lente (LensMark), con sus colores fijos */}
          <svg width="96" height="96" viewBox="0 0 32 32">
            <path
              d="M9 3H17.5A10.5 10.5 0 0 1 17.5 24H13V25A4 4 0 0 1 5 25V7A4 4 0 0 1 9 3Z"
              fill={ACCENT}
            />
            <circle cx="17.5" cy="13.5" r="7" fill={WHITE} />
            <circle cx="17.5" cy="13.5" r="5.2" fill={LENS} />
            <circle cx="15.6" cy="11.6" r="1.7" fill={WHITE} />
            <circle cx="19.6" cy="15.9" r="0.8" fill={WHITE} />
          </svg>
          <div style={{ marginTop: 28, fontSize: 100, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>
            PokéData
          </div>
          <div style={{ marginTop: 24, fontSize: 38, fontWeight: 800, lineHeight: 1.25 }}>
            {footer.tagline}
          </div>
          <div style={{ marginTop: 36, fontSize: 30, fontWeight: 800, color: ACCENT }}>pokedata.app</div>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: "100%", paddingBottom: 64 }}>
          {COLUMNS.map(({ id, name, field, lift }) => (
            <div
              key={id}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                width: 176,
                height: 320,
                marginBottom: lift,
                padding: 18,
                borderRadius: 32,
                background: field,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Satori solo entiende <img> */}
              <img
                src={artworkUrl(id)}
                width={250}
                height={250}
                alt=""
                style={{ position: "absolute", top: -92, left: -37 }}
              />
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: WHITE,
                  fontSize: 26,
                  fontWeight: 900,
                }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Nunito", data: black, weight: 900, style: "normal" },
        { name: "Nunito", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
