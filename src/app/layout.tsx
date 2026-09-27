import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokéData | Pokémon Encyclopedia",
  description:
    "Comprehensive Pokémon database featuring combat statistics, type matchups, and evolution paths powered by PokéAPI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col">
        <header className="border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-50 bg-zinc-950/70">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-black text-xl tracking-tight text-white hover:opacity-90 transition-opacity"
            >
              <span className="w-4 h-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
              PokéData
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Pokédex
              </Link>
              <Link
                href="/types"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Type Chart
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        {/* Legal Disclaimer / Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950/90 py-8 mt-12 text-xs text-zinc-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <p className="font-semibold text-zinc-400">
                PokéData is an unofficial fan-made project created solely for
                educational and recreational purposes.
              </p>
              <p className="leading-relaxed">
                Pokémon, character names, trademarks, and associated imagery are
                intellectual property of{" "}
                <span className="text-zinc-400 font-medium">Nintendo</span>,{" "}
                <span className="text-zinc-400 font-medium">
                  Creatures Inc.
                </span>
                , and{" "}
                <span className="text-zinc-400 font-medium">
                  GAME FREAK Inc.
                </span>{" "}
                This website is not affiliated with, endorsed, or sponsored by
                any of these entities.
              </p>
            </div>
            <div className="sm:text-right shrink-0">
              <p className="font-mono text-zinc-600">Data powered by PokéAPI</p>
              <p className="text-[11px] text-zinc-600">
                Code released under the MIT License
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
