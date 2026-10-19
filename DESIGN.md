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

En oscuro, `--ink` y `--bone` intercambian su papel: la tinta es clara y los rellenos en tinta (botón secundario, «Total», navegación activa, tooltips, celdas ×2 de la tabla) pasan a ser pastillas claras con texto oscuro. Es intencionado: el elemento más fuerte de cada pantalla sigue siendo el de más contraste.

El acento rojo no se usa nunca para marcar estados ni selecciones; eso lo hace la tinta.

**Contraste de los tokens oscuros (WCAG 2.x):**

| Par | Ratio |
| --- | --- |
| `--ink` sobre `--ground` / `--surface` / `--step` / `--raised` | 15.85 / 14.27 / 12.23 / 12.57 |
| `--ink-soft` sobre `--ground` / `--surface` / `--step` / `--raised` | 7.61 / 6.86 / 5.88 / 6.04 |
| `--bone` sobre `--ink` (botones, «Total», tooltips) | 15.85 |
| `--on-dark` / `--on-dark-soft` sobre `--footer` | 14.93 / 8.59 |

### 2.2 Los 18 tipos

Se conservan los valores actuales de `src/constants/typeColors.ts`. Cada tipo tiene cuatro tokens:

- **`field`**: el color del tipo. Es el fondo de las tarjetas, de las columnas del Pokémon del día, de los bloques de tipo del panel de filtros y del escenario de la ficha.
- **`field-ink`**: tinta sobre ese campo, negra (`--on-light`) u hueso (`--on-dark`), la que dé más contraste. Nunca gris. Es una constante: no cambia con el tema.
- **`step`**: el campo oscurecido un 14 %. Es la superficie secundaria dentro del campo, por ejemplo una pista de barra o un bloque de evolución.
- **`deep`**: variante oscurecida para usar el color del tipo como texto o como marca sobre blanco (`--surface`).

| Tipo | `field` | `field-ink` | field/ink | `step` | `deep` | deep/blanco | deep/fondo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Normal | `#A8A77A` | ink | 7.28 | `#909069` | `#727253` | 4.94 | 4.50 |
| Fuego | `#EE8130` | ink | 6.72 | `#CD6F29` | `#A95C22` | 4.95 | 4.51 |
| Agua | `#6390F0` | ink | 5.83 | `#557CCE` | `#4C6FB9` | 4.90 | *4.46* |
| Eléctrico | `#F7D02C` | ink | 12.05 | `#D4B326` | `#836E17` | 4.99 | 4.54 |
| Planta | `#7AC74C` | ink | 8.68 | `#69AB41` | `#4C7B2F` | 5.02 | 4.57 |
| Hielo | `#96D9D6` | ink | 11.34 | `#81BBB8` | `#527776` | 4.93 | *4.49* |
| Lucha | `#C22E28` | bone | 5.19 | `#A72822` | `#C22E28` | 5.65 | 5.14 |
| Veneno | `#A33EA1` | bone | 5.12 | `#8C358A` | `#A33EA1` | 5.58 | 5.08 |
| Tierra | `#E2BF65` | ink | 10.21 | `#C2A457` | `#816D3A` | 5.02 | 4.57 |
| Volador | `#A98FF3` | ink | 6.80 | `#917BD1` | `#7664AA` | 5.03 | 4.58 |
| Psíquico | `#F95587` | ink | 5.74 | `#D64974` | `#C24269` | 4.91 | *4.47* |
| Bicho | `#A6B91A` | ink | 8.23 | `#8F9F16` | `#6A7611` | 4.99 | 4.54 |
| Roca | `#B6A136` | ink | 7.00 | `#9D8A2E` | `#7E6F25` | 5.01 | 4.56 |
| Fantasma | `#735797` | bone | 5.45 | `#634B82` | `#735797` | 5.93 | 5.40 |
| Dragón | `#6F35FC` | bone | 5.37 | `#5F2ED9` | `#6F35FC` | 5.85 | 5.32 |
| Siniestro | `#705746` | bone | 6.14 | `#604B3C` | `#705746` | 6.69 | 6.08 |
| Acero | `#B7B7CE` | ink | 9.18 | `#9D9DB1` | `#6E6E7C` | 5.02 | 4.57 |
| Hada | `#D685AD` | ink | 6.72 | `#B87295` | `#985E7B` | 4.97 | 4.53 |

Los contrastes están calculados con WCAG 2.x, con la tinta `--on-light` (`#15161C`). Las cifras en cursiva no llegan a 4.5:1, y de ahí sale la regla 1 del §2.3.

El código no usa `deep` directamente para texto: usa **`--type-*-text`**, que vale `deep` en claro y `glow` en oscuro (§2.4).

Los tokens viven en un único sitio: `typeColors.ts` y las variables `--type-*` de `globals.css`. Ningún otro fichero escribe a mano un color de tipo. Veneno, Fantasma y Dragón son violetas canónicos y llevan el comentario `taste-skill-ignore`.

### 2.3 Reglas de contraste

1. **El texto con color de tipo va en `--type-*-text` y sobre `--surface`.** En claro es `deep`, y sobre `--ground` Agua, Hielo y Psíquico bajan de 4.5:1, así que nunca hay texto de tipo apoyado directamente en el fondo. En oscuro (`glow`) pasa de 4.5:1 en los dos, pero la regla es la misma para no tener dos.
2. **Ningún texto se pinta con `field` sobre blanco o sobre el fondo.** Eléctrico, Hielo, Normal y Hada caen a entre 1.4 y 2.5:1.
3. **Todo bloque de color lleva su texto dentro, en su `field-ink`.** Eso incluye tarjetas, columnas del día, bloques del panel de filtros y chips activos. Así, un Eléctrico que apenas se distingue del fondo no pierde información.
4. **Las etiquetas de tipo dentro de un campo de color son pastillas de superficie:** en claro, blancas (`--surface` al 80 %) con texto en `--ink`, como en la maqueta; en oscuro, `--ground` al 80 % con texto en `--ink` (clara). Peor caso en oscuro: 9.84:1, sobre Eléctrico. No se pone un color claro sobre otro claro sin una tinta de por medio.
5. **Barras de estadísticas:** sobre `--surface`, relleno en `--type-*-text` y pista en `--step`. Sobre un campo de tipo, relleno en `field-ink` y pista en `step`.
6. **Jerarquía con tamaño y peso, no con opacidad.** Las únicas excepciones son decorativas, marcadas con `aria-hidden`: la marca de agua del número (§4.3) y el nombre gigante de la ficha (§4.4).
7. **Foco visible:** contorno de 3px en `--ink` separado 3px. Sobre un campo de tipo, el contorno va en su `field-ink`, en los dos temas.
8. **Anillos de selección sobre campos de tipo:** la tabla de tipos ya los pone en `field-ink` (§4.5). Las pastillas de tipo del panel de filtros los llevan en `--ink`: en claro se queda así; en oscuro pasan a `field-ink`, porque un anillo en `--ink` (que ahí es clara) desaparece sobre Eléctrico o Hielo.

Antes de cerrar cada pantalla se hacen capturas de Pikachu (Eléctrico), Glaceon (Hielo), Snorlax (Normal), Sylveon (Hada) y Gengar (tinta hueso), **en los dos temas**. En oscuro se añade Umbreon (Siniestro, el único campo que cambia).

### 2.4 Tema oscuro

**Idea:** de noche, las tarjetas son lo que da la luz. El fondo es casi negro con un tinte azul apenas perceptible (`#14161D`: el azul va 9 puntos por encima del rojo), para que no se sienta plano ni gris de pantalla apagada; los campos de tipo se quedan exactamente como en claro.

**Tres modos:** claro, oscuro y automático según el sistema (por defecto). El selector está en la cabecera (§4.1).

**Campos de tipo en oscuro.** Sobre `#14161D`, un campo necesita 3:1 con el fondo para que el borde de la tarjeta se vea (WCAG 1.4.11). Diecisiete tipos lo cumplen sin tocar nada. Solo **Siniestro** (2.70:1) se aclara un 5 %, a `field-dark` `#775F4F` (3.04:1), y su tinta hueso sigue en 5.45:1. Su `step` en oscuro es `#665244`.

**`glow`:** el tipo como texto o como marca sobre `--surface` y `--ground` oscuros (≥ 4.5:1 en los dos). Trece tipos usan su `field` tal cual; los cinco de tinta hueso se aclaran mezclándolos con blanco.

| Tipo | `field` en oscuro | campo/fondo | field/ink | `glow` | glow/superficie | glow/fondo |
| --- | --- | --- | --- | --- | --- | --- |
| Normal | `#A8A77A` | 7.29 | 7.28 | = field | 6.56 | 7.29 |
| Fuego | `#EE8130` | 6.73 | 6.72 | = field | 6.06 | 6.73 |
| Agua | `#6390F0` | 5.83 | 5.83 | = field | 5.25 | 5.83 |
| Eléctrico | `#F7D02C` | 12.06 | 12.05 | = field | 10.86 | 12.06 |
| Planta | `#7AC74C` | 8.69 | 8.68 | = field | 7.83 | 8.69 |
| Hielo | `#96D9D6` | 11.35 | 11.34 | = field | 10.22 | 11.35 |
| Lucha | `#C22E28` | 3.20 | 5.19 | `#D26662` | 4.51 | 5.01 |
| Veneno | `#A33EA1` | 3.24 | 5.12 | `#B96CB8` | 4.57 | 5.08 |
| Tierra | `#E2BF65` | 10.22 | 10.21 | = field | 9.20 | 10.22 |
| Volador | `#A98FF3` | 6.81 | 6.80 | = field | 6.13 | 6.81 |
| Psíquico | `#F95587` | 5.75 | 5.74 | = field | 5.17 | 5.75 |
| Bicho | `#A6B91A` | 8.24 | 8.23 | = field | 7.42 | 8.24 |
| Roca | `#B6A136` | 7.00 | 7.00 | = field | 6.31 | 7.00 |
| Fantasma | `#735797` | 3.05 | 5.45 | `#937EAF` | 4.53 | 5.03 |
| Dragón | `#6F35FC` | 3.09 | 5.37 | `#966CFD` | 4.54 | 5.04 |
| Siniestro | **`#775F4F`** | 3.04 | 5.45 | `#978478` | 4.56 | 5.07 |
| Acero | `#B7B7CE` | 9.19 | 9.18 | = field | 8.27 | 9.19 |
| Hada | `#D685AD` | 6.73 | 6.72 | = field | 6.06 | 6.73 |

Los valores salen de un script que mezcla con blanco en pasos del 1 % hasta llegar al umbral; si se toca un token, se recalcula la fila entera.

**Lo que cambia en oscuro y nada más:**
- **Brillo de hover de las tarjetas** (§4.3): mismo alcance, más intensidad. Sobre fondo oscuro el color de tipo luce de verdad, y se aprovecha: dos capas en lugar de una.
- **Sombras:** las de claro no se ven sobre `#14161D`. La cabecera al desplazar usa `0 6px 20px rgba(0,0,0,.45)` y las capas flotantes van en `--raised` con `0 16px 40px rgba(0,0,0,.55)`. La separación la da sobre todo el escalón de tono.
- **Pokébola del logo:** contorno, banda y botón en `--on-light`, mitad inferior y centro en `--on-dark`, mitad superior en `--accent`. Con colores fijos el logo es el mismo en los dos temas; sobre el fondo oscuro la silueta la dibujan el rojo y el hueso (16.6:1).
- **Tabla de tipos:** la fila o columna seleccionada se tiñe con su `field` mezclado con `--surface` (en claro, que es blanco, queda igual que ahora). La guía de hover usa `--ink` al 5 %, que en oscuro aclara.
- **Pastilla «Total» estrecha:** base `--on-light` al 15 % en los dos temas, con texto en `field-ink`. Con `--ink` se aclararía en oscuro y bajaría el contraste de la tinta hueso.
- **Controles nativos y barras de scroll:** `color-scheme: light` o `dark` en `:root`, según el tema activo.
- **Barra del navegador:** `<meta name="theme-color">` con `--ground` de cada tema (`#F3F4F8` / `#14161D`), con `media` para el modo automático; el script de arranque la corrige si el tema está forzado.

**Carga sin parpadeo** (guía de Next 16: `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`, apartado «Themes»):
- La preferencia vive en `localStorage` con la clave `pokedata-theme` (`light` o `dark`). Si no existe, el modo es automático. No se usa cookie: obligaría a renderizar en dinámico las páginas que hoy son estáticas.
- Un `<script>` inline en el `<head>` del layout raíz, antes de cualquier hoja de estilo que pinte, lee la clave y pone en `<html>`:
  - `data-theme="light"` o `"dark"` solo si el tema está forzado; en automático no pone nada y manda `prefers-color-scheme`.
  - `data-theme-pref="light" | "dark" | "system"`, que es lo que marca el segmento activo del selector **por CSS**, ya correcto en el primer pintado y sin esperar a la hidratación.
- El script va envuelto en `try/catch` (navegación privada, almacenamiento bloqueado): si falla, el modo es automático. `<html>` lleva `suppressHydrationWarning`.
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
- Las formas («Urshifu Estilo Fluido») se escriben como nombre más una línea secundaria, no concatenadas.
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
- **Sin scroll horizontal de página:** solo lo tienen contenedores concretos (la tabla de tipos, la cadena evolutiva). El `<main>` lleva `overflow-x: clip` como red de seguridad; `clip` no crea contenedor de scroll, así que no rompe los elementos fijos ni `sticky`. Un elemento absoluto dentro de un contenedor con scroll necesita un antepasado posicionado dentro de ese contenedor.

### 4.1 Cabecera (todas las páginas)

**Composición:** el logo (Pokébola + «PokéData», Nunito 900, 24px), la navegación («Pokédex», «Tipos», «Comparador»), el buscador compacto, el selector de idioma y el selector de tema.

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
  - Al enfocarla, despliega los resultados en una capa flotante (blanca, radio 22px, con sombra).
  - **En la portada,** el buscador compacto está oculto mientras el buscador grande del hero está en pantalla. Cuando el del hero sale por arriba, el compacto aparece (opacidad y 8px de subida, 200ms).
  - Ctrl K funciona siempre: enfoca el buscador del hero si se ve; si no, el de la cabecera.
- **Logo:** al pasar el ratón (o al enfocarlo), la Pokébola da una vuelta completa en 600ms con un ligero rebote. Con movimiento reducido no gira.
- **Móvil (< 768px):**
  - La cabecera mide 60px y muestra el logo, un botón de lupa que abre el buscador a pantalla completa, ES/EN y un botón «Menú».
  - «Menú» abre una hoja inferior con la navegación y, debajo, el **selector de tema**: el mismo control de tres segmentos, a todo el ancho de la hoja, con el icono **y su nombre visible** en cada segmento (en táctil no hay hover, así que no hay tooltip). Fuera de la hoja, la cabecera móvil no lo muestra.
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
  - Cuando hay texto escrito, a la derecha aparece un botón **×** redondo de 44px en `--surface` (etiqueta accesible «Borrar la búsqueda»). Vacía el campo y la búsqueda y devuelve el foco al campo. Sin texto no se muestra.
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
  - Es un botón redondo de 48px en `--surface` con un dado dibujado en SVG y la etiqueta accesible «Barajar otros tres».
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
  - **Regiones:** las 9 (Kanto … Paldea) en una sola fila de pastillas compactas de 40px y ancho igual, con selección única (`?gen=`), en `--step` con texto en tinta.
  - **Tipos:** «Tipos» con la nota «Hasta dos» y los 18 tipos en dos filas de 9 pastillas compactas de 40px, cada una en su `field` con el nombre en `field-ink`. Se pueden elegir hasta dos (`?types=`), porque ningún Pokémon tiene más y el filtro es la intersección; al elegir un tercero sustituye al segundo.
  - **Selección, igual en tipos y regiones (también en la hoja móvil):** una marca ✓ delante del nombre y un borde de 3px en `--ink` por dentro de la pastilla (`inset-ring`); en oscuro, sobre las pastillas de tipo, el borde va en su `field-ink` (§2.3, regla 8). No cambia el tamaño, no se sale de la pastilla ni toca a las vecinas, y no depende solo del color.
  - **Pie:** «Limpiar» y «Aplicar», alineados a la derecha bajo los tipos.
  - **Tableta (768–1023px):** las regiones pasan a dos filas (5 + 4) y los tipos a tres filas de 6.
  - Es una sección desplegable, no un diálogo: al abrir, el foco se queda en el botón «Filtros». Se cierra con el mismo botón, con «×» o con Esc, y lo no aplicado se descarta.
- **En móvil** es una hoja inferior a pantalla casi completa (un diálogo con el foco dentro), con los 18 tipos como bloques de 44px en 2 columnas y las regiones en pastillas. Si no cabe, se desplaza por dentro y el pie con «Limpiar» y «Aplicar» queda fijo abajo. Se cierra con «×», con Esc o tocando fuera.
- **«Limpiar»** (en `--step`) vacía la selección del panel; no cambia nada hasta pulsar «Aplicar».
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
  - El script es `npm run artwork-bounds`; guarda `src/data/artwork-bounds.json`, que se versiona. Solo hay que repetirlo si PokéAPI cambia el artwork o se añaden Pokémon.
  - Sin datos (formas alternativas), se cae a `object-fit: contain`.
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
  - El nombre real (`<h1>`, `--step-hero`, en `field-ink`).
  - El número, las etiquetas de tipo, la altura y el peso.
  - El selector de formas: pastillas blancas, con la activa en `--ink`. Solo formas; el variocolor va aparte (arriba).
  - Los nombres de forma con siglas se escriben como tales: «PhD», no «Phd».
- **Cambio de forma:** el campo nuevo entra como capa con fundido de opacidad (400ms) y el artwork se cruza. La URL se actualiza para que sea compartible.

**Bloques siguientes:** paneles blancos sobre el fondo, cada uno con una composición distinta.
- **Estadísticas base:** seis filas con el nombre, el valor y la barra (relleno `deep`, pista `--step`, escala sobre 255). El total va en `--step-head`.
- **Debilidades:** etiquetas de tipo en su `field` con el multiplicador (×4, ×2, ×½, ×0) dentro de la propia etiqueta.
- **Cadena evolutiva:** mini tarjetas con la misma anatomía que las de la portada (§4.3), unidas por flechas. La condición («Nivel 22», «Usar Piedra Trueno», «Intercambio») va **encima de la flecha**, en `--step-small` y 800, nunca debajo de la tarjeta.
  - **Escritorio (≥1024px):** la cadena corre de izquierda a derecha con flechas →. Si una etapa se ramifica en cadenas propias (Wurmple → Silcoon → Beautifly / Cascoon → Dustox), cada rama es una fila con su flecha, apiladas a la derecha del origen.
  - **Abanico:** cuatro o más evoluciones finales desde una misma etapa (Eevee) van en un bloque en `--ground` con una sola flecha desde el origen; la condición se pone encima de cada tarjeta. Así ninguna flecha parece salir de una hermana. Cuatro columnas desde 1280px, dos entre 1024 y 1279.
  - **Móvil:** en vertical, con flechas ↓. Las ramas van en dos columnas y el abanico, sin bloque, en una rejilla de dos.
  - **Nada se recorta:** el contenedor con scroll horizontal recorta todo lo que sale de su caja, así que ocupa también el relleno del panel (margen negativo y el mismo relleno: 24px en móvil, 40px desde 768px). El brillo de hover (hasta 46px por abajo y 28px por los lados), la subida y el aro de selección caben enteros y el recorte cae en el borde del panel, donde el brillo ya se ha desvanecido.
  - **Requisitos:** de los detalles de PokéAPI (uno por juego) manda el marcado como actual (`is_default`). Si en otros juegos también evoluciona junto a una roca (`near_special_rock`), se añade como alternativa: «Usar Piedra Hoja o subir de nivel junto a la Roca Musgo». Sylveon: «Amistad ≥ 160 · Conocer un movimiento de tipo Hada» (`known_move_type`). Una ubicación sola se muestra como «Subir de nivel en …». «Evolución especial» queda solo para lo que PokéAPI no describe.
- **Anterior y siguiente:** dos tarjetas grandes al final, cada una en el `field` del Pokémon al que lleva.

### 4.5 Tabla de tipos

**Toda la página es un panel blanco** con la tabla, y **cabe entera en 1440×900 sin scroll.**

- **Franja superior:** un título pequeño («Tabla de tipos», `<h1>` en `--step-lead`) y una línea de explicación («Las filas atacan y las columnas reciben. Toca un tipo para resaltarlo.»). Sin tarjeta grande de título, sin subtítulo y **sin leyenda**: el significado de cada celda lo da el tooltip.
- **Tooltip de celda** (solo con puntero): al pasar el ratón por una celda aparece encima un globo breve con el enfrentamiento, «Fuego → Planta: ×2» / «Fire → Grass: ×2» (×2, ×½, ×0 o ×1), con los nombres de tipo en el idioma de la página. Va en `--ink` con texto hueso, `--step-small` en 800, radio de 8px y sombra (es una capa flotante), y aparece con un fundido de 120ms. En las dos primeras y las dos últimas columnas se abre hacia dentro para no salirse de la tabla. Es CSS (`attr(data-tip)` en `globals.css`).
- **Sin selector aparte ni panel de información:** la propia matriz es el selector. Pulsar el tipo de una fila elige ese tipo **como atacante** (`?atk=`); pulsar el de una columna, **como defensor** (`?def=`). Pulsarlo otra vez quita la selección y pulsar otro la cambia. No hay resumen de debilidades ni botón «Quitar la selección». Los enlaces antiguos con `?type=` abren la fila.
- **Con selección:** la fila o columna elegida se tiñe (×1 en su `field` mezclado con blanco) y su cabecera lleva el aro en tinta; el resto de celdas baja al 50 % de opacidad y las otras cabeceras de ese eje al 65 %, para que lo atenuado se siga leyendo.
- **Guía de hover** (solo con puntero): al pasar por una celda se marcan su fila y su columna, y lo atenuado vuelve a leerse. Es CSS puro (`:has()` en `globals.css`).
  - **El aro en tinta es solo de la selección.** En hover, las cabeceras se oscurecen un poco (`brightness(0.92)`), sin borde, para que nunca parezca que hay dos tipos seleccionados.
  - **Un solo criterio de color:** la fila o columna seleccionada se tiñe con un tono claro de su tipo; la fila y columna bajo el ratón, con un gris neutro muy suave (`--ink` al 5 % sobre `--ground`), solo en las celdas ×1 que no están teñidas.
- **Aro de selección por dentro:** 3px **por dentro de la pastilla** (`inset-ring`), en la tinta de su campo: tinta sobre los tipos claros y hueso sobre los oscuros. Así nunca invade las pastillas vecinas, ni en filas ni en columnas, ni toca el borde de la tarjeta.
- **Matriz 18×18:** es una tabla real, así que se permiten líneas finas.
  - **La tabla ocupa todo el ancho del panel** (`table-fixed`): la columna de atacantes tiene ancho fijo y las 18 columnas se reparten el resto a partes iguales (unos 57px a 1440px). Celdas de 32px de alto con 3px de separación y radio de 6px; las cifras en `--step-small` y 900. En móvil la tabla tiene un ancho mínimo de 800px y se desplaza.
  - **Cabeceras de fila y columna con la misma pastilla:** 32px de alto, `--step-small` en 800 y 8px de relleno. Las de columna llenan su columna y llevan la **abreviatura de tres letras en horizontal** (Nor, Fue, Agu… / Nor, Fir, Wat…), sacada del nombre del tipo en cada idioma; el nombre completo va en `title` y para lectores de pantalla. Las de fila miden 104px y llevan el nombre completo.
  - Celdas: ×2 en `--ink` con «2» en hueso; ×½ en `--step` con «½» en tinta; ×0 en `--ink` con «0» y rayas a 45°; ×1 vacía. El multiplicador nunca depende solo del color.
- **Móvil:** la matriz va en un contenedor con scroll horizontal y la columna de tipos atacantes fija a la izquierda. **Solo ese contenedor se desplaza; la página nunca.** El contenedor es `relative` para que las etiquetas ocultas para lectores de pantalla (absolutas) queden dentro de él: si se escapaban, ensanchaban la página y el menú del header se abría desplazado.

### 4.6 Comparador

- **Dos escenarios lado a lado** (apilados en móvil), cada uno en el `field` de su Pokémon y con la anatomía de la ficha en pequeño.
- **Estadísticas enfrentadas** en un panel blanco: las barras crecen desde el eje central, cada una en el `deep` de su Pokémon. El ganador de cada estadística se marca con peso 900 y un tamaño más, no con color.
- **«Intercambiar»:** pastilla en `--ink` en el eje central, centrada sobre la junta de las dos tarjetas. El centrado vive en un envoltorio y el rebote del hover en la pastilla, porque los dos usan `translate` y el del hover pisaba al del centrado (el botón se iba hacia abajo).
- **Modal de selección:** capa flotante blanca con sombra, que usa el mismo buscador y las mismas mini tarjetas. Su zona con scroll lleva 28px de relleno lateral (32px desde 768px) y 48px abajo, para que el brillo de hover de las tarjetas no quede cortado; la cabecera del modal usa el mismo relleno lateral para alinearse con la rejilla.

### 4.7 Pie

Un pie **compacto** sobre el campo `--footer` a sangre, sin la palabra gigante. En claro es la tinta; en oscuro, un escalón por encima del fondo (`#1D2029`). Todo su texto usa las constantes `--on-dark` y `--on-dark-soft`, que valen igual en los dos temas: donde abajo dice «hueso» es `--on-dark` y donde dice `--bone-soft` es `--on-dark-soft`. Mide unos 180px de alto en escritorio y tiene un margen superior de 64px respecto al contenido.

**Fila principal:** dos extremos.
- **Izquierda:** el logo (Pokébola + «PokéData», Nunito 900, 22px, en hueso) y debajo una frase corta en `--step-small`, en `--bone-soft`: «Los 1025 Pokémon, con su artwork oficial.»
- **Derecha:** enlaces de texto en hueso, Nunito 800, `--step-small`, alineados al borde derecho.
  - Son «Pokédex», «Tipos», «Comparador» y «GitHub».
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
- Debajo, los cuatro enlaces en una fila que puede pasar a dos líneas, sin scroll lateral.
- La línea divisoria.
- Después, el aviso legal y, por último, el SHA.

### 4.8 404 y carga

- **404:** escenario en el campo de Fantasma (`#735797`, tinta hueso) con el mensaje en `--step-hero` y un botón para volver a la Pokédex.
- **Carga:** tarjetas fantasma en `--step` con la misma forma que las reales y la zona inferior reservada. No hay `animate-pulse`: aparecen con una opacidad que entra a los 300ms.

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
| Barras de estadísticas | `scaleX` de 0 a su valor al entrar en pantalla | 600ms · 70ms de escalonado |
| Controles | Pulsación `scale(0.96)` y hover con rebote | 150ms |
| Selector de tema | El relleno del segmento activo se desliza al nuevo (`transform`); el tema cambia sin fundido | 250ms con rebote · tooltip 120ms |

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
   - Sustituir el único color fijo que queda en componentes (`bg-white`, `#fff` o `rgba(21,22,28,…)`) por su token.
   - Comprobar con capturas que el modo claro no ha cambiado ni un píxel.
2. **Repaso de usos.** Cada componente que pinta sobre un campo de tipo usa `field-ink` o las constantes `--on-*`; cada texto de tipo, `--type-*-text`; cada capa flotante, `--raised`. La Pokébola pasa a colores fijos (§2.4). Así el paso 3 cambia solo variables.
3. **Valores oscuros.** El bloque oscuro de `globals.css`, en `:root[data-theme="dark"]` y en `@media (prefers-color-scheme: dark)` con `:not([data-theme="light"])`. Incluye `color-scheme`, `field-dark` de Siniestro, `glow` como `--type-*-text` y las sombras oscuras. Se prueba con el modo oscuro del sistema, sin selector todavía.
4. **Script de arranque.** El `<script>` inline en el `<head>` del layout raíz (§2.4), `suppressHydrationWarning` en `<html>` y `theme-color` con `media` en `generateViewport`. Prueba: forzar `localStorage.setItem("pokedata-theme","dark")` con el sistema en claro y recargar con la red y la CPU ralentizadas: el primer pintado ya es oscuro.
5. **Selector de escritorio** (§4.1). Grupo de radios con sol, luna y monitor, tooltip, marca del activo por `data-theme-pref`, guardado, evento `storage` y textos en `translations.ts` en los dos idiomas. Comprobar que la cabecera cabe a 768px; si no, entre 768 y 1023px el buscador compacto se queda solo en su botón de lupa de 44px.
6. **Selector en la hoja móvil.** El mismo control dentro de «Menú», con iconos y nombres visibles.
7. **Ajustes propios del oscuro.**
   - Brillo de hover de dos capas (§4.3) en tarjetas, columnas del día, mini tarjetas y anterior/siguiente.
   - Anillos de selección de las pastillas de tipo del panel de filtros en `field-ink` (§2.3, regla 8).
   - Etiquetas de tipo en `--ground` al 80 % y pastilla «Total» estrecha sobre `--on-light`.
   - Tinte de la fila o columna seleccionada de la tabla de tipos mezclado con `--surface`.
8. **Pantalla por pantalla, en oscuro:** portada (hero, día, filtros, rejilla, carga), ficha, comparador con su modal, tabla de tipos, 404 y pie. En cada una se busca lo que se quedó blanco, tinta oscura sobre fondo oscuro o una sombra que ya no se ve.
9. **Contraste verificado.** Un script (`npm run check-contrast`) recalcula desde `globals.css` las tablas del §2.1 y del §2.4 y falla si algún par baja de su umbral: 4.5:1 en texto y 3:1 en los bordes de campo y los gráficos. Las cifras de este documento salen de ese script, no a mano.
10. **Revisión.**
    - `lint.mjs` sin FAIL. Excepciones: las mismas de siempre más el halo de hover oscuro, justificado en una frase.
    - `inspect.mjs` contra `npm run dev` a 1440, 768 y 390px, en claro y en oscuro (con el sistema en oscuro y sin clave guardada).
    - Capturas de Pikachu, Glaceon, Snorlax, Sylveon, Gengar y Umbreon en los dos temas (§2.3).
    - Recorrer los tres modos con el teclado: foco visible, flechas en el selector, tooltip con el foco y Esc.
    - Cambiar el tema del sistema con la página abierta en automático: cambia sola. Con un tema forzado: no cambia.
    - Movimiento reducido: el relleno del selector no se desliza, solo cambia.
