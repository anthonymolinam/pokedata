import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTE_MAP, REVERSE_ROUTE_MAP } from "@/constants/routes";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    const acceptLanguage = request.headers.get("accept-language") || "";
    const preferredLocale: Locale = acceptLanguage.toLowerCase().includes("es")
      ? "es"
      : defaultLocale;

    return NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url),
    );
  }

  const currentLocale = firstSegment;
  const currentSlug = segments[1];

  // 3. Si entran a la ruta técnica interna (ej. /es/types), redirigir con URL canónica traducida (/es/tabla-de-tipos)
  if (currentSlug && REVERSE_ROUTE_MAP[currentLocale]?.[currentSlug]) {
    const localizedSlug = REVERSE_ROUTE_MAP[currentLocale][currentSlug];
    return NextResponse.redirect(
      new URL(`/${currentLocale}/${localizedSlug}`, request.url),
    );
  }

  // 4. Si entran a la URL traducida (ej. /es/tabla-de-tipos), reescribir internamente a la carpeta física (/es/types)
  if (currentSlug && ROUTE_MAP[currentLocale]?.[currentSlug]) {
    const internalFolder = ROUTE_MAP[currentLocale][currentSlug];
    const url = request.nextUrl.clone();
    url.pathname = `/${currentLocale}/${internalFolder}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
