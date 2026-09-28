# ⚡ National Pokédex

A modern, fast, and minimalist Pokédex web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Engineered with a focus on performance, mobile accessibility, and seamless UX across all 1,025+ official Pokémon and their alternate forms.

---

## ✨ Key Features

- **Intelligent Multilingual Search (EN / ES):**
  - Real-time search by Pokédex ID or species name.
  - Native Spanish alias mapping with prefix and partial matching (e.g., searching `"colmi"` resolves _Great Tusk_ / _Colmilargo_; searching `"ferro"` retrieves all Future Paradox forms).
  - Diacritic-insensitive normalization (handles accents, tildes, and special punctuation).

- **Hybrid Pagination & Progressive Loading:**
  - Clean URL-driven query pagination (`?page=...`) for generation and type filtering, enabling shareable URLs and browser history support.
  - Client-side progressive _"Load More"_ pagination pattern for large search results, reducing DOM bloat and network payload sizes.

- **Multi-Dimensional Filtering:**
  - Intersect multiple elemental types and generation ranges (Gen 1 through Gen 9) directly via server-computed ID sets.

- **Robust Species & Form Normalization:**
  - Clean canonical URL resolution for multi-form PokéAPI edge cases (such as Palafin, Minior, Mimikyu, Aegislash, and Morpeko), preventing unwanted 404s.
  - Interactive form selector for regional forms, Mega Evolutions, Gigantamax, and battle forms without full-page reloads.

- **Recursive Evolution Tree:**
  - Full evolution graph supporting multi-branch paths (e.g., Eevee, Tyrogue, Applin).
  - Detailed badges displaying canonical evolution conditions (items, level, friendship, time of day, weather, trade, and custom battle triggers).

- **Modern Dark-Mode UX & Mobile Optimization:**
  - Sleek zinc dark-mode theme.
  - Staggered entry animations powered by **Framer Motion**.
  - Input scaling configured to prevent iOS viewport auto-zooming.
  - Automated Git commit SHA display in the footer for deployment traceability.

---

## 🛠️ Tech Stack

| Layer           | Technologies                                                                        |
| :-------------- | :---------------------------------------------------------------------------------- |
| **Framework**   | [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)     |
| **Language**    | [TypeScript](https://www.typescriptlang.org/) (Strict Mode)                         |
| **Styling**     | [Tailwind CSS](https://tailwindcss.com/)                                            |
| **Animations**  | [Framer Motion](https://www.framer.com/motion/)                                     |
| **Icons**       | [Lucide React](https://lucide.dev/)                                                 |
| **Data Source** | [PokéAPI v2](https://pokeapi.co/) with server-side caching (`next: { revalidate }`) |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # Search endpoint with multilingual aliases & pagination offset
│   ├── pokemon/
│   │   └── [name]/
│   │       └── page.tsx          # Dynamic Pokémon detail view (stats, varieties & evolution)
│   ├── layout.tsx                # Root layout with header and commit SHA footer
│   └── page.tsx                  # Home grid server component with combined filters
├── components/
│   ├── home/
│   │   ├── PokemonFiltersBar.tsx # Generation & type filter drawers
│   │   └── PokemonGrid.tsx       # Search input, animated cards & pagination controls
│   └── pokemon/
│       └── EvolutionTree.tsx     # Recursive evolution stage renderer
├── constants/
│   ├── generations.ts            # Generation boundaries and region metadata
│   └── typeColors.ts             # Tailwind color tokens per Pokémon type
└── lib/
    └── pokeapi.ts                # PokéAPI fetch client, server cache, and form normalizers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18 or higher
- Package manager (`npm`, `pnpm`, or `yarn`)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-pokedex.git
   cd your-pokedex
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Available Scripts

- `npm run dev` - Starts the development server with Turbopack / Fast Refresh.
- `npm run build` - Creates an optimized production build.
- `npm run start` - Boots the production server.
- `npm run lint` - Runs ESLint to check for static code errors.

---

## 📄 License

This project is open-source under the [MIT](LICENSE) License. Data and assets provided by [PokéAPI](https://pokeapi.co/).
