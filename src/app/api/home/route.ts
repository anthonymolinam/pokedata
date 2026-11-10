import { NextResponse } from "next/server";
import {
  HOME_PAGE_SIZE,
  countResults,
  getFilteredPage,
  parseBrowserFavoritesQuery,
} from "@/lib/home-query";

// Modo navegador de favoritos (DESIGN.md §4.10): cuando la cookie no llega al
// servidor, la portada pide aquí la rejilla y el recuento con la lista en
// ?fav=. Es la misma consulta que la portada con la cookie.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseBrowserFavoritesQuery(searchParams);
  if (!query) {
    return NextResponse.json({ error: "invalid fav" }, { status: 400 });
  }
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [result, count] = await Promise.all([
    getFilteredPage(query, page, HOME_PAGE_SIZE),
    countResults(query),
  ]);

  return NextResponse.json({
    pokemon: result?.pokemon ?? [],
    totalPages: result?.totalPages ?? 1,
    count,
  });
}
