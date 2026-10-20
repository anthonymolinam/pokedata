"use client";

import { useRef, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  applyTheme,
  readThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeSwitcherProps {
  // systemShort: «Sistema», el nombre visible en la hoja, donde «Según el
  // sistema» no cabe; el nombre accesible sigue siendo el completo
  labels: { theme: string; light: string; dark: string; system: string; systemShort?: string };
  // header: iconos con tooltip. sheet: a todo el ancho de la hoja del menú
  // móvil, con el nombre visible (en táctil no hay hover ni tooltip)
  variant?: "header" | "sheet";
}

const OPTIONS: { pref: ThemePreference; Icon: LucideIcon }[] = [
  { pref: "light", Icon: Sun },
  { pref: "dark", Icon: Moon },
  { pref: "system", Icon: Monitor },
];

// En el servidor no se conoce la preferencia: el segmento activo lo pinta el
// CSS a partir de data-theme-pref (globals.css), y aria-checked se corrige al
// hidratar sin desajuste
const serverSnapshot = (): ThemePreference => "system";

// Selector de tema (DESIGN.md §4.1): grupo de radios con sol, luna y monitor
// sobre la misma pista que ES/EN. El nombre de cada uno va en un tooltip.
export default function ThemeSwitcher({ labels, variant = "header" }: ThemeSwitcherProps) {
  const sheet = variant === "sheet";
  const pref = useSyncExternalStore(subscribeToTheme, readThemePreference, serverSnapshot);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const names: Record<ThemePreference, string> = {
    light: labels.light,
    dark: labels.dark,
    system: labels.system,
  };

  // Como cualquier grupo de radios: las flechas mueven y eligen a la vez
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (e.key === "Escape") {
      e.currentTarget.setAttribute("data-tip-hidden", "");
      return;
    }
    if (!step) return;
    e.preventDefault();
    const next = (index + step + OPTIONS.length) % OPTIONS.length;
    applyTheme(OPTIONS[next].pref);
    buttons.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={labels.theme}
      data-variant={variant}
      className="theme-switcher relative flex items-center gap-0.5 p-1 rounded-pill bg-step"
    >
      <span
        aria-hidden="true"
        className={`theme-thumb absolute left-1 top-1 rounded-pill bg-surface ${
          sheet ? "bottom-1 w-[calc((100%-0.75rem)/3)]" : "size-9"
        }`}
      />
      {OPTIONS.map(({ pref: option, Icon }, index) => {
        const checked = pref === option;
        return (
          <button
            key={option}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={names[option]}
            tabIndex={checked ? 0 : -1}
            data-theme-option={option}
            data-tip={sheet ? undefined : names[option]}
            onClick={() => applyTheme(option)}
            onKeyDown={(e) => onKeyDown(e, index)}
            onBlur={(e) => e.currentTarget.removeAttribute("data-tip-hidden")}
            onMouseLeave={(e) => e.currentTarget.removeAttribute("data-tip-hidden")}
            className={`theme-option relative rounded-pill cursor-pointer text-ink-soft hover:text-ink active:scale-[0.96] transition-transform duration-150 ${
              sheet
                ? "flex flex-1 min-w-0 items-center justify-center gap-2 h-11 px-2 font-extrabold text-small"
                : "grid place-items-center size-9 after:absolute after:-inset-1"
            }`}
          >
            <Icon aria-hidden="true" strokeWidth={2.25} className="size-[18px] shrink-0" />
            {sheet && (
              <span aria-hidden="true" className="truncate">
                {option === "system" ? (labels.systemShort ?? names.system) : names[option]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
