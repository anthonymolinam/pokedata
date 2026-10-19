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
