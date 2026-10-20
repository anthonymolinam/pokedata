import type { TeamMember } from "@/lib/team";
import { Locale } from "@/proxy";

// Datos de los miembros ya pedidos a /api/team, por idioma y slug: reordenar,
// quitar o volver a añadir no pide nada otra vez. null es un slug que PokéAPI
// no conoce. La comparten la fila del equipo y el selector, que deja cargada
// la forma elegida antes de añadirla.
const memberCache = new Map<string, TeamMember | null>();
const cacheKey = (locale: Locale, slug: string) => `${locale}:${slug}`;

// undefined: todavía no se ha pedido
export function getCachedMember(locale: Locale, slug: string): TeamMember | null | undefined {
  return memberCache.get(cacheKey(locale, slug));
}

// Pide los que faltan y devuelve, para cada slug pedido, el miembro o null si
// PokéAPI no lo conoce. Lanza si la API falla, para no tomar por desconocido
// a un Pokémon que existe.
export async function loadTeamMembers(
  slugs: string[],
  locale: Locale,
  signal?: AbortSignal,
): Promise<Map<string, TeamMember | null>> {
  const missing = [...new Set(slugs)].filter((s) => !memberCache.has(cacheKey(locale, s)));
  if (missing.length > 0) {
    const params = new URLSearchParams({ slugs: missing.join(","), locale });
    const res = await fetch(`/api/team?${params}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { members }: { members: (TeamMember | null)[] } = await res.json();
    missing.forEach((slug, i) => {
      const member = members[i] ?? null;
      memberCache.set(cacheKey(locale, slug), member);
      // La forma por defecto vuelve como la especie: se guarda con los dos
      if (member) memberCache.set(cacheKey(locale, member.slug), member);
    });
  }
  return new Map(slugs.map((s) => [s, memberCache.get(cacheKey(locale, s)) ?? null]));
}
