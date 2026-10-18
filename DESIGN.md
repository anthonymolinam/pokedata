# DESIGN.md: hoja de dirección del rediseño

Rama `rediseño`. Este documento es la referencia visual para todo el trabajo de rediseño. Si el código y este documento discrepan, manda este documento, o se actualiza antes.

**Origen:** combinación de dos direcciones repartidas por `design-taste-frontend`:
- **Capítulos de color** (semilla 447273440): ficha, tabla de tipos y comparador.
- **Escenario partido / índice en filas** (semilla 1683707123): portada.

La paleta repartida ("Candy chapters") se sustituye por los **18 colores de tipo**. El tema tiene colores propios inconfundibles, así que se conservan las proporciones repartidas (un fondo, una tinta, campos a plena intensidad) y los colores salen del propio tema.

---

## 1. La idea

> En esta web, **los 18 tipos Pokémon** se convierten en **los capítulos de color que pintan cada página de borde a borde**.

- Prueba del competidor: cualquier web genérica de "enciclopedia" no puede usar esta frase. Solo funciona con un sistema de 18 colores con significado propio y oficial.
- Cada color *significa* algo. El naranja es Fuego en la ficha de Charizard, en su fila del índice, en la tabla de tipos y en el comparador.

**Elemento interactivo:** al cambiar de forma en la ficha (Mega, regional, Gigamax, forma de combate), el campo de la página entera cambia al color del tipo principal de esa forma. Por ejemplo, Marowak (Tierra) pasa a Marowak de Alola (Fuego). Funciona con el pulgar en móvil. Sin JavaScript, las formas siguen siendo enlaces normales.

---

## 2. Color

### 2.1 Tokens globales

| Token | Valor | Uso |
| --- | --- | --- |
| `--paper` | `#F7F5F0` | Fondo de la portada, de la tabla de tipos y del estado vacío |
| `--paper-step` | `#EDEAE3` | Superficie un tono por debajo del papel: filas del índice, panel de filtros |
| `--ink` | `#0A0A0A` | Tinta principal y fondo del pie |
| `--bone` | `#F7F5F0` | Tinta sobre campos oscuros (igual que `--paper`) |
| `--accent` | `#0A0A0A` | Botón principal: relleno de tinta con texto hueso |

No hay segundo acento: **el color lo aporta siempre el tipo**. El rosa actual (`rose-500`) desaparece.

**Tema oscuro:** se abandona el tema zinc oscuro fijo (`<html class="dark">`). El papel claro y los campos de tipo forman el sistema. Un tema oscuro opcional queda fuera de este alcance.

### 2.2 Los 18 tipos

Cada tipo tiene cuatro tokens:

- **`field`**: el color del tipo. Se usa como fondo de página o de bloque.
- **`field-ink`**: tinta sobre ese campo. Es negra (`--ink`) u hueso (`--bone`), la que dé más contraste. Nunca gris.
- **`step`**: el campo oscurecido un 14 %. Es la superficie secundaria *dentro* del campo: pista de las barras de estadísticas, tarjetas de evolución, selector de formas.
- **`deep`**: variante oscurecida que alcanza **≥ 4.5:1 sobre `--paper`**. Es el color del tipo cuando aparece como texto o marca *sobre papel*. Si el campo ya supera 4.5:1 sobre papel, `deep` es igual a `field`.

Contraste calculado con WCAG 2.x:

| Tipo | `field` | `field-ink` | Contraste field/ink | `step` | `deep` | `deep`/papel |
| --- | --- | --- | --- | --- | --- | --- |
| Normal | `#A8A77A` | ink | **7.99** | `#909069` | `#727253` | 4.54 |
| Fuego | `#EE8130` | ink | 7.37 | `#CD6F29` | `#A95C22` | 4.54 |
| Agua | `#6390F0` | ink | 6.39 | `#557CCE` | `#4C6FB9` | 4.50 |
| Eléctrico | `#F7D02C` | ink | **13.21** | `#D4B326` | `#836E17` | 4.58 |
| Planta | `#7AC74C` | ink | 9.52 | `#69AB41` | `#4C7B2F` | 4.61 |
| Hielo | `#96D9D6` | ink | **12.44** | `#81BBB8` | `#527776` | 4.53 |
| Lucha | `#C22E28` | bone | 5.19 | `#A72822` | `#C22E28` | 5.19 |
| Veneno | `#A33EA1` | bone | 5.12 | `#8C358A` | `#A33EA1` | 5.12 |
| Tierra | `#E2BF65` | ink | 11.19 | `#C2A457` | `#816D3A` | 4.61 |
| Volador | `#A98FF3` | ink | 7.46 | `#917BD1` | `#7664AA` | 4.62 |
| Psíquico | `#F95587` | ink | 6.30 | `#D64974` | `#C24269` | 4.51 |
| Bicho | `#A6B91A` | ink | 9.03 | `#8F9F16` | `#6A7611` | 4.58 |
| Roca | `#B6A136` | ink | 7.67 | `#9D8A2E` | `#7E6F25` | 4.60 |
| Fantasma | `#735797` | bone | 5.45 | `#634B82` | `#735797` | 5.45 |
| Dragón | `#6F35FC` | bone | 5.37 | `#5F2ED9` | `#6F35FC` | 5.37 |
| Siniestro | `#705746` | bone | 6.14 | `#604B3C` | `#705746` | 6.14 |
| Acero | `#B7B7CE` | ink | 10.07 | `#9D9DB1` | `#6E6E7C` | 4.61 |
| Hada | `#D685AD` | ink | **7.37** | `#B87295` | `#985E7B` | 4.56 |

Fondo y tinta en `#RRGGBB`. Los tokens viven en un único sitio (`src/constants/typeColors.ts` más variables CSS en `globals.css`) y nada más en el código escribe un color de tipo a mano.

Veneno, Fantasma y Dragón son violetas canónicos. Llevan el comentario `taste-skill-ignore` para que el analizador no los marque.

### 2.3 Contraste: Hielo, Normal, Eléctrico y Hada

Estos cuatro tipos son claros. **Como campo con tinta negra son de los más legibles** (de 7.4 a 13.2). El peligro aparece **cuando su color se pone sobre papel**: allí caen a 1.38–2.47, por debajo incluso del 3:1 exigido a elementos gráficos.

Reglas que lo evitan, para todos los tipos y obligatorias en estos cuatro:

1. **Ningún texto se pinta con `field` sobre papel.** El texto con color de tipo sobre papel usa siempre `deep`: Eléctrico `#836E17`, Hielo `#527776`, Normal `#727253`, Hada `#985E7B`.
2. **Todo bloque de color lleva su texto dentro, en su `field-ink`.** Una etiqueta de tipo, la celda del número en el índice o una cabecera de la tabla de tipos se identifican por su texto (≥ 7:1 en estos cuatro), no por el borde del bloque contra el papel. Así, que Eléctrico apenas se distinga del papel no borra información.
3. **No se apoya un color claro sobre otro claro sin tinta de por medio.** Por ejemplo, una etiqueta de Hada sobre el campo de Normal. Cuando etiquetas de tipo van sobre un campo de tipo (debilidades, evoluciones de otro tipo), se colocan sobre una banda `step` del campo o sobre una banda de `--ink`. Siempre llevan su propio texto.
4. **Barras de estadísticas sobre campo:** relleno en `field-ink` y pista en `step`. Nunca un relleno de color de tipo sobre un campo de tipo.
5. **No hay grises de texto.** Sobre un campo la jerarquía se hace con tamaño y peso, no con opacidad. Se prohíbe `opacity`/`/70` en texto.
6. **Foco visible:** un contorno de 3px en `field-ink`, separado 3px. Sobre papel, un contorno de 3px en `--ink`.

Comprobación antes de dar por terminada cada pantalla: capturas de los cuatro tipos. Pikachu (Eléctrico), Glaceon (Hielo), Snorlax (Normal) y Sylveon (Hada) en ficha, más sus filas del índice.

---

## 3. Tipografía: Chivo

Una sola familia: **Chivo** (Google Fonts), cargada con `next/font/google`, pesos 400, 700 y 900, subconjunto `latin` con `latin-ext` para tildes y ñ.

| Papel | Peso | Ajustes |
| --- | --- | --- |
| Display (nombre del Pokémon, títulos de página) | 900 | Mayúsculas · tracking −0.05em · interlineado 0.88 |
| Texto | 400 | Interlineado 1.45 · tracking −0.01em |
| Navegación, etiquetas de tipo, enlaces, números de fila | 700 | Sentence case (las etiquetas de tipo también: "Fuego", no "FUEGO") |

**Cinco tamaños como máximo**, todos en tokens:

```
--step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)   /* ≥ 13px: notas, pie */
--step-body:  clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)    /* 17–19px: texto, filas */
--step-lead:  clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)      /* nombre en fila, subtítulos */
--step-head:  clamp(2.5rem, 1.2rem + 5vw, 5.5rem)           /* títulos de página y de sección */
--step-hero:  clamp(3.5rem, 15vw, 12rem)                    /* nombre en la ficha */
```

- **Números:** `#0006`, estadísticas y totales van en Chivo con `font-variant-numeric: tabular-nums`. **Se elimina toda la letra monoespaciada.** Si Chivo no trae cifras tabulares, la columna numérica lleva ancho fijo.
- **El nombre nunca ocupa más de dos líneas.** Nombres largos como "Crabominable", "Fletchinder" o las formas "Urshifu Estilo Fluido": el tamaño se ajusta al número de caracteres con `min(var(--step-hero), calc(100cqi / (chars * 0.62)))`, usando unidades de contenedor. Las formas se muestran como nombre más una línea secundaria en `--step-lead`, no concatenadas.
- **Tildes en mayúscula** (POKÉDATA, PSÍQUICO, DRAGÓN): con interlineado 0.88 la tilde se sale de la línea. Hay que dar `padding-block-start: 0.08em` y no recortar con `overflow: hidden` en los títulos.
- Todo va alineado a la izquierda. El único centrado permitido es el estado vacío.

---

## 4. Pantallas

**Comunes:** márgenes laterales de 24px en móvil y 32px en escritorio. Rejilla de 12 columnas. Ancho máximo del contenido de 1440px, con los campos de color siempre a sangre. Entre secciones de una página hay 120–200px en escritorio y 72–96px en móvil.

**Componentes compartidos:**
- **Botones:** esquinas rectas (`radius: 0`), relleno plano, una decisión para toda la web.
- **Etiquetas de tipo:** bloque rectangular en `field` con el nombre en `field-ink`, Chivo 700, `--step-small`, padding de 4px por 10px. Sin bordes ni mayúsculas espaciadas.

### 4.1 Barra superior (todas las páginas)

- Barra plana con el wordmark POKÉDATA (Chivo 900), el buscador, "Tabla de tipos", "Comparador" y el selector de idioma.
- **Sin `backdrop-blur` ni bordes.** Puede ser *sticky* con fondo opaco.
- Toma el color de la página en la que está: papel en la portada y la tabla, el campo del tipo en la ficha y la tinta en el comparador.
- El desplegable del buscador es una capa flotante. Es el único sitio, junto con los modales, donde se permite sombra.

### 4.2 Portada: índice en filas (dirección B, con acento de tipo)

**Fondo papel.** El color no viene de un fondo neutro único: cada fila lleva el color de *su* tipo como acento.

**Cabecera:**
- Título "Pokédex Nacional" en `--step-head`.
- Recuento de resultados en `--step-body`, en tinta y no en gris.
- Buscador grande. Es un campo de formulario real, así que puede llevar borde de 2px en tinta.
- Filtros debajo. El de tipos son los 18 bloques de color con su texto. El seleccionado lleva un recuadro de 3px en tinta y una marca ✓ en `field-ink`, para que no dependa solo del color. El de generaciones son botones de texto con el nombre de la región.

**Filas:** sustituyen a la cuadrícula de tarjetas.

```
┌──────────┬───────┬──────────────────────────────┬──────────────────┬───────┐
│  #0006   │sprite │ Charizard                    │ [Fuego][Volador] │  534  │
│ (campo   │ 64px  │ Chivo 700 · --step-lead      │                  │ total │
│  Fuego)  │       │                              │                  │       │
└──────────┴───────┴──────────────────────────────┴──────────────────┴───────┘
```

- **Celda del número:** un bloque de unos 88px de ancho y toda la altura de la fila, relleno con el `field` del tipo principal. El número va en `field-ink` en `--step-lead`, con cifras tabulares. Es el acento de la fila y siempre se lee, incluso en Eléctrico o Hielo, porque el texto va en tinta negra dentro de su propio campo.
- **Doble tipo:** la celda del número se parte en dos franjas horizontales, 70 % del tipo principal arriba y 30 % del secundario abajo. El número va sobre la franja principal.
- **Resto de la fila:**
  - El fondo de la fila es `--paper-step`.
  - Las filas se separan 4px dejando ver el papel, sin líneas divisorias.
  - La fila mide 80px en escritorio y 72px en móvil.
- **Hover/foco:** la fila entera se rellena con el `field` del tipo principal y todo su texto pasa a `field-ink`. El sprite sube 4px. Transición de 150ms sobre la opacidad de una capa, sin `transition-all`.
- **Móvil (390px):** número, sprite, nombre y, bajo el nombre, las etiquetas. El total de estadísticas se oculta.
- **Sin filtros:** el índice se agrupa por generación. Cada grupo lleva su título ("Kanto · 1–151") en `--step-head` y el ancho completo de la página.
- **Paginación:** se mantiene la paginación por URL (`?page=`). Los botones de anterior y siguiente son rectos en tinta, y el indicador "3 / 43" va en Chivo 700, no en monoespaciada.
- **"Cargar más"** en búsquedas: un botón principal de ancho completo en `--ink`.

### 4.3 Ficha del Pokémon (dirección A)

**La página entera es el campo del tipo principal**, a sangre y desde la barra superior hasta antes del pie. Todo el texto va en `field-ink`.

**Primera pantalla**, de altura mínima `90svh`:
- El nombre en `--step-hero`, Chivo 900, en mayúsculas, pegado al borde izquierdo y en dos líneas como mucho.
- El número `#0006` en `--step-head`, en la misma tinta.
- El artwork oficial grande: unos 55 % del ancho en escritorio y el ancho completo en móvil. Va directamente sobre el campo, sin caja, sin halo ni degradado.
- El nombre nunca queda tapado por el artwork; pueden tocarse, pero no superponerse.
- Las etiquetas de tipo, la altura y el peso en `--step-body`.
- El selector de formas: botones rectos sobre `step`. La forma activa se rellena en `field-ink` con el texto en `field`.

**Cambio de forma (el elemento interactivo):**
- El campo nuevo se monta como capa encima y aparece por opacidad en 400ms, sin animar `background-color`.
- La tinta cambia al mismo tiempo si la forma pasa de un tipo con tinta negra a uno con tinta hueso.
- La URL se actualiza (`?form=` o la ruta de la variedad) para que sea compartible.

**Secciones siguientes**, todas dentro del mismo campo:
- **Estadísticas base:** seis filas con el nombre de la estadística, el valor en cifras tabulares y la barra. La barra va en `field-ink` sobre una pista `step` y se escala sobre 255. El total va en `--step-head`.
- **Debilidades:** sobre una banda `--ink` a sangre, con el texto en hueso. Las etiquetas de tipo van con su propio texto (ver regla 3 del §2.3) y el multiplicador (×4, ×2, ×½, ×0) en hueso al lado.
- **Cadena evolutiva:** cada etapa es un bloque `step` con el artwork y el nombre. La condición de evolución va como texto en `--step-small` en `field-ink`, nunca como pastilla con borde. Las etapas de otro tipo muestran su etiqueta de tipo dentro del bloque.
- **Navegación anterior/siguiente:** dos bloques grandes al final de la página, cada uno pintado con el `field` del Pokémon al que lleva. Funcionan como una vista previa del capítulo siguiente.

### 4.4 Tabla de tipos (dirección A)

**Fondo papel.** La cabecera de la página se pinta con el `field` del tipo atacante seleccionado, o con `--ink` si no hay ninguno.

- **Selector:** los 18 tipos como bloques grandes de unos 120 por 72px, con el nombre en `field-ink` y Chivo 700. Seleccionar un tipo pinta la cabecera con su campo.
- **Matriz 18×18:** es una tabla real, así que se permiten líneas finas. Las cabeceras de fila y columna son bloques de tipo con su texto.
- **Celdas:** el multiplicador nunca depende solo del color.
  - ×2: relleno `--ink` con "2" en hueso.
  - ×½: relleno `--paper-step` con "½" en tinta.
  - ×0: relleno `--ink` al 100 % con "0" en hueso y un patrón de rayas a 45°.
  - ×1: celda vacía.
- **Fila y columna activas:** se resaltan con el `step` del tipo seleccionado.
- **Móvil:** la matriz va en un contenedor con `overflow-x: auto` y la primera columna fija.

### 4.5 Comparador (dirección A)

**Pantalla partida en dos campos:**
- En escritorio, la mitad izquierda es el `field` del Pokémon 1 y la derecha el del Pokémon 2. Cada mitad lleva su `field-ink`.
- En móvil, los campos se apilan: arriba el 1 y abajo el 2.
- Antes de elegir, la mitad vacía es `--paper-step`, con el botón "Elegir Pokémon" en tinta.
- Mismo tipo en ambos lados: la mitad derecha usa `step` para que el corte se vea.

**Contenido:**
- **Cabecera de cada mitad:** el nombre en `--step-head`, Chivo 900, el artwork sobre el campo y las etiquetas.
- **Estadísticas enfrentadas:** las barras crecen hacia fuera desde el eje central, cada una en la tinta de su lado. El ganador de cada estadística se marca con su valor en Chivo 900 y en un tamaño más (`--step-lead` frente a `--step-body`). No se marca con color.
- **Botón "Intercambiar":** recto, en el eje central, en `--ink` con borde hueso de 2px. Al pulsarlo, los dos campos se cruzan con un fundido de 300ms.
- **Modal de selección:** es una capa flotante (se permite sombra) sobre papel. Los resultados usan las mismas filas del índice (§4.2).

### 4.6 Pie (todas las páginas)

- Campo `--ink` a sangre.
- **POKÉDATA** en Chivo 900 al ancho completo de la página (unos 18vw), en hueso.
- Debajo, en `--step-small`, el aviso legal, "Datos de PokéAPI", el enlace al repositorio y el SHA del commit. El SHA va en Chivo con cifras tabulares, sin monoespaciada ni pastilla con borde. El punto verde se mantiene como bloque sólido.

### 4.7 404 y carga

- **404:** campo del tipo Fantasma (`#735797`, tinta hueso) con el mensaje en `--step-head` y un enlace de vuelta al índice.
- **Carga:** papel con filas de contorno `--paper-step` estáticas. No hay `animate-pulse`: aparecen con una opacidad que entra a los 300ms.

---

## 5. Imágenes

- **Artwork oficial** (`sprites.other["official-artwork"]`) en la ficha, el comparador y la evolución.
- **Sprites** en las filas del índice y en el buscador.
- Ya están permitidos en `next.config.ts` (`raw.githubusercontent.com/PokeAPI/sprites/**`).
- Siempre se muestran sin caja, directamente sobre el campo o el papel, con `object-fit: contain`. Nunca llevan halo, degradado ni sombra.
- Un tamaño por contexto: 64px en fila, 160px en etapa evolutiva y al menos 55 % del ancho en la ficha. Se usan `sizes` correctos en `next/image`.
- Se mantiene el aviso legal del pie: el proyecto no es oficial y Pokémon pertenece a Nintendo, Creatures y GAME FREAK.

---

## 6. Movimiento

Solo se animan `transform` y `opacity`. Todo tiene una alternativa con `prefers-reduced-motion: reduce` que conserva el contenido y elimina el desplazamiento.

| Dónde | Qué | Valores |
| --- | --- | --- |
| Nombre en la ficha (movimiento principal) | Titular enmascarado: cada línea sube desde detrás de una máscara | 600ms · `cubic-bezier(0.2, 0.7, 0, 1)` · 80ms entre líneas |
| Cambio de forma | Capa del campo nuevo con fundido de opacidad y artwork con cruce | 400ms |
| Filas del índice | Entrada escalonada al cargar la página, solo las primeras 24 filas | Sube 16px · 60ms entre filas · una vez |
| Secciones de la ficha | Título, luego contenido, luego imagen al entrar en pantalla | Sube 24px · 80ms de escalonado · una vez |
| Barras de estadísticas | `scaleX` de 0 a su valor al entrar en pantalla | 500ms |
| Controles | Hover, pulsación (`scale(0.97)`) y foco visible en botones, filas, etiquetas y formas | 120–150ms |

El contenido es visible sin JavaScript: las entradas parten del estado final si el script no corre. Se mantiene Framer Motion, que ya está instalado.

---

## 7. Lo que se elimina del diseño actual

Resultado de pasar `lint.mjs` sobre `src/` antes del rediseño: **106 FAIL y 50 WARN.** Al terminar, el objetivo es **0 FAIL**. Los WARN solo se aceptan con una frase que los justifique.

| Ahora | Pasa a ser |
| --- | --- |
| Monoespaciada en números, SHA y paginación (32×) | Chivo con cifras tabulares |
| Degradados y halos de tipo (`TYPE_GLOWS`, 24×) | Campos planos. `TYPE_GLOWS` se borra |
| Sombras en reposo (21×) | Diferencia de tono (`step`). Sombra solo en desplegables y modales |
| Líneas divisorias y cajas de 1px (16× + 25×) | Espacio, `--paper-step` o el corte entre campos. Las líneas solo quedan en la matriz de tipos y en campos de formulario |
| Etiquetas diminutas en mayúsculas espaciadas (5×) | Sentence case, al menos 13px |
| Cabecera y modales con `backdrop-blur` (3×) | Barra opaca y modal opaco |
| `transition-all` (19×) | Propiedades explícitas (`transform`, `opacity`) |
| `animate-pulse` en carga y 404 | Aparición estática con retardo |
| `h-screen` | `svh` |
| Cuadrícula de 6 columnas de tarjetas iguales | Índice en filas (§4.2) |
| Esquinas `rounded-2xl` / `rounded-xl` | Esquinas rectas en todo |
| Tema zinc oscuro y acento rosa | Papel, tinta y colores de tipo |

---

## 8. Orden de trabajo

1. **Tokens:** colores de tipo (`field`/`field-ink`/`step`/`deep`), tokens globales, Chivo con `next/font` y escala tipográfica en `globals.css` (`@theme` de Tailwind v4).
2. **Barra superior y pie.**
3. **Portada:** índice en filas y filtros.
4. **Ficha:** campo, nombre, formas con cambio de color, estadísticas, debilidades y evolución.
5. **Comparador.**
6. **Tabla de tipos.**
7. **404 y carga.**
8. **Movimiento** (§6).
9. **Revisión:**
   - `lint.mjs` sin FAIL.
   - `inspect.mjs` contra `npm run dev` a 1440, 768 y 390px.
   - Capturas de Pikachu, Glaceon, Snorlax y Sylveon (§2.3) y de un tipo con tinta hueso (Gengar).
