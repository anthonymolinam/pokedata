# ⚡ PokéData

PokéData is a modern, fast Pokémon database built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS 4**. Engineered with a focus on performance, mobile accessibility, and seamless UX across all 1,025 official Pokémon and their alternate forms, in English and Spanish.

> **Fan-made project.** PokéData is not affiliated with, endorsed by, or connected to Nintendo, Game Freak, or Creatures. Pokémon and Pokémon character names are trademarks of their respective owners.

---

## 📸 Screenshots

<!-- TODO: add screenshots (home, filters panel, Pokémon detail, type chart, comparator, 404) -->

| Home | Pokémon detail |
| :--: | :------------: |
| _Screenshot pending_ | _Screenshot pending_ |

| Type chart | Comparator |
| :--------: | :--------: |
| _Screenshot pending_ | _Screenshot pending_ |

---

## ✨ Key Features

- **Pokémon of the Day:**
  - Three Pokémon of different types, the same for everyone during the UTC day, picked deterministically from the date.
  - A die button reshuffles three others with the same rule, without saving anything.

- **Global Search with Ctrl K / ⌘K:**
  - Compact search in the header, a large search in the home hero and a full-screen search on mobile; the shortcut focuses whichever one is visible.
  - Real-time search by Pokédex number or species name, with a results dropdown and keyboard navigation.
  - Native Spanish alias mapping with prefix and partial matching (e.g., searching `"colmi"` resolves _Great Tusk_ / _Colmilargo_; searching `"ferro"` retrieves all Future Paradox forms).
  - Diacritic-insensitive normalization (handles accents, tildes, and special punctuation).

- **Filters Panel with an Apply Button:**
  - Pick up to two types (their intersection) and one of the nine regions, then apply them with **Apply**; **Clear** resets the selection.
  - On desktop the panel unfolds inside the page at full width; on mobile it is a bottom sheet.
  - Active filters show as removable chips. Everything lives in the URL (`?types=fire,flying&gen=1&q=...`), so results are shareable and work with browser history.

- **URL-Driven Pagination:**
  - Previous / next pages through `?page=...`, combined with the search and filters, with skeleton cards while each page loads.

- **Pokémon Detail Page:**
  - Large artwork on the color of its main type, with a **Shiny** toggle and a form selector for regional forms, Mega Evolutions, Gigantamax, and battle forms without full-page reloads.
  - Base stats, type weaknesses and resistances, and previous / next Pokémon (also with the keyboard arrows).
  - Clean canonical URL resolution for multi-form PokéAPI edge cases (such as Palafin, Minior, Mimikyu, Aegislash, and Morpeko), preventing unwanted 404s.

- **Evolution Chain with Requirements:**
  - Full evolution graph supporting multi-branch paths (e.g., Eevee, Tyrogue, Applin).
  - Each step shows its condition: level, item, held item, friendship, time of day, known move, location, gender, or trade.

- **Interactive Type Chart:**
  - The full 18 × 18 effectiveness table. Select an attacking row or a defending column to highlight its matchups; the selection lives in the URL and works without JavaScript.

- **Pokémon Comparator:**
  - Two Pokémon side by side with stat bars that grow from a central axis, the winner of each stat marked, and a swap button.

- **Custom 404 Page:**
  - A Ghost-type stage with Gengar and a way back to the Pokédex.

- **English and Spanish:**
  - Every page lives under `/en` or `/es`, detected from the browser language, with translated URLs (e.g., `/es/tabla-de-tipos`, `/en/type-chart`) and a language switcher that keeps you on the same page.

- **Pop Design:**
  - Light design built on the 18 official type colors: cards, stages, and filters take the field color of their type, with contrast-checked text on each.
  - Cards with large artwork that overflows the card, normalized in size across every Pokémon from measured artwork bounds.
  - A single typeface, **Nunito**, served locally with `next/font/local`.
  - Animations powered by **Framer Motion**, with `prefers-reduced-motion` support.
  - Search inputs sized to prevent iOS viewport auto-zooming.
  - Automated Git commit SHA display in the footer for deployment traceability.

---

## 🛠️ Tech Stack

| Layer           | Technologies                                                                        |
| :-------------- | :---------------------------------------------------------------------------------- |
| **Framework**   | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)  |
| **Language**    | [TypeScript](https://www.typescriptlang.org/) (Strict Mode)                         |
| **UI**          | [React 19](https://react.dev/)                                                      |
| **Styling**     | [Tailwind CSS 4](https://tailwindcss.com/)                                          |
| **Typography**  | [Nunito](https://github.com/googlefonts/nunito) (local WOFF2 files, OFL)            |
| **Animations**  | [Framer Motion](https://www.framer.com/motion/)                                     |
| **Icons**       | [Lucide React](https://lucide.dev/)                                                 |
| **Data Source** | [PokéAPI v2](https://pokeapi.co/) with server-side caching (`next: { revalidate }`) |

---

## 📁 Project Structure

```text
scripts/
├── artwork-bounds.mjs            # Measures each artwork's opaque bounds for size normalization
└── pokemon-index.mjs             # Builds the compact Pokémon index used by the Pokémon of the Day
src/
├── app/
│   ├── [locale]/                 # Every page, under /en or /es
│   │   ├── [...not-found]/
│   │   │   └── page.tsx          # Catch-all that triggers the localized 404
│   │   ├── compare/
│   │   │   └── page.tsx          # Comparator (/en/compare, /es/comparador)
│   │   ├── pokemon/
│   │   │   └── [name]/
│   │   │       └── page.tsx      # Pokémon detail (stats, forms, weaknesses & evolution)
│   │   ├── types/
│   │   │   └── page.tsx          # Type chart (/en/type-chart, /es/tabla-de-tipos)
│   │   ├── layout.tsx            # Locale layout: Nunito, header and footer
│   │   ├── not-found.tsx         # 404 page
│   │   └── page.tsx              # Home: hero, filters, result count and grid
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # Search endpoint with multilingual aliases & pagination offset
│   ├── fonts/                    # Nunito WOFF2 files (600, 700, 800, 900) and their licence
│   ├── globals.css               # Design tokens, type colors and Tailwind theme
│   ├── robots.txt
│   └── sitemap.ts
├── components/
│   ├── common/                   # Header, footer, global search, language switcher, Poké Ball, motion
│   ├── compare/                  # Comparator stages, stat bars and Pokémon picker
│   ├── home/                     # Hero, hero search, Pokémon of the Day, filters panel and grid
│   ├── pokemon/                  # Pokémon card and its loading skeleton
│   ├── pokemon-detail/           # Detail stage, base stats, weaknesses, evolution tree and navigation
│   └── types/
│       └── TypeChart.tsx         # Interactive type chart
├── constants/
│   ├── generations.ts            # Generation boundaries and region metadata
│   ├── pokemonAliases.ts         # Spanish names and aliases for search and URLs
│   ├── routes.ts                 # Translated route slugs per locale
│   ├── translations.ts           # English and Spanish UI strings
│   ├── typeChart.ts              # Type list and effectiveness matrix
│   └── typeColors.ts             # Type colors and their contrast variants
├── data/
│   ├── artwork-bounds.json       # Generated by scripts/artwork-bounds.mjs
│   └── pokemon-index.json        # Generated by scripts/pokemon-index.mjs
├── lib/
│   ├── pokeapi.ts                # PokéAPI fetch client, server cache, and form normalizers
│   ├── home-query.ts             # Home search, filters and result count
│   ├── daily.ts / daily-server.ts # Pokémon of the Day selection
│   ├── artwork.ts                # Artwork size normalization
│   └── ...                       # Type matrix, Pokémon names, reveal and hero search helpers
└── proxy.ts                      # Locale detection and translated URL rewrites
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.9 or higher (required by Next.js 16)
- Package manager (`npm`, `pnpm`, or `yarn`)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/anthonymolinam/pokedata.git
   cd pokedata
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to `/en` or `/es` based on your browser language.

---

## ⚙️ Available Scripts

- `npm run dev` - Starts the development server with Turbopack / Fast Refresh.
- `npm run build` - Creates an optimized production build.
- `npm run start` - Boots the production server.
- `npm run lint` - Runs ESLint to check for static code errors.
- `npm run artwork-bounds` - Regenerates `src/data/artwork-bounds.json` (only needed if PokéAPI artwork changes or new Pokémon are added).
- `npm run pokemon-index` - Regenerates `src/data/pokemon-index.json`.

---

## 📄 License

This project is open-source under the [MIT](LICENSE) License. Data and assets provided by [PokéAPI](https://pokeapi.co/). Nunito is licensed under the [SIL Open Font License 1.1](src/app/fonts/OFL.txt).

PokéData is a fan-made project and is not affiliated with Nintendo, Game Freak, or Creatures. Pokémon and Pokémon character names are trademarks of Nintendo, Game Freak, and Creatures.
