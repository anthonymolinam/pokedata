export const ROUTE_MAP: Record<string, Record<string, string>> = {
  es: {
    "tabla-de-tipos": "types",
  },
  en: {
    "type-chart": "types",
  },
};

export const REVERSE_ROUTE_MAP: Record<string, Record<string, string>> = {
  es: {
    types: "tabla-de-tipos",
  },
  en: {
    types: "type-chart",
  },
};

export function getLocalizedPath(locale: string, internalPath: string): string {
  const cleanPath = internalPath.replace(/^\//, "");
  const localizedSlug = REVERSE_ROUTE_MAP[locale]?.[cleanPath] || cleanPath;
  return `/${locale}/${localizedSlug}`;
}
