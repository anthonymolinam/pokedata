// Tema claro, oscuro o automático (DESIGN.md §2.4). La preferencia vive en
// localStorage; sin clave, el modo es automático y manda prefers-color-scheme.
export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "pokedata-theme";

// --ground de cada tema: es el color de la barra del navegador
export const THEME_COLORS = { light: "#F3F4F8", dark: "#14161D" } as const;

// Script de arranque: corre en el <head> antes del primer pintado. Pone en
// <html> data-theme solo si el tema está forzado (en automático manda el CSS)
// y data-theme-pref siempre, que es lo que marca el segmento activo del
// selector. Con el tema forzado añade un theme-color sin media al principio
// del <head>: el navegador usa el primero que encaja, así que gana a los dos
// con media del modo automático. Si el almacenamiento falla (navegación
// privada, bloqueado), se queda en automático.
export const themeScript = `(function(){var d=document.documentElement,p="system";try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark"){p=t;d.setAttribute("data-theme",t);var m=document.createElement("meta");m.name="theme-color";m.content=${JSON.stringify(THEME_COLORS)}[t];m.setAttribute("data-theme-color","");document.head.prepend(m)}}catch(e){}d.setAttribute("data-theme-pref",p)})()`;

const THEME_EVENT = "pokedata-theme";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

// La preferencia que el script de arranque dejó en <html>
export function readThemePreference(): ThemePreference {
  const pref = document.documentElement.getAttribute("data-theme-pref");
  return isThemePreference(pref) ? pref : "system";
}

// Aplica el tema en <html> y en la barra del navegador, igual que el script de
// arranque. Con persist, además lo guarda (o borra la clave en automático).
export function applyTheme(pref: ThemePreference, { persist = true } = {}) {
  const root = document.documentElement;
  if (persist) {
    try {
      if (pref === "system") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      // Sin almacenamiento el tema vale para esta visita y no se recuerda
    }
  }
  document.head.querySelector("meta[data-theme-color]")?.remove();
  if (pref === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", pref);
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = THEME_COLORS[pref];
    meta.setAttribute("data-theme-color", "");
    document.head.prepend(meta);
  }
  root.setAttribute("data-theme-pref", pref);
  window.dispatchEvent(new Event(THEME_EVENT));
}

// Para useSyncExternalStore: cambios desde esta pestaña (applyTheme) y desde
// otras (evento storage, que aplica el tema sin volver a guardarlo)
export function subscribeToTheme(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY && e.key !== null) return;
    applyTheme(isThemePreference(e.newValue) ? e.newValue : "system", { persist: false });
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
