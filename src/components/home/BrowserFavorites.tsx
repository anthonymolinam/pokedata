"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { PokemonSummary } from "@/lib/pokeapi";
import {
  encodeFavoritesCookie,
  getFavoritesCookieOk,
  getFavoritesSnapshot,
  subscribeToFavorites,
} from "@/lib/favorites";
import PokemonGrid from "@/components/home/PokemonGrid";
import { PokemonGridSkeleton } from "@/components/pokemon/PokemonCardSkeleton";
import { Locale } from "@/proxy";

// Modo navegador de favoritos (DESIGN.md §4.10). Con ?fav=1 el servidor filtra
// con la cookie; si no le llega válida, o el navegador comprueba al leerla de
// vuelta que no se guarda, la rejilla y el recuento se piden a /api/home con la
// lista en el parámetro. La URL visible sigue siendo ?fav=1.

interface BrowserResult {
  pokemon: PokemonSummary[];
  totalPages: number;
  count: number;
}

// Una petición por consulta, compartida por el recuento y la rejilla
const requests = new Map<string, Promise<BrowserResult>>();

function fetchResult(url: string): Promise<BrowserResult> {
  let request = requests.get(url);
  if (!request) {
    if (requests.size > 20) requests.clear();
    request = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`/api/home ${res.status}`);
      return res.json() as Promise<BrowserResult>;
    });
    request.catch(() => requests.delete(url));
    requests.set(url, request);
  }
  return request;
}

// Si el resultado lo calcula el navegador. Antes de hidratar coincide con lo
// que pintó el servidor: sin cookie válida, las tarjetas fantasma.
function useBrowserMode(serverHasFavorites: boolean): boolean {
  return useSyncExternalStore(
    subscribeToFavorites,
    () => !serverHasFavorites || getFavoritesCookieOk() === false,
    () => !serverHasFavorites,
  );
}

// El resultado para la URL actual, o null mientras llega. La lista de
// favoritos se toma al cambiar la consulta y no con cada corazón: desmarcar en
// la vista deja la tarjeta en su sitio hasta la próxima navegación.
function useBrowserResult(enabled: boolean) {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const key = ["types", "gen", "q"]
    .map((name) => `${name}=${encodeURIComponent(searchParams.get(name) ?? "")}`)
    .concat(`page=${page}`)
    .join("&");
  const [result, setResult] = useState<{ key: string; data: BrowserResult } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const fav = encodeFavoritesCookie(getFavoritesSnapshot());
    fetchResult(`/api/home?fav=${fav}&${key}`)
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      })
      // Sin respuesta se quedan las tarjetas fantasma: nunca un vacío falso
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled, key]);

  return { page, searchParams, data: result?.key === key ? result.data : null };
}

export function BrowserFavoritesCount({
  serverHasFavorites,
  children,
}: {
  serverHasFavorites: boolean;
  children: ReactNode;
}) {
  const browser = useBrowserMode(serverHasFavorites);
  const { data } = useBrowserResult(browser);
  if (!browser) return children;
  if (!data) return <span className="invisible">1025 Pokémon</span>;
  return <>{data.count} Pokémon</>;
}

export function BrowserFavoritesGrid({
  serverHasFavorites,
  locale,
  children,
}: {
  serverHasFavorites: boolean;
  locale: Locale;
  children: ReactNode;
}) {
  const browser = useBrowserMode(serverHasFavorites);
  const { data, page, searchParams } = useBrowserResult(browser);
  if (!browser) return children;
  if (!data) return <PokemonGridSkeleton />;

  // Los mismos enlaces que en el servidor: ?fav=1, nunca la lista
  const pageUrl = (n: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(n));
    return `/${locale}?${params.toString()}#pokedex`;
  };

  return (
    <PokemonGrid
      initialList={data.pokemon}
      currentPage={page}
      totalPages={data.totalPages}
      prevPageHref={page > 1 ? pageUrl(page - 1) : undefined}
      nextPageHref={page < data.totalPages ? pageUrl(page + 1) : undefined}
      locale={locale}
    />
  );
}
