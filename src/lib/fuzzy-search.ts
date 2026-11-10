// Búsqueda con tolerancia a erratas. Sin dependencias, para el servidor
// (searchPokemonMatches) y para las pruebas.
//
// Orden: primero los nombres que empiezan por lo escrito, luego los que lo
// contienen (los dos por número). Solo si no hay ninguno se aceptan erratas,
// ordenadas de más a menos parecido: así una búsqueda que ya funciona no se
// llena de parecidos.

export interface SearchEntry {
  id: number;
  // Nombre canónico (PokéAPI)
  name: string;
  // Todos los nombres por los que se puede buscar, ya normalizados: el
  // canónico y los alias en español
  names: string[];
}

// Erratas aceptadas según el largo de lo escrito: con 1–3 letras ninguna
// (todo se parece a todo), con 4–6 una y desde 7 dos
export function allowedTypos(length: number): number {
  if (length < 4) return 0;
  if (length < 7) return 1;
  return 2;
}

// Para comparar con erratas, sin espacios ni guiones: «mr mime» y «mr-mime»
// son lo mismo
const compact = (text: string) => text.replace(/[\s-]+/g, "");

// Distancia de edición entre lo escrito y el principio de `name` que más se
// le parezca, con el intercambio de dos letras vecinas como un solo error
// (Damerau-Levenshtein restringida). Compara con el principio porque se busca
// mientras se escribe: «pikak» ya debe encontrar «pikachu». Devuelve max + 1
// en cuanto sabe que se pasa de `max`.
export function prefixDistance(query: string, name: string, max: number): number {
  const m = query.length;
  const n = name.length;
  if (m === 0) return 0;
  if (n < m - max) return max + 1;

  // Tres filas: la de dos atrás hace falta para los intercambios
  let prev2: number[] = [];
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = query[i - 1] === name[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && query[i - 1] === name[j - 2] && query[i - 2] === name[j - 1]) {
        d = Math.min(d, prev2[j - 2] + 1);
      }
      row.push(d);
      if (d < rowMin) rowMin = d;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = row;
  }
  // El mejor principio de cualquier largo: la última fila entera
  return Math.min(...prev);
}

// Los resultados de una búsqueda ya normalizada (minúsculas, sin acentos)
export function rankSearch(query: string, entries: readonly SearchEntry[]): SearchEntry[] {
  if (!query) return [];

  const starts: SearchEntry[] = [];
  const contains: SearchEntry[] = [];
  for (const entry of entries) {
    if (entry.names.some((n) => n.startsWith(query))) starts.push(entry);
    else if (entry.names.some((n) => n.includes(query))) contains.push(entry);
  }
  const byId = (a: SearchEntry, b: SearchEntry) => a.id - b.id;
  if (starts.length + contains.length > 0) {
    return [...starts.sort(byId), ...contains.sort(byId)];
  }

  const q = compact(query);
  const max = allowedTypos(q.length);
  if (max === 0) return [];
  const scored: { entry: SearchEntry; d: number }[] = [];
  for (const entry of entries) {
    let best = max + 1;
    for (const name of entry.names) best = Math.min(best, prefixDistance(q, compact(name), max));
    if (best <= max) scored.push({ entry, d: best });
  }
  return scored.sort((a, b) => a.d - b.d || a.entry.id - b.entry.id).map((s) => s.entry);
}

// Las entradas a partir del índice de especies y de los alias en español
// (alias normalizado → nombre canónico)
export function buildSearchEntries(
  index: readonly { id: number; name: string }[],
  aliases: Readonly<Record<string, string>>,
  normalize: (text: string) => string,
): SearchEntry[] {
  const byCanonical = new Map<string, string[]>();
  for (const [alias, canonical] of Object.entries(aliases)) {
    const list = byCanonical.get(canonical) ?? [];
    list.push(normalize(alias));
    byCanonical.set(canonical, list);
  }
  return index.map(({ id, name }) => {
    const own = normalize(name);
    return { id, name, names: [own, ...(byCanonical.get(own) ?? [])] };
  });
}
