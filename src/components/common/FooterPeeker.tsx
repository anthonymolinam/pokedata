"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { artworkUrl, figureStyle } from "@/lib/artwork";

interface FooterPeekerProps {
  id: number;
  href: string;
  label: string;
}

// El Pokémon del día asomándose por el borde del pie (DESIGN.md §4.7). La caja
// recorta por abajo justo en el borde, así que el cuerpo parece quedar detrás
// del pie: en reposo se ve el 45 % de arriba y en hover sube 10px más. Al
// entrar en pantalla sube una vez desde detrás del borde; sin JavaScript o con
// movimiento reducido aparece ya en su sitio.
export default function FooterPeeker({ id, href, label }: FooterPeekerProps) {
  const riseRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rise = riseRef.current;
    if (!rise || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      rise.dataset.state = "risen";
      observer.disconnect();
    });
    // Solo se esconde si todavía no se ve: en una página corta se queda quieto
    if (rise.getBoundingClientRect().top > window.innerHeight) {
      rise.dataset.state = "hidden";
      observer.observe(rise.parentElement ?? rise);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      href={href}
      aria-label={label}
      className="group absolute right-(--gutter) bottom-full block overflow-hidden [--peek:96px] md:[--peek:150px] w-[calc(var(--peek)*1.4)] h-(--peek) focus-visible:outline-ink"
    >
      <span
        ref={riseRef}
        className="absolute inset-0 block translate-y-[55%] data-[state=hidden]:translate-y-full motion-safe:transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
      >
        <span className="absolute inset-0 block motion-safe:transition-transform duration-[350ms] ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:group-hover:-translate-y-2.5 motion-safe:group-focus-visible:-translate-y-2.5">
          <span
            className="absolute block"
            style={figureStyle(id, {
              height: "var(--peek)",
              maxWidth: "calc(var(--peek) * 1.4)",
              centerX: "50%",
              bottom: "100%",
            })}
          >
            <Image src={artworkUrl(id)} alt="" fill sizes="220px" className="object-contain" />
          </span>
        </span>
      </span>
    </Link>
  );
}
