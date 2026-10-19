"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Pokeball from "@/components/common/Pokeball";
import GlobalSearchBar from "@/components/common/GlobalSearchBar";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import { getLocalizedPath } from "@/constants/routes";
import { isHeroSearchVisible, useHeroSearchVisible } from "@/lib/hero-search-visibility";
import { Locale } from "@/proxy";

// Sombra de la cabecera desplazada y de las capas flotantes (DESIGN.md §4.0)
const SCROLLED_SHADOW = "shadow-(--shadow-header)";
const SHEET_SHADOW = "shadow-(--shadow-sheet)";

const SHEET_EASE = [0.22, 0.8, 0.24, 1] as const;

interface SiteHeaderProps {
  locale: Locale;
  labels: {
    pokedex: string;
    types: string;
    compare: string;
    search: string;
    searchLabel: string;
    openSearch: string;
    closeSearch: string;
    menu: string;
    closeMenu: string;
    mainNav: string;
    home: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    themeSystemShort: string;
  };
}

export default function SiteHeader({ locale, labels }: SiteHeaderProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const heroSearchVisible = useHeroSearchVisible();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenuRef = useRef<HTMLButtonElement>(null);

  const links = [
    { key: "pokedex", href: `/${locale}`, label: labels.pokedex },
    { key: "types", href: getLocalizedPath(locale, "types"), label: labels.types },
    { key: "compare", href: getLocalizedPath(locale, "compare"), label: labels.compare },
  ];

  // La Pokédex abarca la portada y las fichas; el resto, su propia ruta
  const isActive = (key: string, href: string) =>
    key === "pokedex"
      ? pathname === href || pathname.startsWith(`/${locale}/pokemon/`)
      : pathname === href;

  // En la portada, el compacto se esconde mientras el buscador del hero se ve (§4.1)
  const hideCompactSearch = pathname === `/${locale}` && heroSearchVisible;

  // Sombra a partir de 4px de desplazamiento (§4.1)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sin buscador compacto (móvil y tableta), Ctrl K / ⌘K abre el de pantalla
  // completa, salvo en la portada mientras se ve el del hero, que es suyo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      if (!searchButtonRef.current?.getClientRects().length || isHeroSearchVisible()) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Las capas móviles se cierran al navegar
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  // Capa abierta: bloquea el scroll de la página y cierra con Escape
  const layerOpen = menuOpen || searchOpen;
  useEffect(() => {
    if (!layerOpen) return;
    const returnFocus = menuOpen ? menuButtonRef.current : searchButtonRef.current;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    // Foco a mano y no con autoFocus, que desplazaría la página
    if (menuOpen) closeMenuRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [layerOpen, menuOpen]);

  const pillButton =
    "grid place-items-center h-11 rounded-pill bg-surface text-ink font-extrabold text-small cursor-pointer hover:bg-step active:scale-[0.96] transition-transform duration-150";

  return (
    <header className="sticky top-0 z-50 bg-ground text-ink">
      {/* La sombra entra con un fundido de opacidad (200ms), nunca está en reposo arriba */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${SCROLLED_SHADOW} transition-opacity duration-200 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="shell relative flex items-center gap-2 md:gap-3 lg:gap-6 h-15 md:h-18">
        <Link
          href={`/${locale}`}
          aria-label={labels.home}
          className="group flex items-center gap-2 shrink-0 rounded-pill display text-[1.25rem] md:text-[1.5rem] leading-none"
        >
          <Pokeball className="size-7 md:size-8 motion-safe:transition-transform motion-safe:duration-600 motion-safe:ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:group-hover:rotate-360 motion-safe:group-focus-visible:rotate-360" />
          <span aria-hidden="true">PokéData</span>
        </Link>

        <nav aria-label={labels.mainNav} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map(({ key, href, label }) => {
              const active = isActive(key, href);
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`grid place-items-center h-11 px-3 lg:px-4 rounded-pill font-extrabold text-small whitespace-nowrap active:scale-[0.96] transition-transform duration-150 ${
                      active ? "bg-ink text-bone" : "hover:bg-step"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Oculto conserva su hueco: la cabecera no se mueve cuando entra. Entre 768
            y 1023px no cabe junto al selector de tema y queda solo la lupa (§4.1) */}
        <div
          inert={hideCompactSearch}
          className={`hidden lg:block ml-auto w-full max-w-60 min-w-0 transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:translate-y-0 ${
            hideCompactSearch ? "invisible opacity-0 translate-y-2" : "visible opacity-100 translate-y-0"
          }`}
        >
          <GlobalSearchBar
            locale={locale}
            placeholder={labels.search}
            label={labels.searchLabel}
          />
        </div>

        <div className="ml-auto lg:ml-0 flex items-center gap-1.5 md:gap-2 shrink-0">
          <button
            ref={searchButtonRef}
            type="button"
            aria-label={labels.openSearch}
            aria-haspopup="dialog"
            onClick={() => setSearchOpen(true)}
            className={`${pillButton} w-11 lg:hidden`}
          >
            <Search aria-hidden="true" strokeWidth={2.5} className="size-5" />
          </button>

          <LanguageSwitcher currentLocale={locale} label={labels.language} />

          {/* En móvil va dentro de la hoja del menú (§4.1) */}
          <div className="hidden md:block">
            <ThemeSwitcher
              labels={{
                theme: labels.theme,
                light: labels.themeLight,
                dark: labels.themeDark,
                system: labels.themeSystem,
              }}
            />
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={`${pillButton} px-3.5 md:hidden`}
          >
            {labels.menu}
          </button>
        </div>
      </div>

      {/* Móvil y tableta: buscador a pantalla completa */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={labels.searchLabel}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            transition={{ duration: 0.2, ease: SHEET_EASE }}
            className="fixed inset-0 z-60 bg-raised lg:hidden"
          >
            <div className="shell flex items-center gap-2 pt-2.5">
              <div className="flex-1 min-w-0">
                <GlobalSearchBar
                  locale={locale}
                  placeholder={labels.searchLabel}
                  label={labels.searchLabel}
                  variant="overlay"
                  autoFocus
                  onNavigate={() => setSearchOpen(false)}
                />
              </div>
              <button
                type="button"
                aria-label={labels.closeSearch}
                onClick={() => setSearchOpen(false)}
                className={`${pillButton} w-12 h-12 self-start bg-step`}
              >
                <X aria-hidden="true" strokeWidth={2.5} className="size-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Móvil: hoja inferior con la navegación y el selector de tema */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-60 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-on-light/40 cursor-default"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={labels.mainNav}
              initial={{ y: reduceMotion ? 0 : "100%" }}
              animate={{ y: 0 }}
              exit={{ y: reduceMotion ? 0 : "100%" }}
              transition={{ duration: 0.25, ease: SHEET_EASE }}
              className={`absolute inset-x-0 bottom-0 bg-raised text-ink rounded-t-surface ${SHEET_SHADOW} px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]`}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="display text-lead">{labels.menu}</p>
                <button
                  ref={closeMenuRef}
                  type="button"
                  aria-label={labels.closeMenu}
                  onClick={() => setMenuOpen(false)}
                  className={`${pillButton} w-11 bg-step`}
                >
                  <X aria-hidden="true" strokeWidth={2.5} className="size-5" />
                </button>
              </div>
              <nav aria-label={labels.mainNav}>
                <ul className="grid gap-1.5">
                  {links.map(({ key, href, label }) => {
                    const active = isActive(key, href);
                    return (
                      <li key={key}>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center h-14 px-5 rounded-pill font-extrabold text-lead active:scale-[0.98] transition-transform duration-150 ${
                            active ? "bg-ink text-bone" : "bg-step"
                          }`}
                        >
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="mt-4">
                <ThemeSwitcher
                  variant="sheet"
                  labels={{
                    theme: labels.theme,
                    light: labels.themeLight,
                    dark: labels.themeDark,
                    system: labels.themeSystem,
                    systemShort: labels.themeSystemShort,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
