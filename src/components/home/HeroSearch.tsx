"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { getDictionary } from "@/constants/translations";
import { isHeroSearchVisible, setHeroSearchVisible } from "@/lib/hero-search-visibility";
import { Locale } from "@/proxy";

// Espera tras la última tecla antes de buscar
const DEBOUNCE_MS = 300;

// Alto de la cabecera fija en escritorio: lo que queda debajo ya no se ve
const HEADER_HEIGHT = 72;

// Buscador grande del hero (DESIGN.md §4.2): pastilla de 60px que busca sola
// al escribir, con un botón × para borrar cuando hay texto. La búsqueda vive
// en ?q=, junto a los filtros: sin JavaScript, Intro envía el formulario.
export default function HeroSearch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hero } = getDictionary(locale);
  const urlQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Si la URL cambia por otro lado (Borrar filtros, atrás), el campo la sigue
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Publica si el buscador está en pantalla. Solo deja de estarlo al salir por
  // arriba, bajo la cabecera: entonces aparece el compacto (§4.1). La primera
  // medida va antes de pintar, para que el compacto no parpadee al cargar.
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const isVisible = (bottom: number) => bottom > HEADER_HEIGHT;
    setHeroSearchVisible(isVisible(form.getBoundingClientRect().bottom));

    const observer = new IntersectionObserver(
      ([entry]) =>
        setHeroSearchVisible(
          entry.isIntersecting || isVisible(entry.boundingClientRect.bottom),
        ),
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );
    observer.observe(form);
    return () => {
      observer.disconnect();
      setHeroSearchVisible(false);
    };
  }, []);

  // Ctrl K / ⌘K enfoca este buscador mientras se ve; si no, el de la cabecera
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      const input = inputRef.current;
      if (!input || !isHeroSearchVisible()) return;
      e.preventDefault();
      input.focus({ preventScroll: true });
      input.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      ref={formRef}
      role="search"
      action={`/${locale}`}
      onSubmit={(e) => {
        e.preventDefault();
        search(query);
        document.getElementById("pokedex")?.scrollIntoView({ behavior: "smooth" });
      }}
      className={`flex items-center gap-2 h-14 md:h-15 pl-5 ${query ? "pr-2" : "pr-5"} rounded-pill bg-ground focus-within:bg-step has-[input:focus-visible]:ring-selected motion-safe:transition-colors duration-200`}
    >
      <Search aria-hidden="true" strokeWidth={2.5} className="size-5 shrink-0" />
      <label htmlFor="hero-search" className="sr-only">
        {hero.searchLabel}
      </label>
      <input
        ref={inputRef}
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
      {query && (
        <button
          type="button"
          aria-label={hero.clear}
          onClick={() => {
            setQuery("");
            search("");
            inputRef.current?.focus();
          }}
          className="grid place-items-center size-11 shrink-0 rounded-pill bg-surface cursor-pointer motion-safe:transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:scale-[1.06] active:scale-[0.96]"
        >
          <X aria-hidden="true" strokeWidth={3} className="size-5" />
        </button>
      )}
    </form>
  );
}
