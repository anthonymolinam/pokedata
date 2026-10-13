export const ROUTE_MAP: Record<string, Record<string, string>> = {
  es: {
    "tabla-de-tipos": "types",
    comparador: "compare",
  },
  en: {
    "type-chart": "types",
    compare: "compare",
  },
};

export const REVERSE_ROUTE_MAP: Record<string, Record<string, string>> = {
  es: {
    types: "tabla-de-tipos",
    compare: "comparador",
  },
  en: {
    types: "type-chart",
    compare: "compare",
  },
};

export function getLocalizedPath(locale: string, internalPath: string): string {
  const cleanPath = internalPath.replace(/^\//, "");
  const localizedSlug = REVERSE_ROUTE_MAP[locale]?.[cleanPath] || cleanPath;
  return `/${locale}/${localizedSlug}`;
}
