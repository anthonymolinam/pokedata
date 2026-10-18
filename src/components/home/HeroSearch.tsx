"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

// Espera tras la última tecla antes de buscar
const DEBOUNCE_MS = 300;

// Buscador grande del hero (DESIGN.md §4.2): pastilla de 60px con el botón
// rojo «Buscar», la acción principal de la página. La búsqueda vive en ?q=,
// junto a los filtros: sin JavaScript el formulario la envía igual.
export default function HeroSearch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hero } = getDictionary(locale);
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Si la URL cambia por otro lado (Borrar filtros, atrás), el campo la sigue
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const search = (value: string) => {
    clearTimeout(timeoutRef.current);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    const next = params.toString();
    if (next === searchParams.toString()) return;
    router.replace(`/${locale}${next ? `?${next}` : ""}`, { scroll: false });
  };

  const types = searchParams.get("types");
  const gen = searchParams.get("gen");

  return (
    <form
      role="search"
      action={`/${locale}`}
      onSubmit={(e) => {
        e.preventDefault();
        search(query);
        document.getElementById("pokedex")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="flex items-center gap-2 h-14 md:h-15 pl-5 pr-2 rounded-pill bg-ground focus-within:bg-step has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-ink motion-safe:transition-colors duration-200"
    >
      <Search aria-hidden="true" strokeWidth={2.5} className="size-5 shrink-0" />
      <label htmlFor="hero-search" className="sr-only">
        {hero.searchLabel}
      </label>
      <input
        id="hero-search"
        name="q"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => search(value), DEBOUNCE_MS);
        }}
        placeholder={hero.placeholder}
        className="flex-1 min-w-0 h-full bg-transparent font-bold text-body placeholder:text-ink-soft placeholder:font-semibold outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {/* Sin JavaScript, el formulario conserva los filtros activos */}
      {types && <input type="hidden" name="types" value={types} />}
      {gen && <input type="hidden" name="gen" value={gen} />}
      <button
        type="submit"
        className="shrink-0 h-11 md:h-12 px-5 md:px-6 rounded-pill bg-accent text-white font-extrabold cursor-pointer motion-safe:transition-transform duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-[1.04] active:scale-[0.96]"
      >
        {hero.submit}
      </button>
    </form>
  );
}
