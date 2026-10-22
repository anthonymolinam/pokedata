"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Loader2, Search, X } from "lucide-react";
import { PokemonSummary } from "@/lib/pokeapi";
import { DailyPokemon } from "@/lib/daily";
import { artworkUrl } from "@/lib/artwork";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";
import PokemonCard from "@/components/pokemon/PokemonCard";

// Capa flotante: una de las sombras permitidas (DESIGN.md §4.0)
const LAYER_SHADOW = "shadow-(--shadow-modal)";

interface PokemonSelectModalProps {
  // Texto del botón, o su contenido entero (el hueco vacío del comparador)
  triggerLabel: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName: string;
  // Enlace al comparador con el otro lado fijo; falta el Pokémon elegido
  hrefPrefix: string;
  currentSlug: string;
  suggestions: DailyPokemon[];
  locale: Locale;
}

// Modal de selección del comparador (§4.6): su botón y el diálogo con cada
// tarjeta como enlace al comparador con ese Pokémon en su lado
export default function PokemonSelectModal({
  triggerLabel,
  triggerAriaLabel,
  triggerClassName,
  hrefPrefix,
  currentSlug,
  suggestions,
  locale,
}: PokemonSelectModalProps) {
  const { compare } = getDictionary(locale);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={triggerAriaLabel}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      <PokemonSelectDialog
        open={open}
        onClose={() => setOpen(false)}
        title={compare.selectTitle}
        locale={locale}
        suggestions={suggestions}
        hrefPrefix={hrefPrefix}
        currentSlug={currentSlug}
      />
    </>
  );
}

interface PokemonSelectDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  locale: Locale;
  // Los tres Pokémon del día; null mientras se calculan
  suggestions: DailyPokemon[] | null;
  // Comparador: cada tarjeta es un enlace con este prefijo
  hrefPrefix?: string;
  currentSlug?: string;
  // Equipo: cada tarjeta es un botón que la marca, y el pie decide qué hacer
  // con la elegida
  selected?: string | null;
  // La tarjeta marcada con la forma elegida: su artwork, sus tipos y su nombre
  selectedPreview?: PokemonSummary | null;
  onSelect?: (pokemon: PokemonSummary) => void;
  footer?: ReactNode;
}

// Diálogo de selección (§4.6 y §4.9): capa flotante blanca con el mismo
// buscador que la portada y las mismas mini tarjetas. Sin escribir nada,
// propone los tres Pokémon del día. Lo abre y lo cierra quien lo usa.
export function PokemonSelectDialog({
  open,
  onClose,
  title,
  locale,
  suggestions,
  hrefPrefix,
  currentSlug,
  selected,
  selectedPreview,
  onSelect,
  footer,
}: PokemonSelectDialogProps) {
  const { compare, common } = getDictionary(locale);
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const cleanQuery = query.trim();
  const daily: PokemonSummary[] = (suggestions ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    image: artworkUrl(p.id),
    types: p.types,
  }));
  const shown = cleanQuery ? results : daily;

  // El diálogo nativo sigue al estado de quien lo usa
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!cleanQuery) return;

    let ignore = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQuery)}&limit=24`, {
          signal: controller.signal,
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error al buscar Pokémon:", err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [cleanQuery]);

  // Esc, la X, un clic fuera o elegir un Pokémon: el foco vuelve a lo que
  // abrió el diálogo
  function handleClosed() {
    setQuery("");
    setResults([]);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      onClose={handleClosed}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
      className={`layer-in m-auto flex-col open:flex w-[min(44rem,calc(100vw-2*var(--gutter)))] max-h-[min(85svh,52rem)] max-w-none overflow-hidden rounded-[22px] bg-raised p-0 text-ink ${LAYER_SHADOW} backdrop:bg-on-light/40`}
    >
      <div data-field="raised" className="flex flex-col gap-4 px-7 py-5 md:px-8 md:py-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id={`${id}-title`} className="text-lead font-black">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={compare.close}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-pill bg-step motion-safe:transition-transform duration-150 active:scale-[0.96]"
          >
            <X aria-hidden="true" strokeWidth={2.5} className="size-5" />
          </button>
        </div>

        <div className="flex h-14 items-center gap-2 rounded-pill bg-step px-5 has-[input:focus-visible]:ring-selected">
          {loading ? (
            <Loader2 aria-hidden="true" strokeWidth={2.5} className="size-5 shrink-0 animate-spin" />
          ) : (
            <Search aria-hidden="true" strokeWidth={2.5} className="size-5 shrink-0" />
          )}
          <label htmlFor={`${id}-search`} className="sr-only">
            {compare.selectLabel}
          </label>
          <input
            ref={inputRef}
            id={`${id}-search`}
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={compare.selectPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent text-body font-bold outline-none placeholder:font-semibold placeholder:text-ink-soft [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
      </div>

      {/* Relleno de sobra para que el brillo de hover de las tarjetas (28px
          por los lados, 46px por abajo) no quede cortado por el scroll */}
      <div className="custom-scrollbar overflow-y-auto overscroll-contain px-7 pb-12 md:px-8">
        {!cleanQuery && <h3 className="text-body font-black">{compare.suggestions}</h3>}

        {cleanQuery && !loading && results.length === 0 ? (
          <p role="status" className="py-12 text-center text-body">
            {common.noResults}
          </p>
        ) : (
          <ul
            aria-busy={loading || suggestions === null || undefined}
            className="grid grid-cols-2 gap-x-3 gap-y-12 pt-12 sm:grid-cols-3"
          >
            {shown.map((pokemon) =>
              onSelect ? (
                <li key={pokemon.id}>
                  <PokemonCard
                    pokemon={pokemon.name === selected && selectedPreview ? selectedPreview : pokemon}
                    onSelect={() => onSelect(pokemon)}
                    selected={pokemon.name === selected}
                    locale={locale}
                  />
                </li>
              ) : (
                <li key={pokemon.id} onClickCapture={() => dialogRef.current?.close()}>
                  <PokemonCard
                    pokemon={pokemon}
                    href={`${hrefPrefix}${encodeURIComponent(pokemon.name)}`}
                    locale={locale}
                    current={pokemon.name === currentSlug?.toLowerCase()}
                  />
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {footer}
    </dialog>
  );
}
