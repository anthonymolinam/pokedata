# DESIGN.md: dirección «Pop»

Este documento es la referencia visual de PokéData. Si el código y este documento discrepan, manda este documento, o se actualiza antes.

**Origen:** la maqueta «Pop» (`mockups/pop.html`, referencia local que no se versiona), elegida entre tres exploraciones. Sustituye por completo a la dirección anterior («capítulos de color» con índice en filas, Chivo y esquinas rectas). Se conservan los 18 colores de tipo y sus variantes de contraste (§2.2).

**Nombre:** la app se llama **PokéData**, con la «D» mayúscula y tilde en la «é». Ese nombre va en el logo, en el pie, en los títulos de página y en los metadatos. La maqueta pone «Pokédex» en el logo, y eso no se copia. «Pokédex» solo se usa para nombrar la sección del listado (el enlace «Pokédex» de la navegación y el título «Pokédex Nacional»).

---

## 1. La idea

> En PokéData, **el color de cada tipo** se convierte en **la tarjeta de la que sale cada Pokémon**.

- Cada Pokémon vive dentro de un campo de color del tipo que le corresponde, y su artwork oficial se sale de ese campo por arriba. El artwork manda desde la primera pantalla.
- El tono es el de una app moderna y alegre: fondo claro u oscuro (§2.4), campos de color planos, esquinas redondeadas, letra redonda y gruesa y movimientos con un pequeño rebote.
- **Los dos temas comparten los campos de tipo.** En oscuro cambia lo que rodea a las tarjetas, no las tarjetas: los 18 colores se ven igual de vivos y llevan la misma tinta.
- El color nunca es decoración: el verde es Planta en la tarjeta de Bulbasaur, en el filtro, en la etiqueta y en su ficha.

**Elemento vivo:** el **Pokémon del día** (§4.2). Son tres Pokémon que cambian cada día, iguales para todos y siempre de tipos distintos, y un dado para barajar otros tres.

---

## 2. Color

### 2.1 Tokens globales

Cada token tiene un valor por tema. El código usa siempre el token, nunca el valor, así que cambiar de tema es cambiar estas variables y nada más.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `--ground` | `#F3F4F8` | `#14161D` | Fondo de todas las páginas |
| `--surface` | `#FFFFFF` | `#1D2029` | Paneles: hero, buscador, panel de filtros, bloques de la ficha, chips sin color |
| `--step` | `#E6E8EF` | `#282C37` | Un tono por debajo del fondo en claro y por encima en oscuro: buscador enfocado, pista de controles segmentados, hover de enlaces |
| `--raised` | `#FFFFFF` | `#262A35` | Capas flotantes: desplegable del buscador, hoja móvil, modales |
| `--raised-step` | `#E6E8EF` | `#363B48` | El `--step` dentro de una capa flotante (`data-field="raised"`): en oscuro `--step` casi coincide con `--raised` |
| `--control` | `#E6E8EF` | `#686C7A` | Relleno de las pastillas y botones neutros: regiones del filtro, formas del selector del equipo, «Limpiar», botones «×» de cerrar. En claro es el mismo que `--step`; en oscuro, un gris claro que se ve como botón (§2.4) |
| `--ink` | `#15161C` | `#EEF0F5` | Tinta principal, botón secundario, pastilla «Total», tooltips |
| `--ink-soft` | `#5C6070` | `#A3A8B8` | Solo texto secundario: subtítulos y notas. Nunca en texto principal |
| `--bone` | `#F7F5F0` | `#14161D` | Texto sobre un relleno en `--ink` (botón secundario, «Total», tooltip, nav activa) |
| `--footer` | `#15161C` | `#1D2029` | Campo del pie (§4.7) |
| `--ok` | `#3FB950` | `#3FB950` | Punto verde del SHA en el pie. Es una marca gráfica, nunca texto |
| `--accent` | `#CC2E0B` | `#CC2E0B` | Rojo Pokébola. Solo en la mitad superior del logo (3.4:1 sobre el fondo oscuro, suficiente para un gráfico). Si algún día vuelve una acción principal, texto blanco: 5.3:1 |

**Constantes que no cambian con el tema.** Todo lo que se pinta sobre un campo de tipo usa estas dos, no `--ink` ni `--bone`, porque el campo es el mismo en los dos temas:

| Constante | Valor | Uso |
| --- | --- | --- |
| `--on-light` | `#15161C` | Tinta sobre campos claros, contorno y banda de la Pokébola, base translúcida de la pastilla «Total» estrecha |
| `--on-dark` | `#F7F5F0` | Tinta sobre campos oscuros, mitad inferior de la Pokébola, texto del pie |
| `--on-dark-soft` | `#B9BCC8` | Texto secundario del pie (antes `--bone-soft`) |
| `--pokeball-white` | `#FFFFFF` | Mitad inferior y centro de la Pokébola del logo |

En oscuro, `--ink` y `--bone` intercambian su papel: la tinta es clara y los rellenos en tinta (botón secundario, «Total», navegación activa, tooltips, celdas ×2 de la tabla) pasan a ser pastillas claras con texto oscuro. Es intencionado: el elemento más fuerte de cada pantalla sigue siendo el de más contraste.

El acento rojo no se usa nunca para marcar estados ni selecciones; eso lo hace la tinta.

**Contraste de los tokens (WCAG 2.x).** Generada con `npm run check-contrast -- --md`; umbral 4.5:1, salvo el acento, que es un gráfico (3:1):

| Par | Claro | Oscuro |
| --- | --- | --- |
| `--ink` sobre `--ground` / `--surface` / `--step` / `--raised` / `--raised-step` | 16.42 / 18.05 / 14.74 / 18.05 / 14.74 | 15.84 / 14.26 / 12.23 / 12.57 / 9.81 |
| `--ink` sobre `--control` (pastillas y botones neutros) | 14.74 | 4.58 |
| `--control` sobre `--surface` / `--raised` (borde de la pastilla; en oscuro, 3:1 sobre los paneles) | 1.22 / 1.22 | 3.11 / 2.74 |
| `--ink-soft` sobre `--ground` / `--surface` / `--step` / `--raised` | 5.68 / 6.24 / 5.10 / 6.24 | 7.61 / 6.85 / 5.87 / 6.04 |
| `--bone` sobre `--ink` (botones, «Total», tooltips) | 16.56 | 15.84 |
| `--on-dark` / `--on-dark-soft` sobre `--footer` | 16.56 / 9.53 | 14.93 / 8.59 |
| `--accent` sobre `--ground` (mitad del logo, gráfico) | 4.82 | 3.40 |

### 2.2 Los 18 tipos

Se conservan los valores actuales de `src/constants/typeColors.ts`. Cada tipo tiene cuatro tokens:

- **`field`**: el color del tipo. Es el fondo de las tarjetas, de las columnas del Pokémon del día, de los bloques de tipo del panel de filtros y del escenario de la ficha.
- **`field-ink`**: tinta sobre ese campo, negra (`--on-light`) u hueso (`--on-dark`), la que dé más contraste. Nunca gris. Es una constante: no cambia con el tema.
- **`step`**: el campo oscurecido un 14 %. Es la superficie secundaria dentro del campo, por ejemplo una pista de barra o un bloque de evolución.
- **`deep`**: variante oscurecida para usar el color del tipo como texto o como marca sobre blanco (`--surface`).

| Tipo | `field` | `field-ink` | field/ink | `step` | `deep` | deep/blanco | deep/fondo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Normal | `#A8A77A` | ink | 7.28 | `#909069` | `#727253` | 4.94 | *4.49* |
| Fuego | `#EE8130` | ink | 6.72 | `#CD6F29` | `#A95C22` | 4.95 | 4.50 |
| Agua | `#6390F0` | ink | 5.82 | `#557CCE` | `#4C6FB9` | 4.90 | *4.46* |
| Eléctrico | `#F7D02C` | ink | 12.04 | `#D4B326` | `#836E17` | 4.99 | 4.54 |
| Planta | `#7AC74C` | ink | 8.68 | `#69AB41` | `#4C7B2F` | 5.02 | 4.56 |
| Hielo | `#96D9D6` | ink | 11.33 | `#81BBB8` | `#527776` | 4.93 | *4.48* |
| Lucha | `#C22E28` | bone | 5.18 | `#A72822` | `#C22E28` | 5.65 | 5.14 |
| Veneno | `#A33EA1` | bone | 5.12 | `#8C358A` | `#A33EA1` | 5.58 | 5.08 |
| Tierra | `#E2BF65` | ink | 10.20 | `#C2A457` | `#816D3A` | 5.02 | 4.56 |
| Volador | `#A98FF3` | ink | 6.79 | `#917BD1` | `#7664AA` | 5.03 | 4.57 |
| Psíquico | `#F95587` | ink | 5.73 | `#D64974` | `#C24269` | 4.90 | *4.46* |
| Bicho | `#A6B91A` | ink | 8.23 | `#8F9F16` | `#6A7611` | 4.98 | 4.53 |
| Roca | `#B6A136` | ink | 6.99 | `#9D8A2E` | `#7E6F25` | 5.01 | 4.56 |
| Fantasma | `#735797` | bone | 5.44 | `#634B82` | `#735797` | 5.93 | 5.39 |
| Dragón | `#6F35FC` | bone | 5.36 | `#5F2ED9` | `#6F35FC` | 5.84 | 5.32 |
| Siniestro | `#705746` | bone | 6.13 | `#604B3C` | `#705746` | 6.68 | 6.08 |
| Acero | `#B7B7CE` | ink | 9.17 | `#9D9DB1` | `#6E6E7C` | 5.01 | 4.56 |
| Hada | `#D685AD` | ink | 6.71 | `#B87295` | `#985E7B` | 4.97 | 4.52 |

Los contrastes están calculados con WCAG 2.x por `npm run check-contrast` (dos decimales hacia abajo, para que ninguna cifra prometa más de lo que hay). Las cifras en cursiva no llegan a 4.5:1, y de ahí sale la regla 1 del §2.3.

El código no usa `deep` directamente para texto: usa **`--type-*-text`**, que vale `deep` en claro y `glow` en oscuro (§2.4).

Los tokens viven en un único sitio: `typeColors.ts` y las variables `--type-*` de `globals.css`. Ningún otro fichero escribe a mano un color de tipo. Veneno, Fantasma y Dragón son violetas canónicos y llevan el comentario `taste-skill-ignore`.

### 2.3 Reglas de contraste

1. **El texto con color de tipo va en `--type-*-text` y sobre `--surface`.** En claro es `deep`, y sobre `--ground` Normal, Agua, Hielo y Psíquico bajan de 4.5:1, así que nunca hay texto de tipo apoyado directamente en el fondo. En oscuro (`glow`) pasa de 4.5:1 en los dos, pero la regla es la misma para no tener dos.
2. **Ningún texto se pinta con `field` sobre blanco o sobre el fondo.** Eléctrico, Hielo, Normal y Hada caen a entre 1.4 y 2.5:1.
3. **Todo bloque de color lleva su texto dentro, en su `field-ink`.** Eso incluye tarjetas, columnas del día, bloques del panel de filtros y chips activos. Así, un Eléctrico que apenas se distingue del fondo no pierde información.
4. **Las etiquetas de tipo dentro de un campo de color son pastillas de superficie:** en claro, blancas (`--surface` al 80 %) con texto en `--ink`, como en la maqueta; en oscuro, `--ground` al 80 % con texto en `--ink` (clara). Peor caso en oscuro: 9.84:1, sobre Eléctrico. La pastilla se pinta ya mezclada con el campo (`.type-tag`, con `--tag-base`), opaca: da los mismos píxeles que una base translúcida y así cualquier medidor ve el contraste real. No se pone un color claro sobre otro claro sin una tinta de por medio.
5. **Barras de estadísticas:** sobre `--surface`, relleno en `--type-*-text` y pista en `--step`. Sobre un campo de tipo, relleno en `field-ink` y pista en `step`.
6. **Jerarquía con tamaño y peso, no con opacidad.** Las únicas excepciones son decorativas, marcadas con `aria-hidden`: la marca de agua del número (§4.3) y el nombre gigante de la ficha (§4.4).
7. **Foco visible:** contorno de 3px en `--ink` separado 3px. Sobre un campo de tipo, el contorno va en su `field-ink`, en los dos temas.
8. **Un único estilo de selección en toda la web:** un borde de 3px en `--ink` (oscuro en claro, claro en oscuro), de un solo trazo y **dibujado por dentro** del elemento (`inset-ring`), así que no cambia su tamaño ni invade a los vecinos. Es la utilidad `ring-selected` de `globals.css` y nada más marca una selección: ni rellenos en tinta, ni anillos en `field-ink`, ni dobles trazos. Lo llevan los filtros (tipos y regiones), las cabeceras elegidas de la tabla de tipos, la etiqueta de la fila de riesgo de la Defensa, los buscadores enfocados (el del hero, el global y el del modal) y el resultado marcado con las flechas, la tarjeta de la cadena evolutiva en la que estás, la tarjeta marcada del selector y las formas activas (ficha, selector del equipo y menú «Cambiar forma»). **En una tarjeta, el artwork queda siempre por encima del borde:** el borde lo lleva la propia tarjeta (una sombra por dentro, que se pinta bajo sus hijos), nunca una capa que la cubra. En el selector, el botón transparente que tapa la tarjeta para recibir el clic no lleva el borde: iba por encima de todo y cruzaba el artwork que sobresale (la cabeza de Mudkip). Sobre los campos de tipo va igualmente en `--ink`; donde el contraste baja (oscuro sobre Eléctrico o Hielo) la selección no depende solo de él: los filtros llevan ✓ y la tabla tiñe la fila o columna. Fuera quedan la navegación y el selector de tema, que marcan dónde estás, no lo que eliges.

Antes de cerrar cada pantalla se hacen capturas de Pikachu (Eléctrico), Glaceon (Hielo), Snorlax (Normal), Sylveon (Hada) y Gengar (tinta hueso), **en los dos temas**. En oscuro se añade Umbreon (Siniestro, el único campo que cambia).

### 2.4 Tema oscuro

**Idea:** de noche, las tarjetas son lo que da la luz. El fondo es casi negro con un tinte azul apenas perceptible (`#14161D`: el azul va 9 puntos por encima del rojo), para que no se sienta plano ni gris de pantalla apagada; los campos de tipo se quedan exactamente como en claro.

**Tres modos:** claro, oscuro y automático según el sistema (por defecto). El selector está en la cabecera (§4.1).

**Pastillas y botones neutros en oscuro (`--control`).** Con `--step` (`#282C37`) las regiones del filtro casi no se distinguían del panel (1.2:1) y en la hoja móvil, sobre `--raised`, coincidían con él: se leía el texto pero no se veía el botón. En oscuro van en `#686C7A`: 3.1:1 sobre `--surface` (WCAG 1.4.11) y 2.7:1 sobre `--raised`, con la tinta encima a 4.6:1. Más claro no se puede sin que la tinta baje de 4.5:1. La selección sigue destacando: el borde en `--ink` contrasta 4.6:1 con la pastilla y en los filtros va con ✓.
- Lo usan las regiones (panel y hoja móvil), «Limpiar», los «×» de cerrar (filtros, búsqueda y menú de la cabecera, modales del comparador) y las pastillas de forma del selector del equipo (antes en `--raised` sobre la franja en `--raised-step`: en oscuro, más oscuras que la franja).
- Los botones redondos que van sobre el fondo de la página en `--surface` (búsqueda y «Menú» de la cabecera móvil, dado del Pokémon del día, dado y papelera del equipo, «×» del buscador) pasan a `--control` solo en oscuro, con la variante `dark:`: en claro el blanco ya se ve sobre `--ground`.
- No lo usan los botones desactivados (siguen en `--step`, que no deben parecer pulsables), ni las pistas de los controles segmentados, ni las pastillas sobre un campo de tipo (formas de la ficha y del comparador), que ya contrastan con el campo.

**Campos de tipo en oscuro.** Sobre `#14161D`, un campo necesita 3:1 con el fondo para que el borde de la tarjeta se vea (WCAG 1.4.11). Diecisiete tipos lo cumplen sin tocar nada. Solo **Siniestro** (2.70:1) se aclara un 5 %, a `field-dark` `#775F4F` (3.04:1), y su tinta hueso sigue en 5.45:1. Su `step` en oscuro es `#665244`.

**`glow`:** el tipo como texto o como marca sobre `--surface` y `--ground` oscuros (≥ 4.5:1 en los dos). Trece tipos usan su `field` tal cual; los cinco de tinta hueso se aclaran mezclándolos con blanco.

| Tipo | `field` en oscuro | campo/fondo | field/ink | `glow` | glow/superficie | glow/fondo |
| --- | --- | --- | --- | --- | --- | --- |
| Normal | `#A8A77A` | 7.29 | 7.28 | = field | 6.56 | 7.29 |
| Fuego | `#EE8130` | 6.72 | 6.72 | = field | 6.05 | 6.72 |
| Agua | `#6390F0` | 5.83 | 5.82 | = field | 5.25 | 5.83 |
| Eléctrico | `#F7D02C` | 12.05 | 12.04 | = field | 10.85 | 12.05 |
| Planta | `#7AC74C` | 8.69 | 8.68 | = field | 7.82 | 8.69 |
| Hielo | `#96D9D6` | 11.35 | 11.33 | = field | 10.22 | 11.35 |
| Lucha | `#C22E28` | 3.19 | 5.18 | `#D26662` | 4.50 | 5.00 |
| Veneno | `#A33EA1` | 3.23 | 5.12 | `#B96CB8` | 4.57 | 5.07 |
| Tierra | `#E2BF65` | 10.21 | 10.20 | = field | 9.19 | 10.21 |
| Volador | `#A98FF3` | 6.80 | 6.79 | = field | 6.12 | 6.80 |
| Psíquico | `#F95587` | 5.74 | 5.73 | = field | 5.17 | 5.74 |
| Bicho | `#A6B91A` | 8.23 | 8.23 | = field | 7.41 | 8.23 |
| Roca | `#B6A136` | 7.00 | 6.99 | = field | 6.30 | 7.00 |
| Fantasma | `#735797` | 3.04 | 5.44 | `#937EAF` | 4.52 | 5.02 |
| Dragón | `#6F35FC` | 3.08 | 5.36 | `#966CFD` | 4.53 | 5.04 |
| Siniestro | **`#775F4F`** | 3.04 | 5.45 | `#978478` | 4.56 | 5.06 |
| Acero | `#B7B7CE` | 9.18 | 9.17 | = field | 8.27 | 9.18 |
| Hada | `#D685AD` | 6.72 | 6.71 | = field | 6.05 | 6.72 |

Cada `glow` se obtuvo mezclando el campo con blanco en pasos del 1 % hasta llegar al umbral. Las cifras de la tabla las genera `npm run check-contrast`; si se toca un token, se vuelve a ejecutar y se pega su salida.

**Lo que cambia en oscuro y nada más.** Casi todo sale de los tokens; lo poco que no, usa la variante `dark:` de Tailwind (definida en `globals.css`), que cubre el tema forzado y el automático:
- **Brillo de hover de las tarjetas** (§4.3): mismo alcance, más intensidad. Sobre fondo oscuro el color de tipo luce de verdad, y se aprovecha: dos capas en lugar de una.
- **Sombras:** las de claro no se ven sobre `#14161D`. La cabecera al desplazar usa `0 6px 20px rgba(0,0,0,.45)` y las capas flotantes van en `--raised` con `0 16px 40px rgba(0,0,0,.55)`. La separación la da sobre todo el escalón de tono.
- **Pokébola del logo:** contorno, banda y botón en `--on-light`, mitad inferior y centro en `--pokeball-white`, mitad superior en `--accent`. Con colores fijos el logo es el mismo en los dos temas; sobre el fondo oscuro la silueta la dibujan el rojo y el blanco (18.07:1).
- **Tabla de tipos:** la fila o columna seleccionada se tiñe con su `field` mezclado con `--surface` (en claro, que es blanco, queda igual que ahora). La proporción es `--cross-mix`: 35 % en claro y 80 % en oscuro, porque al 35 % sobre la superficie oscura el campo se ensucia (el naranja de Fuego sale marrón). La guía de hover usa `--ink` al 5 %, que en oscuro aclara.
- **Velo bajo modales y hojas:** `--on-light` al 40 % en los dos temas. Con `--ink` se volvería un velo claro en oscuro.
- **Pastilla «Total» estrecha:** base `--on-light` al 15 % en los dos temas, con texto en `field-ink`. Con `--ink` se aclararía en oscuro y bajaría el contraste de la tinta hueso.
- **Controles nativos y barras de scroll:** `color-scheme: light` o `dark` en `:root`, según el tema activo.
- **Barra del navegador:** `<meta name="theme-color">` con `--ground` de cada tema (`#F3F4F8` / `#14161D`), con `media` para el modo automático; si el tema está forzado, el script de arranque antepone otro `theme-color` sin `media`, que gana porque el navegador usa el primero que encaja.

**Carga sin parpadeo** (guía de Next 16: `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`, apartado «Themes»):
- La preferencia vive en `localStorage` con la clave `pokedata-theme` (`light` o `dark`). Si no existe, el modo es automático. No se usa cookie: obligaría a renderizar en dinámico las páginas que hoy son estáticas.
- Un `<script>` inline en el `<head>` del layout raíz, antes de cualquier hoja de estilo que pinte, lee la clave y pone en `<html>`:
  - `data-theme="light"` o `"dark"` solo si el tema está forzado; en automático no pone nada y manda `prefers-color-scheme`.
  - `data-theme-pref="light" | "dark" | "system"`, que es lo que marca el segmento activo del selector **por CSS**, ya correcto en el primer pintado y sin esperar a la hidratación.
- El script va envuelto en `try/catch` (navegación privada, almacenamiento bloqueado): si falla, el modo es automático. `<html>` lleva `suppressHydrationWarning`. El `<script>` se pinta con `InlineScript`, que en el cliente lo marca `text/plain`: React no avisa de un script que no ejecutaría (guía «Preventing Flash» de Next).
- **CSS:** los valores claros en `:root`; los oscuros en `:root[data-theme="dark"]` y en `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`. En automático, si el sistema cambia de tema con la página abierta, la página cambia sola.
- **El cambio es instantáneo**, sin fundido. Como solo se animan `transform` y `opacity` (§6), ningún color se queda a medio camino.
- Otras pestañas abiertas se enteran con el evento `storage` y cambian también.

---

## 3. Tipografía: Nunito

Una sola familia: **Nunito**, cargada con `next/font/local` desde `src/app/fonts/` (licencia OFL): un woff2 estático por peso (600, 700, 800 y 900), con los caracteres de `latin` y `latin-ext`. No se usa `next/font/google`, que falla al compilar en Vercel. Sustituye a Chivo.

| Papel | Peso | Ajustes |
| --- | --- | --- |
| Display (titular del hero, nombre en la ficha, pie) | 900 | Tracking −0.04em · interlineado 0.95 |
| Títulos de sección y nombre en la tarjeta | 900 | Tracking −0.03em · interlineado 1.05 |
| Texto | 600 | Interlineado 1.45 |
| Controles: botones, chips, etiquetas, navegación | 800 | Sentence case («Fuego», no «FUEGO») |

**Cinco tamaños**, todos en tokens:

```
--step-small: 0.875rem                                  /* 14px: etiquetas, chips, notas */
--step-body:  clamp(1rem, 0.95rem + 0.25vw, 1.1875rem)  /* 16–19px: texto, subtítulos */
--step-lead:  clamp(1.1875rem, 1rem + 0.6vw, 1.625rem)  /* 19–26px: nombre en tarjeta */
--step-head:  clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)    /* 28–40px: títulos de sección */
--step-hero:  clamp(2.5rem, 1.6rem + 3.4vw, 4.5rem)     /* 40–72px: titular, nombre en ficha */
```

Las dos piezas decorativas (la marca de agua del número y el nombre gigante de la ficha) no cuentan como tamaños de texto. Van en Nunito 900 y con `aria-hidden`: el nombre gigante en unidades de contenedor y la marca de agua al tamaño del nombre de la tarjeta.

- Números y totales en Nunito con `font-variant-numeric: tabular-nums`. No hay letra monoespaciada en ningún sitio.
- **Ningún título pasa de dos líneas.** El nombre de la tarjeta y su número ocupan una sola línea: si no caben, el tamaño baja con `min(var(--step-lead), calc(100cqi / ((chars + 4) * 0.6 + 0.5)))` hasta un mínimo de 16px.
- Las formas («Urshifu Estilo Fluido») se escriben como nombre más la forma aparte, no concatenadas. En la ficha y el comparador la forma va **en la línea del número** («N.º 0212 · Mega»), en una línea y recortada con «…» si no cabe (el nombre completo va en `title`), para que el escenario mida lo mismo con cualquier forma. El número es siempre **el de la especie**, también en una forma (Rotom Lavado es el 0479, no el 10009 de PokéAPI).
- **Nombres de forma traducidos, con su nombre oficial.** Una sola tabla, `src/constants/formNames.ts`, da a cada forma su etiqueta en inglés y su nombre oficial en español (Rotom: Calor, Lavado, Frío, Ventilador, Corte; Necrozma: Melena Crepuscular, Alas del Alba; Pikachu: Roquera, Gorra Trotamundos…). Va por el sufijo del slug («rotom-wash» → «wash») o por el slug entero cuando el sufijo solo no basta («necrozma-dusk» no es la «Forma Crepuscular» de `lycanroc-dusk`). Los nombres salen de los `form_names` de PokéAPI y, donde faltan, de los juegos. La usan la ficha, el comparador (pastillas, línea del número y título de la página: «Comparar Rotom (Lavado) vs …»), el equipo (ficha del campo y menú «Cambiar forma»), el selector del equipo y su tarjeta. Una forma nueva que no esté en la tabla sale en inglés a partir del slug; `src/lib/pokemon-names.test.ts` comprueba que cada etiqueta inglesa tenga un solo nombre en español.
- Todo va alineado a la izquierda. Solo se centra el estado vacío.

---

## 4. Pantallas

### 4.0 Comunes

- **Márgenes laterales:** 20px en móvil y 32px en escritorio. Ancho máximo de 1280px.
- **Esquinas, decididas una vez:**
  - Superficies (tarjetas, paneles, columnas): 28px en escritorio y 22px en móvil.
  - Controles (botones, chips, buscador, etiquetas): pastilla completa (`999px`).
- **Sombras permitidas:** la cabecera cuando la página se ha desplazado, las capas flotantes (desplegable del buscador, hoja móvil de filtros, modales, tooltips) y el brillo de las tarjetas en hover (§4.3). Nada más lleva sombra en reposo. Los valores oscuros están en §2.4.
- **«Blanco» quiere decir `--surface`** (o `--raised` en lo que flota). Donde este documento dice «panel blanco» o «pastilla blanca», en oscuro es la superficie oscura. Ningún componente escribe `#FFF` ni `bg-white`.
- **Sin degradados.** La Pokébola del logo es un SVG de formas planas.
- **Botones:** no hay botón principal en rojo; la búsqueda es automática y no lo necesita.
  - Secundario: relleno `--ink` con texto hueso.
  - Terciario: relleno `--surface` con texto en tinta.
  - Pulsación con `scale(0.96)` y hover con un pequeño rebote.
- **Área táctil mínima** de 44px en todo.
- **Cursor de mano** en todo lo que se pulsa: botones, enlaces, opciones y pastillas (regla base de `globals.css`, porque Tailwind deja los botones con la flecha). Lo desactivado no la lleva.
- **Aviso flotante** (`Toast`): puede llevar tras el texto una acción subrayada, un enlace («Ver equipo») o un botón («Deshacer»). Pastilla en `--ink` con texto hueso, fija abajo y centrada (28px del borde), con sombra de capa flotante, `role="status"`. Se pinta con un portal en `<body>`, fuera de cualquier contexto de apilado de la página (el escenario de la ficha es `isolate` y las tarjetas y el pie le pasaban por encima). Su `z-index` es 55: por encima del contenido y de la cabecera (50) y por debajo del menú móvil y la hoja de filtros (60); los diálogos van en la capa superior del navegador. Desaparece solo con un fundido tras su duración (1,6s; 2,5s el de la ficha; 5s si ofrece «Deshacer», para dar tiempo a pulsarlo). Mide lo que su texto (`w-max`) hasta el ancho de la pantalla menos los márgenes: centrado con `left: 50%`, sin ese ancho se partía en dos líneas a media pantalla. Si no cabe en una línea, « · Deshacer» baja entero, sin separar el punto de la acción. Cada aviso sustituye al anterior.
- **Sin scroll horizontal de página:** solo lo tienen contenedores concretos (la tabla de tipos, la cadena evolutiva). El `<main>` lleva `overflow-x: clip` como red de seguridad; `clip` no crea contenedor de scroll, así que no rompe los elementos fijos ni `sticky`. Un elemento absoluto dentro de un contenedor con scroll necesita un antepasado posicionado dentro de ese contenedor.

### 4.1 Cabecera (todas las páginas)

**Composición:** el logo (Pokébola + «PokéData», Nunito 900, 24px), la navegación («Pokédex», «Equipo», «Comparador», «Tipos» / «Pokédex», «Team», «Compare», «Types», en este orden también en la hoja móvil y en el pie), el buscador compacto, el selector de idioma y el selector de tema. Con cuatro enlaces, la cabecera se volvió a medir (20 de octubre de 2026): en español invadía 58px del margen a 768px y 45px a 1024px, y bajar las pastillas a 10px no bastaba. Para no quitar nada:
  - **768–1023px:** logo a su tamaño de móvil (20px, Pokébola de 28px), pastillas de navegación a 8px de relleno lateral y sin hueco entre ellas, 8px entre bloques y 6px dentro del grupo de la derecha. Quedan 12px libres en español.
  - **1024–1279px:** pastillas a 12px, 16px entre bloques y buscador compacto de 208px. Quedan 19px libres.
  - **Desde 1280px:** todo como antes (pastillas de 16px, 24px entre bloques, buscador de 240px).

- **Fija al hacer scroll** (`position: sticky; top: 0`) y con fondo `--ground` sólido, sin desenfoque ni transparencia.
- **Sombra solo con la página desplazada:** a partir de 4px de scroll aparece `0 6px 20px rgba(21,22,28,.08)` con un fundido de 200ms. En reposo arriba del todo no hay sombra.
- **Navegación:** pastillas de texto. La activa va rellena en `--ink` con texto hueso, como en la maqueta.
- **Selector de idioma:** un control segmentado con **ES** y **EN** visibles a la vez, sobre una pista `--step`. El idioma activo se rellena en `--surface` y el otro es un enlace a la misma página en ese idioma.
- **Selector de tema:** a la derecha del de idioma, con la misma pista `--step` y la misma altura, pero con iconos en vez de texto.
  - Tres segmentos redondos de 36px (44px de área táctil), en este orden: **sol** (claro), **luna** (oscuro) y **monitor** (según el sistema). Iconos de `lucide-react` (`Sun`, `Moon`, `Monitor`) a 18px y trazo 2.25, para que pesen como Nunito 800.
  - El activo se rellena en `--surface` con el icono en `--ink`; los otros, icono en `--ink-soft` (5.88:1 sobre la pista en oscuro). El segmento activo lo marca el CSS a partir de `data-theme-pref` (§2.4), así que es correcto desde el primer pintado.
  - **Tooltip** con el nombre: «Claro», «Oscuro», «Según el sistema» / «Light», «Dark», «Match system». Mismo globo que el de la tabla de tipos (§4.5): `--ink` con texto `--bone`, `--step-small` en 800, radio de 8px, sombra y fundido de 120ms. Se abre **debajo** del segmento (la cabecera está arriba del todo), con el puntero y también con el foco del teclado, y Esc lo cierra.
  - Semántica: `role="radiogroup"` con la etiqueta «Tema» / «Theme», y cada segmento un `role="radio"` con `aria-checked` y su nombre accesible (el del tooltip). Las flechas mueven la selección, como en cualquier grupo de radios.
  - Pulsar un segmento aplica el tema al momento y lo guarda; pulsar «Según el sistema» borra la clave.
- **Buscador global (Ctrl K / ⌘K):**
  - En reposo es una pastilla compacta de 40px de alto y unos 240px de ancho, con el texto «Buscar» y la pista del atajo a la derecha.
  - El atajo muestra «Ctrl K», o «⌘K» en Mac, y va como texto en `--ink-soft`, no en una caja con borde.
  - Enfocada, lleva el borde de selección por dentro (§2.3, regla 8), como el buscador del hero y el del modal. El resultado marcado con las flechas va en `--step` con ese mismo borde.
  - Al enfocarla, despliega los resultados en una capa flotante (blanca, radio 22px, con sombra).
  - **En la portada,** el buscador compacto está oculto mientras el buscador grande del hero está en pantalla. Cuando el del hero sale por arriba, el compacto aparece (opacidad y 8px de subida, 200ms).
  - Ctrl K funciona siempre: enfoca el buscador del hero si se ve; si no, el de la cabecera.
  - **Tableta (768–1023px):** el buscador compacto no cabe junto a los selectores de idioma y tema, así que la cabecera muestra solo la lupa de 44px, que abre el buscador a pantalla completa como en móvil, y Ctrl K abre ese mismo buscador. La separación entre bloques y el relleno de las pastillas son los de la composición, arriba.
- **Logo:** al pasar el ratón (o al enfocarlo), la Pokébola da una vuelta completa en 600ms con un ligero rebote. Con movimiento reducido no gira.
- **Móvil (< 768px):**
  - La cabecera mide 60px y muestra el logo, un botón de lupa que abre el buscador a pantalla completa, ES/EN y un botón «Menú».
  - «Menú» abre una hoja inferior con la navegación y, debajo, el **selector de tema**: el mismo control de tres segmentos, a todo el ancho de la hoja, con el icono **y su nombre visible** en cada segmento (en táctil no hay hover, así que no hay tooltip). «Según el sistema» no cabe en un tercio de la hoja a 360px, así que ahí se lee «Sistema» / «System»; el nombre accesible sigue siendo el completo, que lo contiene. Fuera de la hoja, la cabecera móvil no lo muestra.
  - El buscador del hero sigue siendo el principal en la portada.

### 4.2 Portada: hero compacto

**Presupuesto de altura:** a 1440×900 tiene que verse **al menos una fila completa de tarjetas** sin hacer scroll.

| Pieza | Escritorio | Móvil (390×844) |
| --- | --- | --- |
| Cabecera | 72px | 60px |
| Hero | ≤ 360px | ≤ 400px |
| Barra de filtros | 56px | 52px |
| Fila de tarjetas, con el artwork que sobresale | ≤ 340px | ≤ 260px |

**Escritorio:** dos columnas al 50/50 aproximadamente.
- **Izquierda:** panel blanco con:
  - El titular en `--step-hero`, en dos líneas como mucho **en los dos idiomas**: «¿A quién buscas hoy?» y «Who are you looking for?». Un titular más largo en inglés pasa a tres líneas y empuja la primera fila de tarjetas fuera de la pantalla.
  - Una frase de apoyo en `--step-body`.
  - El buscador grande: una pastilla de 60px (56px en móvil) **sin botón «Buscar»**, porque la búsqueda es automática.
  - Cuando hay texto escrito, a la derecha aparece un botón **×** redondo de 44px en `--surface` (`--control` en oscuro; etiqueta accesible «Borrar la búsqueda»). Vacía el campo y la búsqueda y devuelve el foco al campo. Sin texto no se muestra.
  - La búsqueda vive en la URL (`?q=`), junto a los filtros y dentro de ellos: al escribir se actualizan el recuento y la rejilla, e Intro lleva a los resultados. Sin JavaScript, Intro envía el formulario igual.
- **Derecha:** el bloque **Pokémon del día**:
  - Arriba, una línea con el título «Pokémon del día» (`--step-lead`, 900) y, a su derecha, el botón del dado. **No se muestra la fecha:** la semilla es la fecha UTC, y en Colombia por la noche aparecería ya el día siguiente.
  - Debajo, **tres columnas** de unos 280px de alto. Cada una se pinta en el `field` de su tipo principal y lleva el artwork, un rebote suave al pasar el ratón y abajo una pastilla blanca con el nombre y el número.
  - **El artwork se ve entero, nunca recortado:** usa la misma normalización de tamaño visual que las tarjetas (§4.3, `figureStyle` con `artwork-bounds.json`). La figura opaca mide el 86 % de la zona por encima de la pastilla, o el 86 % del ancho si el Pokémon es muy ancho (Grovyle, Musharna), y se apoya justo encima de la pastilla. Queda margen alrededor y el rebote del hover tampoco la corta.
  - Nunca se amplía por encima de su tamaño real (475px) y se pide con `sizes` de 475px en escritorio y calidad 90, para que se vea nítido.
  - **Cada columna es un enlace** (`<a>`) a la ficha de ese Pokémon. Toda la columna es clicable y el nombre accesible es «Ver ficha de Charizard».

**Móvil:** el panel del titular ocupa todo el ancho y las tres columnas quedan debajo, en una fila de 3 de 150px de alto. No hay scroll lateral. Para no pasar de 400px, por debajo de 640px se omite la frase de apoyo y el dado mide 44px. En las columnas, el número solo aparece si cabe junto al nombre.

**Reglas del Pokémon del día:**
- **Igual para todos:** la semilla es la fecha UTC (`AAAA-MM-DD`). Un generador determinista (hash de la fecha + `mulberry32`) recorre los Pokémon del 1 al 1025 (formas por defecto).
- **Siempre de tipos distintos:** un candidato solo entra si **ninguno** de sus tipos coincide con los de los ya elegidos. Charizard (Fuego/Volador) excluye a cualquier otro Pokémon de Fuego o de Volador.
- Se calcula en el servidor y se vuelve a generar a las 00:00 UTC, así que no hay desajuste de hidratación.
- **El dado:**
  - Es un botón redondo de 48px en `--surface` (`--control` en oscuro) con un dado dibujado en SVG y la etiqueta accesible «Barajar otros tres».
  - Al pulsarlo, el dado gira con rebote (500ms) y las tres columnas cambian con un fundido y un pequeño salto, escalonado 60ms.
  - Baraja en el cliente con la misma regla de tipos distintos. Necesita un índice ligero id → nombre y tipos (`src/data/pokemon-index.json`, generado con `npm run pokemon-index`), que el cliente descarga la primera vez que se usa el dado.
  - Tras barajar aparece un enlace de texto, «Volver a los de hoy», junto al título. **Solo el dado lo hace aparecer:** buscar o filtrar no cambia los Pokémon del día y no lo muestra.
  - Lo barajado no se guarda: al recargar vuelven los del día.

### 4.3 Portada: filtros y tarjetas

**Barra de filtros:** va bajo el hero, sin fondo propio.
- **Izquierda:** el título de la vista en `--step-head` («Pokédex Nacional», o la región si hay una activa) y el recuento («151 Pokémon») en `--step-body`, en tinta.
- **Derecha:** el botón **«Filtros»**, secundario en `--ink`.
  - Con filtros activos lleva un contador: un círculo blanco con el número en tinta («Filtros 3»).
  - Cuenta un filtro por cada tipo elegido más uno por la región.

**Panel de filtros:** oculto por defecto. Al abrirlo parte de los filtros aplicados; tocar tipos y regiones solo cambia esa selección, y nada se aplica hasta pulsar **«Aplicar»** («Apply» en inglés).
- **En escritorio (≥ 768px)** se despliega dentro de la página, a todo el ancho, justo debajo de la fila del título, y empuja los chips y las tarjetas hacia abajo. Es blanco, con radio 28px y 24px de relleno, sin sombra (está en la página, no flota). Todo se ve sin scroll interno: mide unos 355px de alto.
  - **Fila de cabecera:** «Región» a la izquierda y el botón «×» de cerrar a la derecha.
  - **Regiones:** las 9 (Kanto … Paldea) en una sola fila de pastillas compactas de 40px y ancho igual, con selección única (`?gen=`), en `--control` con texto en tinta.
  - **Tipos:** «Tipos» con la nota «Hasta dos» y los 18 tipos en dos filas de 9 pastillas compactas de 40px, cada una en su `field` con el nombre en `field-ink`. Se pueden elegir hasta dos (`?types=`), porque ningún Pokémon tiene más y el filtro es la intersección; al elegir un tercero sustituye al segundo.
  - **Selección, igual en tipos y regiones (también en la hoja móvil):** una marca ✓ delante del nombre y el borde único de selección (§2.3, regla 8), en `--ink` por dentro de la pastilla, también sobre las de tipo. No cambia el tamaño, no se sale de la pastilla ni toca a las vecinas, y no depende solo del color.
  - **Pie:** «Limpiar» y «Aplicar», alineados a la derecha bajo los tipos.
  - **Tableta (768–1023px):** las regiones pasan a dos filas (5 + 4) y los tipos a tres filas de 6.
  - Es una sección desplegable, no un diálogo: al abrir, el foco se queda en el botón «Filtros». Se cierra con el mismo botón, con «×» o con Esc, y lo no aplicado se descarta.
- **En móvil** es una hoja inferior a pantalla casi completa (un diálogo con el foco dentro), con los 18 tipos como bloques de 44px en 2 columnas y las regiones en pastillas. Si no cabe, se desplaza por dentro y el pie con «Limpiar» y «Aplicar» queda fijo abajo. Se cierra con «×», con Esc o tocando fuera.
- **«Limpiar»** (en `--control`) vacía la selección del panel; no cambia nada hasta pulsar «Aplicar».
- **«Aplicar»** es el botón secundario en `--ink`, solo con el texto, sin contador. Sin cambios respecto a lo aplicado está desactivado: fondo `--step` y texto `--ink-soft`. Al pulsarlo aplica la selección a la URL y cierra el panel.
- Al cerrar, si el foco estaba dentro del panel, vuelve al botón «Filtros» sin desplazar la página.

**Chips de filtros activos:** una fila bajo la barra, que solo existe si hay filtros.
- **Chip de tipo:** pastilla en el `field` del tipo con el nombre en `field-ink` y un botón «×» de 44px de área táctil (etiqueta accesible «Quitar filtro Fuego»).
- **Chip de región:** pastilla blanca con texto en tinta.
- Al final de la fila, un enlace de texto «Borrar todo».
- Quitar un chip actualiza la URL al momento, y el chip desaparece sin esperar a la carga.

**Rejilla:**
- Columnas: 4 en ≥ 1080px, 3 entre 768 y 1079px y 2 por debajo.
- Huecos: 72px entre filas (el artwork sobresale) y 20px entre columnas. En móvil, 52px y 12px.

**La tarjeta:**

```
        ┌───────── artwork (puede salirse por arriba) ─────────┐
   ┌────┴──────────────────────────────────────────────────────┴────┐
   │                                                                │
   │                      zona del artwork                          │
   ├────────────────────────────────────────────────────────────────┤
   │ Charizard                                             0006     │  ← zona reservada, con la marca de agua
   │ [Fuego] [Volador]                              [Total 534]     │
   └────────────────────────────────────────────────────────────────┘
```

- **Campo:** el `field` del tipo principal, con radio de 28px. Toda la tarjeta es un enlace a la ficha.
- **Zona inferior reservada** (unos 96px, 84px en móvil), con el nombre, la marca de agua del número, las etiquetas de tipo y el total. **El artwork nunca entra en esta zona.**
  - El artwork se limita a la zona superior y solo puede salirse **por arriba**, hasta un 25 % de su altura.
  - El texto queda por encima en el orden de apilado, aunque el artwork no llegue a tocarlo.
- **Marca de agua:** el número sin almohadilla (`0006`) en Nunito 900 con cifras tabulares, en `field-ink` al 40 % de opacidad y con `aria-hidden`.
  - Va en la fila del nombre, alineado a la derecha y al mismo tamaño que el nombre. Ahí el artwork no entra nunca, así que siempre se lee. Antes iba enorme detrás del artwork, arriba a la derecha, y la figura lo tapaba (en Bulbasaur solo asomaba un «1»).
  - **En tarjetas estrechas** (menos de 18rem, 288px: móvil, tablet, la rejilla de 4 columnas por debajo de unos 1200px y la cadena evolutiva) el número sube **encima del nombre**, en `--step-small`, con el **Total a su derecha** en la misma línea, y el nombre se ajusta solo a su propio largo. 18rem es lo que piden las dos etiquetas de tipo más largas más el Total en una línea; por debajo, la línea de tipos queda solo para los tipos y las tarjetas de doble tipo no crecen. Así ningún nombre se corta (Kommo-o, Crabominable, Fletchinder); si aun así no cabe, salta de línea en vez de recortarse con «…».
  - El número real se lee en la etiqueta accesible de la tarjeta («Charizard, n.º 6»).
- **Etiquetas de tipo:** pastillas blancas al 80 % con el nombre en tinta (regla 4 del §2.3).
- **Total:** pastilla en `--ink` con «Total 534» en hueso. La palabra «Total» va en 700 y la cifra en 900, con cifras tabulares. En tarjetas anchas va a la derecha de los tipos; en las estrechas, a la derecha del número (ver arriba) y **más discreta**, para que no compita con el nombre: 12px, fondo `--ink` al 15 % (translúcido sobre el campo) y texto en `field-ink` (tinta en los campos claros, hueso en los oscuros).
- **Misma altura por fila:** la tarjeta ocupa toda la altura de su celda de la rejilla y la línea de tipos se apoya abajo (`mt-auto`), así que todas las tarjetas de una fila miden lo mismo aunque una tenga más contenido.
  - Si no cabe a la derecha de las etiquetas, baja a la línea siguiente.
  - En tarjetas de menos de 12rem (móvil, 2 columnas) no cabe en la zona reservada y se oculta: dos etiquetas largas («Fantasma» y «Veneno») ya ocupan el ancho.
- **Artwork normalizado a la misma altura visual.** El artwork oficial tiene márgenes transparentes distintos en cada Pokémon: Caterpie ocupa la mitad de su lienzo y Venusaur casi todo.
  - Un script de compilación mide el recuadro opaco de cada imagen y guarda un factor de escala por id (`artwork-bounds.json`).
  - La tarjeta aplica ese factor para que la figura mida siempre un 85 % de la altura de la zona superior, limitada por el ancho.
  - Aquí «zona superior» es la zona del artwork completa: la parte de la tarjeta por encima de la zona reservada (62 % del ancho de la tarjeta) más la franja de salida por arriba, del 25 % de la zona. La figura se apoya un poco por encima de la zona reservada y no pasa del 88 % del ancho. Las medidas viven en `src/lib/artwork.ts`.
  - El script es `npm run artwork-bounds`; guarda `src/data/artwork-bounds.json`, que se versiona. Solo hay que repetirlo si PokéAPI cambia el artwork o se añaden Pokémon. Mide las especies (1–1025) y también las formas (`-- --from 10001 --to 10330`: Megas, regionales, Gigamax…), que tienen id propio.
  - Sin datos (un artwork que PokéAPI no tiene o uno nuevo sin medir), se cae al lienzo entero con `object-fit: contain`.
- **Hover y foco:**
  - La tarjeta sube 6px.
  - El artwork crece a `scale(1.08)`.
  - Aparece un brillo suave del color del tipo: `box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--field) 70%, transparent)`, con un fundido de 250ms.
  - **En oscuro el brillo se luce más:** la capa de abajo sube al 90 % y se añade un halo alrededor, `0 0 28px 0 color-mix(in srgb, var(--field) 40%, transparent)`. Es el momento en que la tarjeta parece encenderse. El alcance no crece (46px por abajo y 28px por los lados, como en claro), así que los rellenos calculados para la cadena evolutiva y el modal del comparador siguen valiendo. Siniestro usa su `field-dark`.
  - Todo con curva de rebote (`cubic-bezier(.34,1.56,.64,1)`, 350ms). En reposo, sin brillo.
- **Paginación:** se mantiene `?page=`. Los botones anterior y siguiente son pastillas secundarias y el indicador «3 / 43» va en 800 con cifras tabulares.
- **Estado vacío:** texto centrado «Nada por aquí. Prueba con otro nombre o tipo.» y un botón «Borrar filtros».

### 4.4 Ficha del Pokémon

**Escenario:** el primer bloque, a sangre dentro de los márgenes, con radio de 32px y en el `field` del tipo principal. Mide unos `70svh` en escritorio.
- **Nombre gigante detrás del artwork,** como en la maqueta «Galería»:
  - Nunito 900, en una línea, hasta 22vw (40vw en móvil). Se ajusta con unidades de contenedor para que los nombres largos quepan; si aun así no cabe, se recorta por los lados del escenario.
  - Va en `field-ink` al 14 % de opacidad y con `aria-hidden`.
- **Artwork** centrado delante, de unos 60vh en escritorio y el 90 % del ancho en móvil, con una flotación lenta.
  - **Nunca se muestra por encima de su tamaño real:** el lienzo del artwork oficial mide 475px y ese es su tope en pantalla (`ARTWORK_SIZE` en `src/lib/artwork.ts`), aunque el escenario deje sitio para más. Ampliarlo solo lo emborrona.
  - Se pide a Next.js con `sizes` de 475px en escritorio y `quality={90}` (en `images.qualities` de `next.config.ts`, que en Next 16 solo admite 75 por defecto). El optimizador no amplía, así que en pantallas de alta densidad sirve el original a 475px.
- **Variocolor:** un interruptor redondo de 48px con el icono de destellos (`Sparkles`), arriba a la derecha del escenario. Es independiente del selector de formas y se combina con cualquiera: al cambiar de forma se mantiene encendido si la forma tiene versión variocolor. Blanco apagado, en `--ink` encendido (`aria-pressed`).
- **Debajo, sobre el campo:**
  - El número y, si la forma no es la base, la forma en la misma línea: «N.º 0212 · Mega» (la forma en 900). Antes iba en una línea propia bajo el nombre y el escenario crecía al cambiar de forma.
  - El nombre real (`<h1>`, `--step-hero`, en `field-ink`).
  - Las etiquetas de tipo, la altura, el peso y las **habilidades**, en la misma línea: «Habilidades **Inmunidad** · **Sebo** · **Gula** (oculta)». Como la altura y el peso, la etiqueta va en 600 y los nombres en 900, sin dos puntos; los separa un «·» con 10px a cada lado. Si la línea no cabe, se parte entre bloques (en móvil, «Habilidades» queda encima de los nombres).
    - **Cada nombre es un botón de texto** con un subrayado punteado de 2px en la tinta del campo, que dice que hay más. El área táctil llega a 44px con un pseudoelemento, sin que la línea crezca. «(oculta)» / «(hidden)» va tras el nombre, en 600 y fuera del botón.
    - **Globo con su descripción:** se abre con el ratón al pasar, con el teclado al enfocar (solo con foco visible) y en táctil al tocar (otro toque lo cierra). Esc, tocar fuera, salir con el ratón o perder el foco lo cierran. Es el globo de los tooltips (§4.5): `--ink` con texto hueso, radio de 8px, sombra de capa flotante y fundido de 120ms, pero en varias líneas: el nombre en 800 y debajo el texto en 600, `--step-small`, hasta 22rem de ancho. Se abre **encima** de la fila de tipos, altura y peso y empieza en la vertical de su habilidad, corrido a la izquierda lo justo para no salirse de la fila (en móvil queda pegado al margen). Tapa el nombre mientras está abierto; el escenario recorta lo que sale de él, y encima hay sitio de sobra.
    - **Accesible:** cada botón apunta con `aria-describedby` a su texto en un `sr-only`, siempre presente, así que el lector no depende del globo, que va con `aria-hidden`. `aria-expanded` dice si su globo está abierto.
    - **Textos:** el nombre oficial en cada idioma (`names` de PokéAPI) y el texto de los juegos (`flavor_text_entries`) de la **versión más reciente** que lo tenga en ese idioma. Los grupos de versiones de PokéAPI van numerados en orden de salida, así que gana el de id más alto. Se quitan los saltos de línea de la consola. No se usa `short_effect`, que casi nunca está en español. Si falta el texto en un idioma, se muestra el del otro con su `lang`; si no hay ninguno, el nombre va sin botón.
    - **Cambian con la forma,** como las estadísticas: Venusaur tiene Espesura y Clorofila (oculta), y Mega Venusaur, Sebo, que además hace aparecer el aviso en Debilidades. Al cambiar de forma se cierra el globo abierto. Cada habilidad se pide una vez por ficha aunque la compartan varias formas, con la misma caché de 24 h que el resto de PokéAPI.
    - Antes fueron un panel propio bajo Estadísticas y Debilidades, y la ficha pesaba demasiado: el detalle se queda en el globo.
  - El selector de formas: pastillas blancas, con la activa marcada por el borde de selección (§2.3, regla 8). Solo formas; el variocolor va aparte (arriba).
  - Los nombres de forma con siglas se escriben como tales: «PhD», no «Phd».
  - **«Añadir al equipo»** (§4.9): pastilla terciaria (`--surface`, texto en tinta, icono `Plus` de `lucide-react`) en la misma fila que el selector de formas, al final. Añade **la forma que se está viendo** (Mega, regional…); el variocolor no cuenta, el equipo usa siempre el artwork normal.
    - Al pulsarla aparece un aviso flotante («Añadido a tu equipo · Ver equipo», `--ink` con texto hueso, 2,5s; ver «Aviso flotante» en §4.0) y el botón pasa a **«En tu equipo»** con una marca ✓, relleno `--ink` y texto hueso; en ese estado es un enlace a la página del equipo.
    - Si esta forma ya está en el equipo, se muestra directamente «En tu equipo». El botón está en la ficha de todos los Pokémon; si no se ve «Añadir al equipo», es porque está en uno de estos dos estados (comprobado con Scizor a 390, 768, 1024 y 1440px). Si el equipo está lleno: «Equipo completo», en `--step` con texto en tinta, y enlaza al equipo para hacer sitio.
    - El estado sale de `localStorage` (§4.9), así que en el primer pintado del servidor el botón se pinta en su estado normal y se corrige tras la hidratación sin cambiar de tamaño (ancho mínimo fijado para el texto más largo de los tres).
- **Cambio de forma:** el campo nuevo entra como capa con fundido de opacidad (400ms) y el artwork se cruza. La URL se actualiza para que sea compartible.

**Bloques siguientes:** paneles blancos sobre el fondo, cada uno con una composición distinta.
- **Disposición:** desde 1024px, Estadísticas (7/12) y Debilidades (5/12) lado a lado, cada uno a su altura natural (`items-start`), sin estirarse al del otro; después, la Cadena evolutiva. Por debajo de 1024px, en una columna. Nada es `sticky`.
- **Estadísticas base:** seis filas con el nombre, el valor y la barra (relleno `deep`, pista `--step`, escala sobre 255). El total va en `--step-head`.
- **Debilidades:** etiquetas de tipo en su `field` con el multiplicador (×4, ×2, ×½, ×0) dentro de la propia etiqueta.
  - **Aviso «Según su habilidad»:** si alguna habilidad de la forma activa cambia el daño que recibe según el tipo, va al final del panel, bajo un `<h3>` como los demás grupos, en un bloque `--step` con radio de superficie y texto `--step-body` en tinta. Si la forma tiene **una sola habilidad**, el aviso es afirmativo: «**Levitación**: inmune a Tierra.» (Vikavolt). Si tiene **varias**, es condicional, porque no se sabe cuál lleva: «Si tiene **Sebo**: recibe la mitad de daño de Fuego y Hielo.» / «If it has **Thick Fat**: …» (Snorlax). La oculta lleva «(oculta)» tras el nombre. **Los multiplicadores no cambian:** son siempre los del tipo, porque el Pokémon puede tener otra habilidad.
  - Las habilidades que cuentan viven en `src/constants/abilityDefense.ts`: inmunidades (Levitación, Geofagia, Absorbe Fuego, Cuerpo Horneado, Absorbe Agua, Colector, Piel Seca, Absorbe Electricidad, Pararrayos, Electromotor, Herbívoro), mitad de daño (Sebo, Ignífugo, Pompa, Sal Purificadora), daño extra (Peluche: doble de Fuego; Piel Seca: 25 % más de Fuego), Filtro / Roca Sólida / Armadura Prisma (25 % menos de los supereficaces) y Superguarda. Son solo las que dependen del tipo del ataque; las de clima, contacto o sonido no entran.
- **Cadena evolutiva:** mini tarjetas con la misma anatomía que las de la portada (§4.3), unidas por flechas. La condición («Nivel 22», «Usar Piedra Trueno», «Intercambio») va **encima de la flecha**, en `--step-small` y 800, nunca debajo de la tarjeta.
  - **Escritorio (≥1024px):** la cadena corre de izquierda a derecha con flechas →. Si una etapa se ramifica en cadenas propias (Wurmple → Silcoon → Beautifly / Cascoon → Dustox), cada rama es una fila con su flecha, apiladas a la derecha del origen. Las flechas de una bifurcación se abren desde el origen: la primera rama sube en diagonal (↗), la última baja (↘) y las del medio siguen rectas. Cada flecha, con su condición justo encima, cae en la altura media de la tarjeta a la que llega. Todos los huecos entre columnas miden lo mismo (144px) y la flecha con su condición va centrada en el hueco, a la misma distancia de las dos tarjetas que une.
  - **Abanico:** cuatro o más evoluciones finales desde una misma etapa (Eevee) van en un bloque en `--ground` con una sola flecha desde el origen; la condición va pegada debajo de cada tarjeta, con más aire entre filas que entre la tarjeta y su condición, para que en la segunda fila no parezca de la tarjeta de arriba. Así ninguna flecha parece salir de una hermana. En las cadenas lineales la condición sigue encima de la flecha. Cuatro columnas desde 1280px, dos entre 1024 y 1279.
  - **Móvil:** en vertical, con flechas ↓. Las ramas van en dos columnas que comparten filas (subgrid): en cada nivel los requisitos reservan el mismo alto y las tarjetas empiezan a la misma altura y miden lo mismo, aunque un texto tenga más líneas (Scyther → Scizor / Kleavor). El abanico, sin bloque, va en una rejilla de dos.
  - **Nada se recorta:** el contenedor con scroll horizontal recorta todo lo que sale de su caja, así que ocupa también el relleno del panel (margen negativo y el mismo relleno: 24px en móvil, 40px desde 768px). El brillo de hover (hasta 46px por abajo y 28px por los lados), la subida y el aro de selección caben enteros y el recorte cae en el borde del panel, donde el brillo ya se ha desvanecido.
  - **Requisitos:** de los detalles de PokéAPI (uno por juego) manda el marcado como actual (`is_default`). Si en otros juegos también evoluciona junto a una roca (`near_special_rock`), se añade como alternativa: «Usar Piedra Hoja o subir de nivel junto a la Roca Musgo». Sylveon: «Amistad ≥ 160 · Conocer un movimiento de tipo Hada» (`known_move_type`). Una ubicación sola se muestra como «Subir de nivel en …». «Evolución especial» queda solo para lo que PokéAPI no describe.
- **Anterior y siguiente:** dos tarjetas grandes al final, cada una en el `field` del Pokémon al que lleva.

### 4.5 Tabla de tipos

**Toda la página es un panel blanco** con la tabla, y **cabe entera en 1440×900 sin scroll.**

- **Franja superior:** un título pequeño («Tabla de tipos», `<h1>` en `--step-lead`) y una línea de explicación («Las filas atacan y las columnas reciben. Toca un tipo para resaltarlo.»). Sin tarjeta grande de título, sin subtítulo y **sin leyenda**: el significado de cada celda lo da el tooltip.
- **Tooltip de celda** (solo con puntero): al pasar el ratón por una celda aparece encima un globo breve con el enfrentamiento, «Fuego → Planta: ×2» / «Fire → Grass: ×2» (×2, ×½, ×0 o ×1), con los nombres de tipo en el idioma de la página. Va en `--ink` con texto hueso, `--step-small` en 800, radio de 8px y sombra (es una capa flotante), y aparece con un fundido de 120ms. En las dos primeras y las dos últimas columnas se abre hacia dentro para no salirse de la tabla. Es CSS (`attr(data-tip)` en `globals.css`). La celda en hover sube a `z-index: 11`, por encima de lo fijo de su tabla (las etiquetas fijas del scroll aquí, la fila de avatares de la Defensa en §4.9): cada celda es su propio contexto de apilado (atenuado o animación de entrada) y sin eso el globo de la primera fila quedaba debajo de lo fijo.
- **Sin selector aparte ni panel de información:** la propia matriz es el selector. Pulsar el tipo de una fila elige ese tipo **como atacante** (`?atk=`); pulsar el de una columna, **como defensor** (`?def=`). Pulsarlo otra vez quita la selección y pulsar otro la cambia. No hay resumen de debilidades ni botón «Quitar la selección». Los enlaces antiguos con `?type=` abren la fila.
- **Con selección:** la fila o columna elegida se tiñe (×1 en su `field` mezclado con `--surface` según `--cross-mix`) y su cabecera lleva el borde de selección (§2.3, regla 8); el resto de celdas baja al 50 % de opacidad y las otras cabeceras de ese eje al 65 %, para que lo atenuado se siga leyendo.
- **Guía de hover** (solo con puntero): al pasar por una celda se marcan su fila y su columna, y lo atenuado vuelve a leerse. Es CSS puro (`:has()` en `globals.css`).
  - **El borde es solo de la selección.** En hover, las cabeceras se oscurecen un poco (`brightness(0.92)`), sin borde, para que nunca parezca que hay dos tipos seleccionados.
  - **Un solo criterio de color:** la fila o columna seleccionada se tiñe con un tono claro de su tipo; la fila y columna bajo el ratón, con un gris neutro muy suave (`--ink` al 5 % sobre `--ground`), solo en las celdas ×1 que no están teñidas.
- **Borde de selección por dentro:** el único de la web (§2.3, regla 8), 3px en `--ink` **por dentro de la pastilla**. Así nunca invade las pastillas vecinas, ni en filas ni en columnas, ni toca el borde de la tarjeta.
- **Matriz 18×18:** es una tabla real, así que se permiten líneas finas.
  - **La tabla ocupa todo el ancho del panel** (`table-fixed`): la columna de atacantes tiene ancho fijo y las 18 columnas se reparten el resto a partes iguales (unos 57px a 1440px). Celdas de 32px de alto con 3px de separación y radio de 6px; las cifras en `--step-small` y 900. En móvil la tabla tiene un ancho mínimo de 800px y se desplaza.
  - **Cabeceras de fila y columna con la misma pastilla:** 32px de alto, `--step-small` en 800 y 8px de relleno. Las de columna llenan su columna y llevan la **abreviatura de tres letras en horizontal** (Nor, Fue, Agu… / Nor, Fir, Wat…), sacada del nombre del tipo en cada idioma; el nombre completo va en `title` y para lectores de pantalla. Las de fila miden 104px y llevan el nombre completo.
  - Celdas: ×2 en `--ink` con «2» en hueso; ×½ en `--step` con «½» en tinta; ×0 en `--ink` con «0» y rayas a 45°; ×1 vacía. El multiplicador nunca depende solo del color.
- **Móvil:** la matriz va en un contenedor con scroll horizontal y la columna de tipos atacantes fija a la izquierda. **Solo ese contenedor se desplaza; la página nunca. Cada etiqueta fija (y «Ataca») lleva detrás el fondo de su fila, que cubre también los 8px hasta la primera columna, para que las celdas que pasan por debajo no asomen por sus bordes redondos.** El contenedor es `relative` para que las etiquetas ocultas para lectores de pantalla (absolutas) queden dentro de él: si se escapaban, ensanchaban la página y el menú del header se abría desplazado.

### 4.6 Comparador

- **Dos escenarios lado a lado** (apilados en móvil), cada uno en el `field` de su Pokémon y con la anatomía de la ficha en pequeño. La forma va en la línea del número, como en la ficha (§4.4).
- **Vacío por defecto.** Sin enlace (`?p1=` / `?p2=`), los dos lados empiezan vacíos; con enlace se cargan los Pokémon del enlace, y con uno solo, el otro lado queda vacío. Un lado vacío es **un único botón** del alto de un escenario lleno, como el hueco del equipo (§4.9): `--step`, una Pokébola de líneas de 64px y la pastilla «Elegir Pokémon» / «Choose Pokémon» en `--ink`, con su mismo hover (sube 6px, la Pokébola gira 25°). Su nombre accesible es «Elegir el primer Pokémon» / «…segundo…». Abre el modal de selección con los Pokémon del día como sugerencia. El enlace solo lleva los lados elegidos. Sin los dos, el título de la página es el genérico («Comparador de Pokémon») y la canónica no lleva parámetros.
- **Estadísticas enfrentadas** en un panel blanco, solo con los dos Pokémon elegidos: las barras crecen desde el eje central, cada una en el `deep` de su Pokémon. El ganador de cada estadística se marca con peso 900 y un tamaño más, no con color.
- **«Intercambiar»:** solo con los dos Pokémon elegidos. Pastilla en `--ink` en el eje central, centrada sobre la junta de las dos tarjetas. El centrado vive en un envoltorio y el rebote del hover en la pastilla, porque los dos usan `translate` y el del hover pisaba al del centrado (el botón se iba hacia abajo).
- **Modal de selección:** capa flotante blanca con sombra, que usa el mismo buscador y las mismas mini tarjetas. Su zona con scroll lleva 28px de relleno lateral (32px desde 768px) y 48px abajo, para que el brillo de hover de las tarjetas no quede cortado; la cabecera del modal usa el mismo relleno lateral para alinearse con la rejilla.

### 4.7 Pie

Un pie **compacto** sobre el campo `--footer` a sangre, sin la palabra gigante. En claro es la tinta; en oscuro, un escalón por encima del fondo (`#1D2029`). Todo su texto usa las constantes `--on-dark` y `--on-dark-soft`, que valen igual en los dos temas: donde abajo dice «hueso» es `--on-dark` y donde dice `--bone-soft` es `--on-dark-soft`. Mide unos 180px de alto en escritorio y tiene un margen superior de 64px respecto al contenido.

**Fila principal:** dos extremos.
- **Izquierda:** el logo (Pokébola + «PokéData», Nunito 900, 22px, en hueso) y debajo una frase corta en `--step-small`, en `--bone-soft`: «Los 1025 Pokémon, con su artwork oficial.»
- **Derecha:** enlaces de texto en hueso, Nunito 800, `--step-small`, alineados al borde derecho.
  - Son «Pokédex», «Equipo», «Comparador», «Tipos» y «GitHub», en el orden de la cabecera.
  - «GitHub» va al repositorio en una pestaña nueva, con una flecha ↗ y un aviso accesible «(se abre en una pestaña nueva)».
  - Hover: el texto sube 2px. El subrayado aparece solo en el foco.
**Línea divisoria:** entre las dos filas, una línea sutil de 1px en hueso al 15 %, con 24px por encima y 16px por debajo. Es la única línea fina fuera de las tablas, puesta a propósito para separar el aviso legal.

**Fila inferior:** dos extremos, en `--step-small`.
- **Izquierda:** el aviso legal en `--bone-soft`, usando todo el ancho disponible para quedarse en dos líneas como mucho en escritorio:

  > PokéData es un proyecto hecho por fans, sin afiliación con Nintendo, Game Freak ni Creatures. Pokémon y sus nombres son marcas de sus respectivos propietarios. Datos e imágenes de PokéAPI.

  «PokéAPI» es un enlace a pokeapi.co.
- **Derecha:** el SHA corto del commit (7 caracteres) en Nunito 700 con cifras tabulares y sin monoespaciada. Delante lleva un punto verde sólido de 8px (`--ok`).
  - Todo el conjunto es un enlace al commit en GitHub, con la etiqueta accesible «Versión a1b2c3d».
  - Sin pastilla ni borde.

**Móvil (< 768px):** las zonas se apilan.
- Primero va el logo con su frase.
- Debajo, los cinco enlaces en una fila que puede pasar a dos líneas, sin scroll lateral.
- La línea divisoria.
- Después, el aviso legal y, por último, el SHA.

### 4.8 404 y carga

- **404:** escenario en el campo de Fantasma (`#735797`, tinta hueso) con el mensaje en `--step-hero` y un botón para volver a la Pokédex.
- **Carga:** tarjetas fantasma en `--step` con la misma forma que las reales y la zona inferior reservada. No hay `animate-pulse`: aparecen con una opacidad que entra a los 300ms.

### 4.9 Equipo

**Origen:** la maqueta `mockups/team.html` (referencia local, no se versiona), aprobada el 20 de octubre de 2026. Es la mezcla de dos exploraciones: arriba, los seis campos altos («Seis campos»); debajo, la matriz con el equipo en las columnas («Matriz del equipo»).

**Idea:** el equipo es **una fila de seis campos de tipo, y cada campo es la cabecera de su propia columna** en el análisis. Lo que le pasa a Charizard se lee bajando en vertical desde Charizard; lo que le pasa al equipo, en horizontal por cada fila.

**Ruta:** `/es/equipo` y `/en/team` (en `ROUTE_MAP` / `REVERSE_ROUTE_MAP`, interno `team`). Título de página «Equipo · PokéData» / «Team · PokéData». Entra en el sitemap sin parámetros; la URL canónica no lleva `?t=`.

**Orden de la página:** cabecera de página → fila de los seis campos → panel «Defensa» (aviso de mayor riesgo y matriz) → panel «Cobertura ofensiva» → panel «Estadísticas base». Cada panel tiene una composición distinta (§4.0).

#### Cabecera de página

- `<h1>` «Tu equipo» / «Your team» en `--step-hero`, y debajo «Hasta seis Pokémon. Toca un hueco para añadir.» / «Up to six Pokémon. Tap an empty slot to add one.» en `--step-body`, `--ink-soft`. Por debajo de 640px se omite la frase.
- Por debajo de 1024px, el dado del equipo aleatorio, la papelera de «Vaciar equipo» y el botón «Compartir enlace» van aquí, en ese orden y separados 10px, a la derecha del título (debajo en móvil), porque las columnas laterales de la rejilla desaparecen.

#### La rejilla compartida

Los campos y la matriz usan **la misma plantilla de columnas y el mismo relleno lateral**, así que cada columna de la matriz cae exactamente bajo su miembro:

```
--team-cols: 104px repeat(6, minmax(0, 1fr)) 186px;   /* etiquetas · 6 miembros · balance */
column-gap: 12px;   padding-inline: 24px;               /* el relleno del panel de Defensa */
```

La fila de campos no está dentro de un panel, pero lleva el mismo `padding-inline: 24px` para alinearse con el interior del panel. A 1440px cada columna de miembro mide unos 143px (132px en la maqueta, que tiene un contenedor más estrecho). Esta alineación solo existe desde 1024px; por debajo, ver «Móvil».

#### Fila de los seis campos

Es una `<ol>` (el orden importa; sin números visibles) con 64px de margen superior para el artwork que sobresale (56px por debajo de 1024px).

- **Columna de etiquetas:** el recuento «4/6» en `--step-head` 900 con cifras tabulares y debajo «miembros» / «members» en `--step-small`, `--ink-soft`, apoyados abajo. Es decorativo (`aria-hidden`): el recuento accesible lo da la lista.
- **Columna de balance:** arriba, el **dado del equipo aleatorio** y a su derecha la **papelera de «Vaciar equipo»**, dos botones redondos de 44px en `--surface` (`--control` en oscuro) separados 10px; debajo, «Compartir enlace» (secundario, `--ink`) a todo el ancho de la columna; todo apoyado abajo. Con el equipo vacío, compartir está desactivado (fondo `--step`, texto `--ink-soft`) y la papelera, al 35 %; el dado no.
- **Vaciar equipo:** icono `Trash2` de `lucide-react` en tinta, con `aria-label` «Vaciar equipo» / «Clear team» y el mismo globo que el dado. Va **junto al dado y a «Compartir enlace» en todos los tamaños**: antes, por debajo de 1024px, era un enlace de texto al final de la página y costaba encontrarlo. Como se puede deshacer (ver abajo), no necesita esconderse ni confirmación.
- **Globo de los botones de icono** (dado y papelera): el mismo globo que el selector de tema (§4.1), en `--ink` con texto hueso, pero **encima** del botón, 10px por arriba. Aparece con el puntero y con el foco del teclado; en táctil no hay hover y el nombre va en `aria-label`. Sustituye al `title` nativo del dado.
- **Equipo aleatorio:** el dado del Pokémon del día (§4.2, componente `Die`) en un botón redondo de 44px en `--surface`, con `aria-label` y globo «Equipo aleatorio» / «Random team». Al pulsarlo gira el dado, no el botón (así el globo no gira con él), con rebote (500ms; sin giro con movimiento reducido).
  - **Con huecos,** los rellena y deja a los miembros que hay. **Con el equipo completo,** lo cambia entero y aparece el aviso flotante «Equipo aleatorio · Deshacer» / «Random team · Undo» (5s); «Deshacer» devuelve el equipo anterior.
  - **Quitar y vaciar también se deshacen.** Al quitar a un miembro aparece «Pangoro quitado del equipo · Deshacer» / «Pangoro removed from team · Undo», con el nombre del Pokémon (el mismo del botón «Quitar a…»); «Deshacer» lo devuelve al mismo hueco y con la misma forma, y el foco vuelve a su campo. «Vaciar equipo» muestra «Equipo vaciado · Deshacer» / «Team cleared · Undo», que restaura a los seis en su orden y con su forma. Mismo aviso y misma duración que el del dado (5s).
  - **Solo se deshace lo último.** Cada aviso sustituye al anterior: si se quitan varios seguidos, «Deshacer» devuelve solo al último. Cualquier otro cambio del equipo (añadir, mover, reordenar, cambiar forma, rellenar con el dado, guardar el equipo compartido o volver al propio) retira el «Deshacer» pendiente, porque volver al equipo de antes se llevaría también ese cambio.
  - Las especies nuevas no repiten ninguna especie del equipo, van **solo en su forma base** (salen del índice `pokemon-index.json`, que solo tiene especies y se descarga la primera vez) y tienen **tipos variados**: cada una entra solo si no comparte ningún tipo con el resto del equipo. Si tras 400 intentos no aparece ninguna así (el equipo ya usa casi todos los tipos), entra la que menos tipos repite de 40 candidatas (`src/lib/team-random.ts`).
  - Está desactivado mientras se cargan los miembros: sin sus tipos no sabe qué evitar. El foco se queda en el dado.
- **Campo de un miembro:** 290px de alto (300px por debajo de 1024px; 12px más en táctil, ver la ficha), radio 28px, 6px de relleno, en el `field` de su tipo principal.
  - **Artwork: la figura cabe entera, en alto y en ancho.** Su zona es todo el campo por encima de la ficha, de borde a borde, más lo que se sale **por arriba: 64px desde 1024px y 52px por debajo** (el hueco de 64px entre filas menos 12px de aire; antes 48px y el resto quedaba vacío). Se coloca con `figureStyle` (§4.3), que mide la **figura opaca** y no el lienzo: la figura mide el alto de la zona o, si es ancha, el 94 % del ancho del campo (el 6 % restante es para la escala 1.06 del hover), apoyada sobre la ficha y centrada. Nunca pasa de 475px.
    - Antes el alto mandaba y el ancho llegaba al 140 % de la columna, con los lados recortados: los anchos perdían los extremos (Mega Meganium, Wailord, Eternatus). Ahora un Pokémon ancho sale más bajo, pero entero, y uno alto (Girafarig, Kricketot) usa toda la salida por arriba sin recortarse. Comprobado con Mega Meganium, Gyarados, Wailord, Eternatus, Girafarig y Kricketot a 1440, 1024, 768 y 390px, y con Crabominable y Pangoro a 320px.
    - Las formas (Mega Meganium es la 10xxx) tienen sus medidas en `artwork-bounds.json`, así que se encajan igual que las especies.
    - El campo conserva `overflow-x: clip` por seguridad; con la figura dentro del ancho ya no recorta nada. Mismo `artworkUrl` que el resto de la app; `sizes` de unos 240px.
  - **Enlace a la ficha:** el nombre y el artwork llevan a la ficha del Pokémon **en la forma que tiene en el equipo** (`/es/pokemon/ninetales?variant=ninetales-alola`, lo mismo a lo que redirige la ficha de una forma; la forma base va sin `?variant=`). El nombre es el enlace accesible (subrayado en hover, `title` «Ver ficha de Pangoro» / «View Pangoro»); el del artwork queda fuera del orden de tabulación y de los lectores de pantalla. Los dos llevan `draggable="false"`, así que arrastrarlos arrastra el campo y no el enlace, y los controles quedan fuera de los dos.
  - **Ficha de información:** bloque de **alto fijo: 144px con puntero y 156px en táctil** (ver la fila 4), radio 20px, 10px de relleno, en `--tag-base` al 80 % mezclado con el campo (opaca, como `.type-tag`, regla 4 del §2.3), con texto en `--ink`. Cuatro filas en este orden, siempre en la misma posición:
    1. El número (`0006`) en `--step-small` 800, `--ink-soft`, cifras tabulares. **En táctil, la forma va aquí** («0154 · Mega», como en la ficha del Pokémon, §3), recortada con «…» si no cabe, porque su fila es la de los controles.
    2. El nombre en 900 y **un único tamaño para todo el equipo**: `clamp(14px, 100cqi / (chars × 0.5 + 1), 20px)`, donde `chars` es la longitud del nombre más largo del equipo (mínimo 7). El factor sale de medir los nombres en 900 con −0.03em: los de 7 letras llegan a 4,6em (Kommo-o) y los largos se quedan por debajo de 0,5em por letra más 1em (Crabominable, 6,4em). Una línea, sin «…». Entre 1024 y 1279px los seis campos miden 78–100px: el mínimo baja a 10px (con 14px «Crabominable» o «Kangaskhan» se saldrían de la ficha), el número y la forma bajan a 12px para que el nombre no quede por debajo de ellos, la ficha estrecha su relleno lateral a 6px y, si su contenido mide menos de 72px, las etiquetas de tipo pasan a 11px para que quepa «Fantasma».
    3. Con puntero, la forma en `--step-small` 800, `--ink-soft`, en una línea; en táctil, los controles (ver abajo). **La línea existe aunque no haya forma**, para que todas las fichas tengan la misma estructura. Se usa el nombre corto de la forma («Alola», «Mega X»); el completo («Forma de Alola») va en `title` y en el nombre accesible del campo.
    4. Las etiquetas de tipo **apoyadas abajo** (`align-content: end`): pastillas de 24px en su `field` con `field-ink`, 12px 800, con 4px entre ellas. Si no caben en una fila, pasan a dos; un Pokémon de un solo tipo deja su etiqueta en la fila de abajo. **Entre los controles y la primera pastilla queda al menos el mismo aire que entre pastillas.** Con puntero, los controles ocupan la fila de la forma (24px), y con dos filas de tipos (Pangoro, «Lucha» y «Siniestro»; Rotom, «Eléctrico» y «Fantasma») solo quedaban 2px; por eso con puntero la ficha mide 144px y quedan 6px en todos los anchos. En táctil la fila de los controles mide 36px (4px de aire y botones de 32px): la ficha mide 156px y con dos filas de tipos quedan también 6px (comprobado a 320px y en columnas de 1024px).
  - **Controles por miembro:** mover a la izquierda (←), mover a la derecha (→), cambiar forma (icono `RefreshCw`) y quitar (×). Los dos de mover a la izquierda del campo y los otros dos a la derecha. Botones redondos en `--tag-base` al 80 % sobre el campo, icono en tinta, con su `aria-label` y `title`.
    - **Con puntero** (`@media (hover: hover)`): van **dentro de la ficha**, en una fila bajo el nombre, en el sitio de la forma, para no tapar nunca el artwork. Botones de 24px (menos entre 1024 y 1279px, donde los cuatro no caben: `(100cqi − 4px) / 4`; área ampliada con un pseudoelemento) en `--ink` al 9 % sobre la ficha (16 % en hover), opacos. Aparecen con un fundido de 150ms al pasar el ratón **o al recibir el foco** cualquier elemento del campo (`:focus-within`), y la forma se funde a la vez para dejarles su sitio (sigue en `title` y en el nombre accesible). La fila de la forma mide 24px con puntero, así que la ficha no cambia de tamaño y las etiquetas de tipo caben en dos filas.
    - **Táctil** (`@media (hover: none)`): **también dentro de la ficha**, en su tercera fila, entre el nombre y los tipos, **siempre visibles**. Botones de 32px (44px de área con el pseudoelemento; menos si los cuatro no caben, como con puntero) con el mismo escalón de tinta. Antes iban en una fila propia bajo la ficha y dentro de ella quedaba un hueco vacío entre el nombre y los tipos; ahora el campo mide 312px (302px desde 1024px) en lugar de 330px.
    - Los extremos se desactivan (← en el primero, → en el último) y «Cambiar forma» se desactiva con «Sin otras formas» si la especie solo tiene una. Desactivado = opacidad 35 %, es un gráfico y no lleva texto.
    - **Cambiar forma** abre un menú flotante (`--raised`, radio 18px, sombra de capa flotante) dentro del campo, encima de los controles de la ficha, con una opción por forma (`role="radio"`); la actual lleva el borde de selección (§2.3, regla 8). Elegir una sustituye al miembro en su sitio. Se cierra con Esc, al tocar fuera o al elegir, y el foco vuelve al botón.
    - **Arrastrar** también reordena con puntero (el campo arrastrado al 50 % de opacidad, el destino con un contorno de 3px en `--ink`). Las flechas son la vía accesible y la táctil.
  - Hover del campo: sube 6px y el artwork crece a `scale(1.06)`, con rebote. Sin brillo de tipo: los campos están pegados a la matriz y el brillo ensuciaría la alineación.
  - Nombre accesible del campo: «Ninetales, Forma de Alola».
- **Hueco vacío:** **todo el campo es un único `<button>`** («Añadir Pokémon» / «Add Pokémon»), en `--step` y con la misma altura y radio que un miembro. Dentro, centrados, una Pokébola de líneas de 64px en `--ink-soft` (SVG, `aria-hidden`) y una pastilla «Añadir» en `--ink` con texto hueso.
  - Hover y foco: el hueco sube 6px, su fondo pasa a `--ink` al 9 % sobre `--step`, la Pokébola gira 25° y crece a 1.08 y toma la tinta, y la pastilla crece a 1.06. Pulsación: `scale(0.98)`.
  - Abre el selector (ver abajo). Los huecos van siempre después de los miembros: quitar a uno desplaza a los siguientes a la izquierda.

#### Selector «Añadir al equipo»

Es el modal del comparador (§4.6) con otro final: el mismo buscador, las mismas mini tarjetas y, sin texto escrito, los tres Pokémon del día como sugerencias.
- Debajo de las tarjetas, la **franja de formas** en `--raised-step`, **visible desde que se abre el modal**: «Forma», el hueco de las formas y, a la derecha y apoyado abajo, «Añadir al equipo» (secundario; debajo, a todo el ancho, por debajo de 640px). El botón tiene su propia columna: **las formas nunca pasan por detrás de él**.
  - Sin Pokémon elegido, el hueco dice «Elige un Pokémon» / «Choose a Pokémon» en `--ink-soft` y el botón está desactivado.
  - Tocar una tarjeta la marca con el borde de selección (§2.3, regla 8) y el hueco pasa a una pastilla por forma de la especie, en `--control` («Forma base», «Calor», «Lavado», «Forma de Alola»…), con la activa marcada igual; el botón se activa. Una especie sin formas muestra solo «Forma base» marcada.
  - **La tarjeta marcada muestra la forma elegida:** su artwork, sus tipos, su total y, bajo el nombre de la especie, el nombre de la forma (800, en el `field-ink` del campo al 80 %). Rotom Lavado sale con el artwork de la lavadora y Eléctrico/Agua. El número sigue siendo el de la especie. Mientras llegan los datos de la forma nueva se ve la anterior, sin pasar por la base.
  - **Pastillas de 44px que pasan a otra línea** si no caben (Rotom: dos líneas en escritorio, tres en móvil). Antes iban en una sola línea con scroll horizontal oculto: las que no cabían quedaban detrás del botón sin ninguna pista, y el scroll recortaba por la izquierda la pastilla marcada. La franja crece con las líneas, así que el modal cambia de alto al elegir una especie con muchas formas.
  - **Tope de tres líneas** (`max-height` 172px): con más (Pikachu, 17 formas) la caja se desplaza en vertical con la barra a la vista, y asoma 12px de la cuarta línea como pista de que hay más.
  - **Nada se recorta:** la caja con scroll lleva 6px de relleno, que un margen negativo devuelve, para que quepan el borde de selección y el foco (3px separado 3px, §2.3, regla 7). La activa lleva solo el borde de selección, de un trazo y por dentro.
- Con el equipo lleno, la franja dice «Equipo completo» y el botón está desactivado (en la práctica no se llega: no quedan huecos).
- Al añadir, el modal se cierra, el miembro ocupa el primer hueco y el foco va a su campo.

#### Panel «Defensa»

Panel `--surface`, radio 28px. Título «Defensa» / «Defense» en `--step-head` y la nota «Cada fila es un tipo atacante; cada número, lo que recibe ese miembro.».

**Aviso de mayor riesgo:** una banda en `--step`, radio 20px, texto en 800, siempre presente:
- «**Mayor riesgo:** [Roca] — 3 débiles (1 a ×4), 0 resistentes» / «**Biggest risk:** [Rock] — 3 weak (1 at ×4), 0 resist». El tipo va como etiqueta en su `field`. «Resistentes» cuenta resistencias e inmunidades juntas; si hay inmunes se añade «(1 inmune)». Singular y plural correctos.
- **Cuál es el mayor riesgo:** el tipo atacante con más miembros débiles (×2 o más); a igualdad, el que tiene más ×4; a igualdad, el que tiene menos resistentes más inmunes; a igualdad, el primero en el orden de la tabla de tipos.
- Si ningún tipo pega súper eficaz: «Ningún tipo pega súper eficaz a tu equipo.». Con el equipo vacío: «Añade Pokémon para ver el análisis.». Es una región `aria-live="polite"`.

**La matriz:** 18 filas (tipos atacantes, en el orden de `POKEMON_TYPES`) por 6 columnas de miembro, más el balance. Cada fila es una rejilla con `grid-template-columns: subgrid` sobre `--team-cols`, con 8px entre filas (ver «Fila de mayor riesgo»). Semántica de tabla con roles ARIA (`table`, `row`, `columnheader`, `rowheader`, `cell`), porque una `<table>` no puede compartir columnas con la fila de campos.
- **Cabecera:** «Ataca» / «Attacks»; en cada columna, un círculo de 40px en el `field` del miembro con su artwork recortado (y `alt` con el nombre), o un círculo `--step` vacío para los huecos; y en el balance, «Débiles», «Resisten», «Inmunes» / «Weak», «Resist», «Immune». Todo en `--step-small` 800, `--ink-soft`. **Es fija** bajo la cabecera del sitio (`sticky; top: 72px`, fondo `--surface`) mientras se recorre la matriz en escritorio.
- **Etiquetas de fila:** pastillas de 32px en el `field` del atacante con su `field-ink`, nombre completo, como las de la tabla de tipos.
- **Celdas** (el multiplicador del atacante contra los dos tipos del miembro; mismos datos que la tabla de tipos, `TYPE_CHART`):
  - **×4: la señal más fuerte.** Llena la celda, 36px de alto (sobresale 2px arriba y abajo), radio 10px, relleno `--ink`, «×4» en hueso a 17px 900 y **un aro de 3px por dentro en el `field` del atacante**. Es la única celda con la marca «×» delante.
  - **×2:** pastilla compacta de 26px de alto y 64px de ancho, centrada, en `--ink` con «2» en hueso.
  - **×½ y ×¼:** la misma pastilla compacta en `--step` con «½» o «¼» en tinta.
  - **×0:** llena la celda, 32px, rayas a 45° de `--ink` (como en la tabla de tipos) con «0» sobre una pequeña pastilla en `--ink`.
  - **×1:** vacía, con «×1» solo para lectores de pantalla.
  - Columnas de hueco: celdas vacías.
  - Tamaño, forma y texto distinguen cada valor; nunca solo el color.
  - Tooltip con puntero, el mismo globo de la tabla de tipos (`attr(data-tip)`): «Roca → Charizard: ×4».
- **Balance:** tres subcolumnas con el recuento de miembros débiles (×2 y ×4), resistentes (×½ y ×¼) e inmunes. Cifras en 900 tabulares; el 0 se escribe «–» en `--ink-soft`. Los débiles se marcan: **3 o más**, pastilla en `--ink` con texto hueso; **2**, pastilla en `--step`.
- **Fila de mayor riesgo:** la del aviso se tiñe con su `field` mezclado con `--surface` según `--cross-mix` (35 % en claro, 80 % en oscuro, como la selección de la tabla de tipos), con radio 10px. El tinte se aparta de las celdas con un relleno de la fila: 4px por los lados, **dentro del borde de la tabla** y alineado con el aviso (la cabecera lleva el mismo relleno lateral), y 2px por arriba y por abajo, que caen en el hueco entre filas (margen negativo). Las filas van separadas 8px, así que **entre dos franjas vecinas (la de riesgo y la del hover) siempre quedan 4px** y cada una se lee sola; antes ocupaban todo el hueco y se fundían (Volador en riesgo con Psíquico bajo el ratón). Con 2px, el ×4, que sobresale 2px, cabe justo dentro de la franja. Su etiqueta lleva el borde de selección (§2.3, regla 8), y sus ×4 cambian el aro al `field-ink` (el `field` no se vería sobre el tinte). Las cifras sueltas de su balance, «–» incluido, van en `--ink` en claro y en `field-ink` en oscuro: en oscuro el tinte llega al 80 % y ni `--ink-soft` ni `--ink` se leen sobre él; en claro el tinte al 35 % es claro para todos los tipos y el `field-ink` blanco de Siniestro, Fantasma o Lucha no se leería.
- Hover de fila (solo con puntero): `--ink` al 5 % sobre `--surface`, salvo la fila de riesgo, que conserva su tinte. Ocupa lo mismo que el tinte de riesgo. En la tabla de tipos (§4.5) no hace falta: cada celda se tiñe por separado y los 3px entre celdas ya separan la fila elegida de la del hover.

#### Panel «Cobertura ofensiva»

Título «Cobertura ofensiva» / «Offensive coverage» y nota «Según los tipos de tus miembros, no sus movimientos.» / «Based on your members' types, not their moves.». Dos grupos lado a lado (3fr / 2fr; apilados por debajo de 1024px):
- **«Súper eficaz contra 13»:** bajo el subtítulo (`--step-lead` 900), una **clave** en `--step-small` 800, `--ink-soft`: una pastilla neutra «Tipo rival» / «Opposing type», una flecha ← y «tipos de tu equipo que lo golpean ×2» / «your team's types that hit it ×2» (`aria-hidden`; la información accesible va en cada pastilla).
  - Cada tipo cubierto es una **pastilla compuesta** de 44px en `--step`: primero el tipo rival como pastilla de 36px en su `field` con `field-ink`; luego una flecha ← en tinta (con «lo golpean» / «hit by» para lectores de pantalla); luego una etiqueta de 24px por cada tipo del equipo que lo cubre, en su propio `field`. Si no cabe en una línea (en un móvil, un rival con cuatro tipos), la pastilla parte en dos y se queda con radio 22px. La flecha apunta al rival: se lee «Fuego ← Agua», nunca «Fuego · Agua», que parecía decir que Fuego pega a Agua.
- **«Sin súper eficaz contra 5»:** pastillas `--step` de 44px con el nombre en tinta, sin campo de color (no hay nada que celebrar).
- Ambos grupos en el orden de la tabla de tipos. Con el equipo vacío, solo «Añade Pokémon para ver el análisis.».

#### Panel «Estadísticas base»

Dos columnas (1fr / 2.4fr; apiladas por debajo de 1024px):
- **Izquierda:** el título «Estadísticas base» / «Base stats» en `--step-head` y debajo el **total medio** del equipo en `--step-hero` 900 tabular, con «Total medio, media de los miembros» / «Average total, across members» en 800, `--ink-soft`. Con el equipo vacío, el total es «–» en `--ink-soft`.
- **Derecha:** seis filas (PS, Ataque, Defensa, At. esp., Def. esp., Velocidad / HP, Attack, Defense, Sp. Atk, Sp. Def, Speed): nombre en `--step-small` 800, media del equipo en 900 tabular alineada a la derecha, barra de 12px (relleno `--ink`, pista `--step`, escala sobre 255, como §2.3 regla 5 para paneles sin tipo) y, a la derecha, «Mejor: Scizor 130» en `--step-small` 700, `--ink-soft`. La columna «Mejor» se oculta por debajo de 1024px.
- Las barras crecen con `scaleX` como en la ficha (§6) cada vez que cambia el equipo.

#### Guardado y enlace

- **Guardado en el navegador:** `localStorage`, clave `pokedata-team`, valor JSON `{ "v": 1, "members": ["charizard", "gyarados", "scizor", "ninetales-alola"] }` con los **slugs de PokéAPI** de cada forma (los mismos de `/pokemon/[name]`). Todo acceso va en `try/catch`; si falla, el equipo vive solo en memoria y la página funciona igual. Otras pestañas se sincronizan con el evento `storage`.
- **Enlace:** `/es/equipo?t=charizard,gyarados,scizor,ninetales-alola`. Los slugs desconocidos se descartan y se toman como mucho seis. Se permiten repetidos.
- **Abrir un enlace compartido no pisa el equipo guardado.** Si `?t=` existe y difiere del guardado, la página muestra ese equipo y, bajo el título, una banda en `--step`: «Estás viendo un equipo compartido.» con «Guardarlo como mi equipo» (secundario) y «Volver al mío» (enlace de texto). Editar el equipo compartido lo convierte en el propio (se guarda y se quita `?t=`). Editar el propio también quita `?t=`: el que deja «Compartir enlace» quedaría viejo y al recargar mostraría como compartido un equipo que ya no es el tuyo. «Guardarlo como mi equipo» y «Volver al mío» llevan el foco al primer campo.
- **«Compartir enlace»:** escribe `?t=` con el equipo actual en la URL (`history.replaceState`) y la copia con `navigator.clipboard`; aviso flotante «Enlace copiado» / «Link copied» (`role="status"`, `--ink` con texto hueso, 1,6s). En táctil con `navigator.share`, usa la hoja nativa en su lugar. Si nada funciona, el aviso dice «Copia la dirección de la barra».
- **Primer pintado:** el servidor no conoce `localStorage`. La página es estática y pinta seis campos fantasma en `--step` (forma de §4.8, sin `animate-pulse`) y los paneles con sus títulos; el equipo aparece tras la hidratación (`useSyncExternalStore` con `getServerSnapshot` nulo). Si la URL trae `?t=`, se usa directamente.
- **Datos de cada miembro:** número de especie, nombre, nombre de forma (corto y completo) en el idioma de la página, tipos, seis estadísticas base, id del artwork y la lista de formas de la especie. Llegan de una ruta `GET /api/team?slugs=…` con caché larga (son datos de PokéAPI que no cambian) que reutiliza `getPokemonVariantSummary` y las `varieties` de la ficha.

#### Móvil y tableta (< 1024px)

- La alineación campo-columna se abandona: los campos pasan a una rejilla propia de **3 columnas** (640–1023px) o **2** (< 640px), con 64px entre filas y 12px entre columnas, sin la columna de recuento ni la de botones (el dado, la papelera y «Compartir enlace» suben a la cabecera de página, a la derecha del título y debajo por debajo de 640px; al vaciar, el foco va al primer hueco). Campo de 300px (312px táctil, con los controles dentro de la ficha). El artwork se sale 52px por arriba y la primera fila tiene 56px de margen.
- La matriz va en un contenedor con scroll horizontal, como la tabla de tipos (§4.5): columnas `96px repeat(6, 56px) 186px` (la del balance, igual que en escritorio: «Resisten» e «Inmunes» no caben en menos), 8px de separación, etiquetas de fila fijas a la izquierda y la cabecera de avatares no fija (dentro de un contenedor con scroll no puede pegarse a la página). Solo ese contenedor se desplaza; la página nunca.
- Cobertura y estadísticas se apilan.

#### Textos

Todos en `translations.ts`, en una sección `team`, en los dos idiomas: navegación, título y frase, recuento, botones (compartir, vaciar, añadir, quitar, mover, cambiar forma, sin otras formas), aviso de riesgo con sus plurales, encabezados del balance, cobertura (subtítulos, clave, texto para lectores), estadísticas, selector (título, buscador, forma, añadir, completo), banda de equipo compartido, avisos flotantes y los tres estados del botón de la ficha.

---

## 5. Imágenes

- **Artwork oficial** (`sprites.other["official-artwork"]`) en tarjetas, Pokémon del día, ficha, comparador y evolución. Los sprites pequeños solo se usan en los resultados del buscador.
- Siempre sin caja, directamente sobre el campo, con `object-fit: contain` y la escala normalizada (§4.3). En reposo no llevan halo, sombra ni degradado.
- `next/image` con `sizes` correctos: unos 300px en tarjeta, 280px en columna del día y 60vh en la ficha.
- Las imágenes ya están permitidas en `next.config.ts` (`raw.githubusercontent.com/PokeAPI/sprites/**`).
- Se mantiene el aviso legal: proyecto no oficial; Pokémon pertenece a Nintendo, Creatures y GAME FREAK.

---

## 6. Movimiento

Solo se animan `transform` y `opacity`. Todo tiene alternativa con `prefers-reduced-motion: reduce`, que conserva el contenido y quita el desplazamiento. Se usa Framer Motion, que ya está instalado. El contenido es visible sin JavaScript.

| Dónde | Qué | Valores |
| --- | --- | --- |
| Tarjetas (movimiento principal) | Entrada «pop»: suben 30px y crecen desde 0.94 | 600ms · `cubic-bezier(.34,1.56,.64,1)` · 45ms de escalonado · solo las 24 primeras · una vez |
| Tarjetas, hover | Subida, crecimiento del artwork y brillo de tipo (§4.3) | 350ms de rebote · 250ms el brillo |
| Pokémon del día | Giro del dado y cambio escalonado de columnas | 500ms · 60ms entre columnas |
| Logo | Vuelta completa de la Pokébola en hover | 600ms con rebote |
| Cabecera | Aparece la sombra al desplazar y entra el buscador compacto en la portada | 200ms |
| Panel de filtros | Escritorio: se despliega en altura con fundido y empuja la rejilla (con movimiento reducido, solo el fundido). Móvil: la hoja sube desde abajo | 250ms · `cubic-bezier(.22,.8,.24,1)` |
| Chips activos | Entrada con escala y salida con fundido | 200ms |
| Ficha | Flotación lenta del artwork y cambio de forma | 6s en bucle · 400ms |
| Barras de estadísticas | `scaleX` de 0 a su valor cuando su fila entra en pantalla (cada fila por separado: las visibles al cargar crecen enseguida y las de abajo, al bajar hasta ellas), cada vez que se muestra un Pokémon o una forma nuevos (ficha y comparador). Salen vacías desde el primer pintado; sin JavaScript o con movimiento reducido, ya llenas | 600ms · 70ms de escalonado |
| Controles | Pulsación `scale(0.96)` y hover con rebote | 150ms |
| Selector de tema | El relleno del segmento activo se desliza al nuevo (`transform`); el tema cambia sin fundido | 250ms con rebote · tooltip 120ms |
| Equipo: campos | Entrada «pop» de los seis campos como las tarjetas; al añadir, el nuevo entra con «pop»; al quitar, sale con escala a 0.94 y fundido, y los siguientes se deslizan (`layout` de Framer Motion); al reordenar, los dos campos se cruzan | 600ms entrada · 45ms de escalonado · 350ms con rebote el resto |
| Equipo: huecos y controles | Hueco: sube 6px, la Pokébola gira 25°; controles de escritorio con fundido al hover o foco; menú de formas con fundido y 4px de subida | 350ms con rebote · 150ms · 200ms |
| Equipo: dado | Vuelta completa con rebote, como el del Pokémon del día; los miembros nuevos entran con «pop» | 500ms |
| Equipo: análisis | Al cambiar el equipo, las celdas de la columna afectada entran con escala de 0.9 a 1 y fundido; la banda de riesgo cruza el texto con fundido; las barras de estadísticas, como en la ficha | 200ms · 20ms de escalonado por fila · barras 600ms |

En el equipo, la entrada escalonada se guarda hasta que llegan todos los miembros: los huecos y los miembros entran cada uno con el retraso de su sitio, aunque los datos lleguen en dos tandas. El campo que sale deja su sitio enseguida (`popLayout`), para que la rejilla nunca tenga siete elementos. Los huecos y los fantasmas no tienen salida: el campo que ocupa su sitio entra encima. Con movimiento reducido, los campos solo se funden (sin subida, escala ni deslizamiento) y las celdas y el menú también.

---

## 7. Cambios respecto a la dirección anterior

Lo que ya está en el código de los últimos commits (tokens, Chivo, cabecera y pie) se rehace con esta dirección:

| Antes | Ahora |
| --- | --- |
| Chivo, títulos en mayúsculas | Nunito, sentence case |
| Esquinas rectas en todo | Superficies de 28px y controles en pastilla |
| Fondo papel `#F7F5F0` | Fondo `#F3F4F8` con superficies blancas |
| Sin acento: botón principal en tinta | Rojo Pokébola `#CC2E0B` solo en el logo |
| Portada como índice en filas | Hero compacto con el Pokémon del día y rejilla de tarjetas de color |
| Filtros siempre visibles | Botón «Filtros» con contador, panel y chips removibles |
| Ficha en un campo a sangre en toda la página | Escenario de color con el nombre gigante y paneles blancos debajo |
| Ninguna sombra fuera de capas flotantes | Además, la cabecera al desplazar y el brillo de tipo en hover |
| Pie con «POKÉDATA» gigante a todo el ancho | Pie compacto de dos filas: marca y enlaces, aviso legal y versión |
| Solo tema claro | Claro, oscuro y automático, con el selector en la cabecera (§2.4) |

Se mantiene todo lo demás de la casa:
- Ni monoespaciada, ni etiquetas diminutas en mayúsculas espaciadas, ni `backdrop-blur`, ni `transition-all`, ni `animate-pulse`.
- Nada de `h-screen` (se usa `svh`).
- Ningún degradado.
- `TYPE_GLOWS` se borra: el brillo de hover sale del token `field`.

---

## 8. Orden de trabajo: tema oscuro

La dirección «Pop» ya está construida (merge 99fcfce); su orden de trabajo queda en el historial de git. Este es el del tema oscuro. Cada paso se cierra con la app funcionando en claro igual que antes.

1. **Tokens en claro, sin cambio visible.**
   - Añadir `--raised`, `--footer`, `--on-light`, `--on-dark` y `--on-dark-soft` en `globals.css`, con los valores claros.
   - Las variables `--type-*-ink` pasan a apuntar a `--on-light` / `--on-dark` en vez de a `--ink` / `--bone`.
   - Añadir `--type-*-text` (de momento igual a `deep`) y `--type-dark-field-dark`.
   - Pasar a tokens (`--shadow-header`, `--shadow-sheet`, `--shadow-overlay`, `--shadow-modal`, `--shadow-tooltip`) las cinco sombras que los componentes escribían con color fijo. No queda ningún `bg-white` ni `#fff` fuera de `globals.css`.
   - Comprobar con capturas que el modo claro no ha cambiado ni un píxel.
2. **Repaso de usos.** Cada componente que pinta sobre un campo de tipo usa `field-ink` o las constantes `--on-*`; cada texto de tipo, `--type-*-text`; cada capa flotante, `--raised`. La Pokébola pasa a colores fijos (§2.4). Así el paso 3 cambia solo variables.
3. **Valores oscuros.** El bloque oscuro de `globals.css`, en `:root[data-theme="dark"]` y en `@media (prefers-color-scheme: dark)` con `:not([data-theme="light"])`. Incluye `color-scheme`, `field-dark` de Siniestro, `glow` como `--type-*-text` y las sombras oscuras. Se prueba con el modo oscuro del sistema, sin selector todavía.
4. **Script de arranque.** El `<script>` inline en el `<head>` del layout raíz (§2.4), `suppressHydrationWarning` en `<html>` y `theme-color` con `media` en el `viewport` del layout. Prueba: forzar `localStorage.setItem("pokedata-theme","dark")` con el sistema en claro y recargar con la red y la CPU ralentizadas: el primer pintado ya es oscuro.
5. **Selector de escritorio** (§4.1). Grupo de radios con sol, luna y monitor, tooltip, marca del activo por `data-theme-pref`, guardado, evento `storage` y textos en `translations.ts` en los dos idiomas. A 768px no cabía: entre 768 y 1023px el buscador compacto se queda en su lupa de 44px (§4.1).
6. **Selector en la hoja móvil.** El mismo control dentro de «Menú», con iconos y nombres visibles.
7. **Ajustes propios del oscuro.**
   - Brillo de hover de dos capas (§4.3) en todo lo que ya lo tiene en claro: tarjetas, mini tarjetas de la evolución y del comparador, y anterior/siguiente. Las columnas del día no llevan brillo en ningún tema (§4.2).
   - Anillos de selección de las pastillas de tipo del panel de filtros en `field-ink` (§2.3, regla 8).
   - Etiquetas de tipo en `--ground` al 80 % y pastilla «Total» estrecha sobre `--on-light`.
   - Tinte de la fila o columna seleccionada de la tabla de tipos mezclado con `--surface`.
8. **Pantalla por pantalla, en oscuro:** portada (hero, día, filtros, rejilla, carga), ficha, comparador con su modal, tabla de tipos, 404 y pie. En cada una se busca lo que se quedó blanco, tinta oscura sobre fondo oscuro o una sombra que ya no se ve.
9. **Contraste verificado.** Un script (`npm run check-contrast`) recalcula desde `globals.css` las tablas del §2.1 y del §2.4 y falla si algún par baja de su umbral: 4.5:1 en texto y 3:1 en los bordes de campo y los gráficos. Las cifras de este documento salen de ese script, no a mano. También calcula la tabla del §2.2 y el peor caso de la regla 4, y falla si los dos bloques oscuros de `globals.css` no son iguales o si `typeColors.ts` y `theme.ts` no repiten los valores del CSS. Al pasarlo, Normal resultó estar en 4.49:1 sobre el fondo claro (no en 4.50): se suma a la regla 1, que ya lo cubre.
10. **Revisión.**
    - `lint.mjs` sin FAIL. Excepciones: las mismas de siempre más el halo de hover oscuro, justificado en una frase.
    - `inspect.mjs` contra `npm run dev` a 1440, 768 y 390px, en claro y en oscuro (con el sistema en oscuro y sin clave guardada).
    - Capturas de Pikachu, Glaceon, Snorlax, Sylveon, Gengar y Umbreon en los dos temas (§2.3).
    - Recorrer los tres modos con el teclado: foco visible, flechas en el selector, tooltip con el foco y Esc.
    - Cambiar el tema del sistema con la página abierta en automático: cambia sola. Con un tema forzado: no cambia.
    - Movimiento reducido: el relleno del selector no se desliza, solo cambia.
    - **Resultado (19 de octubre de 2026).** `lint.mjs`, `check-contrast`, `tsc` y ESLint sin errores. `inspect.mjs` da exactamente los mismos avisos en claro y en oscuro en la portada, la ficha, la tabla, el comparador y la 404. Esos avisos vienen de la dirección Pop y no del tema: letra de 14px en etiquetas, pocas fotos y ningún vídeo, la cabecera fija que pasa sobre «Pokédex Nacional», el «n.º» sobre el título y la línea del pie. El único aviso propio del oscuro, el contraste de las etiquetas de tipo, era una lectura falsa del inspector, que ignora los fondos translúcidos; se corrigió haciendo la pastilla opaca (regla 4 del §2.3). Las capturas de los seis Pokémon, el teclado, el cambio de tema del sistema en vivo y el movimiento reducido pasan.

---

## 9. Orden de trabajo: equipo

Referencia visual: `mockups/team.html` (§4.9). Cada paso se cierra con la app funcionando, `tsc` y ESLint sin errores, y en los dos temas.

1. **Datos y cálculo, sin interfaz.**
   - `src/lib/team.ts`: tipos (`TeamMember`), lectura y escritura de `pokedata-team` con `try/catch` y versión, lectura y escritura de `?t=` (descartar slugs desconocidos, máximo seis) y un almacén para `useSyncExternalStore` con el evento `storage`.
   - `src/lib/team-analysis.ts`, funciones puras sobre `TYPE_CHART` y `calculateTypeWeaknesses`: multiplicador por atacante y miembro, balance por fila, mayor riesgo con su orden de desempate, cobertura (rival → tipos que lo golpean) y medias con el mejor de cada estadística.
   - Pruebas de esas funciones con el equipo de la maqueta: Roca es el mayor riesgo (3 débiles, 1 a ×4, 0 resistentes); 13 tipos cubiertos y 5 sin cubrir (Normal, Agua, Eléctrico, Veneno, Fantasma); total medio 520.
2. **Ruta de datos.** `GET /api/team?slugs=…` con caché larga, en los dos idiomas, que devuelve lo que pide el §4.9 «Datos de cada miembro», formas de la especie incluidas.
3. **Ruta y navegación.** `team` en `ROUTE_MAP` (`equipo` / `team`), página `src/app/[locale]/team/page.tsx` con metadatos y canónica, sitemap, enlace «Equipo» en la cabecera, la hoja móvil y el pie (§4.1, §4.7), y la sección `team` de `translations.ts` completa. Volver a medir la cabecera de tableta con cuatro enlaces.
4. **Fila de campos, estática.** La rejilla compartida (`--team-cols`), el campo de miembro con artwork y ficha de alto fijo, el hueco vacío como botón entero, el recuento y los botones laterales; fantasmas en el primer pintado. Captura a 1440px con 4 miembros y 2 huecos contra la maqueta, en claro y en oscuro.
5. **Selector.** Generalizar `PokemonSelectModal` para que devuelva el Pokémon elegido en vez de navegar (el comparador sigue igual), y añadir la franja de formas. Añadir ocupa el primer hueco y lleva el foco al campo nuevo.
6. **Controles por miembro.** Mover, cambiar forma (menú) y quitar, con su presentación por puntero y táctil, la gestión del foco, Esc y el arrastre. Guardado en cada cambio.
7. **Panel «Defensa».** Aviso de mayor riesgo, cabecera de avatares fija, etiquetas, celdas con la jerarquía ×4 > ×2 > ×½ > ×1, ×0 rayado, balance y fila de riesgo teñida, tooltips y hover. Comprobar que cada columna cae bajo su campo a 1024, 1280 y 1440px.
8. **Paneles «Cobertura ofensiva» y «Estadísticas base».** Clave, pastillas compuestas con flecha, grupo sin cubrir, total medio y barras con «Mejor».
9. **Guardado y enlace.** «Compartir enlace» con portapapeles, hoja nativa y respaldo; banda de equipo compartido con «Guardarlo como mi equipo» y «Volver al mío»; sincronización entre pestañas.
10. **Botón de la ficha.** «Añadir al equipo» en §4.4 con sus tres estados y el aviso flotante, añadiendo la forma que se ve.
11. **Móvil y tableta.** Rejilla de 3 y 2 columnas, controles táctiles siempre visibles, matriz con scroll propio y etiquetas fijas, compartir en la cabecera de página y «Vaciar equipo» al final. Sin scroll horizontal de página a 390px.
12. **Movimiento** (§6): entradas, añadir, quitar y reordenar con `layout`, huecos, menú, celdas y barras, todo con alternativa para movimiento reducido.
13. **Revisión.**
    - `lint.mjs` sin FAIL e `inspect.mjs` contra `npm run dev` a 1440, 768 y 390px, en claro y en oscuro. Los avisos heredados de Pop (pocas fotos, sin vídeo, letra de 12–14px en etiquetas) se aceptan como en §8.
    - `check-contrast` sin cambios (no hay tokens nuevos). Revisar a mano el texto de la ficha sobre los campos más claros (Eléctrico, Hielo) y más oscuros (Siniestro en oscuro, Fantasma) y la fila de riesgo con Eléctrico y Siniestro.
    - Equipos de prueba: el de la maqueta; uno con Umbreon y un nombre largo (Crabominable) para el tamaño único de nombre; uno con Megas y formas regionales; uno sin débiles compartidos; el equipo vacío; un enlace con slugs inválidos.
    - Teclado completo: añadir, cambiar forma, mover, quitar y compartir sin ratón, con el foco siempre visible y en su sitio.
    - **Resultado (20 de octubre de 2026).** `lint.mjs`, `check-contrast`, `tsc`, ESLint y las pruebas sin errores. `inspect.mjs` da los mismos avisos en claro y en oscuro, con equipo y vacío: los heredados de Pop (etiquetas de 12–14px, pocas fotos con el equipo vacío, ningún vídeo, la línea y el texto largo del pie) y tres propios que se aceptan: la matriz desplazable en móvil (§4.9, como la tabla de tipos), la etiqueta de tipo de la última ficha leída como «antetítulo» de «Defensa» a 768px y, con un nombre de 12 letras entre 1024 y 1279px, el nombre a 10px. Se corrigieron cuatro fallos: las cifras de la fila de riesgo en claro con tipos oscuros (`field-ink` blanco sobre el tinte claro), «Resisten» e «Inmunes» pisándose en la matriz de móvil (columna de 168 a 186px), nombres largos y etiquetas como «Fantasma» saliéndose de la ficha a 1024px, y el foco al añadir o quitar con el teclado, que acababa en el campo que salía (los campos que salen dejan de marcar su hueco). Los equipos de prueba y el recorrido con teclado pasan.
