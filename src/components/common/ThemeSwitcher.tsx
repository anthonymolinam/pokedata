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
  labels: { theme: string; light: string; dark: string; system: string };
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
export default function ThemeSwitcher({ labels }: ThemeSwitcherProps) {
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
      className="theme-switcher relative flex items-center gap-0.5 p-1 rounded-pill bg-step"
    >
      <span aria-hidden="true" className="theme-thumb absolute left-1 top-1 size-9 rounded-pill bg-surface" />
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
            data-tip={names[option]}
            onClick={() => applyTheme(option)}
            onKeyDown={(e) => onKeyDown(e, index)}
            onBlur={(e) => e.currentTarget.removeAttribute("data-tip-hidden")}
            onMouseLeave={(e) => e.currentTarget.removeAttribute("data-tip-hidden")}
            className="theme-option relative grid place-items-center size-9 rounded-pill cursor-pointer text-ink-soft hover:text-ink active:scale-[0.96] transition-transform duration-150 after:absolute after:-inset-1"
          >
            <Icon aria-hidden="true" strokeWidth={2.25} className="size-[18px]" />
          </button>
        );
      })}
    </div>
  );
}
