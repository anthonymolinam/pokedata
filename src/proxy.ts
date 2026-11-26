import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTE_MAP, REVERSE_ROUTE_MAP } from "@/constants/routes";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

// Dominio único de producción (el mismo de SITE_URL en src/lib/metadata.ts)
const CANONICAL_HOST = "pokedata.app";

function detectLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language") || "";
  return acceptLanguage.toLowerCase().includes("es") ? "es" : defaultLocale;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Un solo dominio: *.vercel.app y www.pokedata.app van a pokedata.app con
  // 301, con la misma ruta y query. Las vistas previas (VERCEL_ENV=preview) y
  // el desarrollo local se quedan donde están
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  const isPreview = process.env.VERCEL_ENV === "preview";
  const wrongHost =
    !isPreview && (host === `www.${CANONICAL_HOST}` || host.endsWith(".vercel.app"));
  if (wrongHost) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
    // Sin idioma en la ruta, se resuelve aquí mismo para no encadenar dos saltos
    const first = pathname.split("/").filter(Boolean)[0];
    const skip = pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".");
    if (!skip && !locales.includes(first as Locale)) {
      target.pathname = `/${detectLocale(request)}${pathname}`;
    }
    return NextResponse.redirect(target, 301);
  }

  // 1. Ignorar llamadas internas de Next.js, API, recursos estáticos, imágenes y favicon
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] as Locale;
  const pathnameHasLocale = locales.includes(firstSegment);

  // 2. Si no incluye /es o /en al inicio, redirigir detectando el idioma del navegador
  if (!pathnameHasLocale) {
    const res = NextResponse.redirect(
      new URL(`/${detectLocale(request)}${pathname}`, request.url),
      301,
    );
    res.headers.set("Vary", "Accept-Language");
    return res;
  }

  const currentLocale = firstSegment;
  const currentSlug = segments[1];

  // 3. Si entran a la ruta técnica interna (ej. /es/types), redirigir con URL canónica traducida (/es/tabla-de-tipos)
  if (currentSlug && REVERSE_ROUTE_MAP[currentLocale]?.[currentSlug]) {
    const localizedSlug = REVERSE_ROUTE_MAP[currentLocale][currentSlug];

    // Evitar bucle infinito si la ruta canónica tiene el mismo nombre que la interna
    if (localizedSlug !== currentSlug) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/${localizedSlug}${request.nextUrl.search}`, request.url),
        301,
      );
    }
  }

  // 4. Si entran a la URL traducida (ej. /es/tabla-de-tipos), reescribir internamente a la carpeta física (/es/types)
  if (currentSlug && ROUTE_MAP[currentLocale]?.[currentSlug]) {
    const internalFolder = ROUTE_MAP[currentLocale][currentSlug];

    // Evitar rewrite innecesario si ya coincide
    if (internalFolder !== currentSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/${internalFolder}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
