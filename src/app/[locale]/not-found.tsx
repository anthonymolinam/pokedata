"use client";

import Link from "next/link";
import Artwork from "@/components/common/Artwork";
import { usePathname } from "next/navigation";
import { artworkUrl, figureStyle } from "@/lib/artwork";
import { getDictionary } from "@/constants/translations";
import { withSiteName } from "@/lib/metadata";

// Gengar: el Fantasma que se queda en el escenario cuando la página se esfuma
const GENGAR = 94;

// not-found no recibe props: el idioma sale de la ruta
export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "es";
  const { notFound, meta } = getDictionary(locale);

  // 404 (DESIGN.md §4.8): escenario en el campo de Fantasma, tinta hueso, con
  // un «404» gigante detrás del artwork, que flota como en la ficha, y el
  // mensaje en --step-hero con un botón para volver a la Pokédex
  return (
    <section
      aria-labelledby="not-found-title"
      data-type="ghost"
      className="card-pop relative isolate grid overflow-hidden rounded-[22px] md:rounded-[32px] bg-field text-field-ink lg:min-h-[min(64svh,620px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    >
      {/* not-found no exporta metadata: React sube este título a <head> */}
      <title>{withSiteName(meta.notFound)}</title>
      <div
        aria-hidden="true"
        className="relative h-[min(80vw,44svh)] md:h-[min(52vw,44svh)] lg:order-2 lg:h-auto [container-type:size]"
      >
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black leading-none tracking-[-0.04em] text-[min(62cqw,90cqh)] opacity-[.14] select-none num">
          404
        </span>

        <div className="absolute inset-0 float">
          <span
            className="absolute block"
            style={figureStyle(GENGAR, {
              height: "70cqh",
              maxWidth: "78cqw",
              centerX: "50%",
              centerY: "52%",
            })}
          >
            <Artwork
              src={artworkUrl(GENGAR)}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 50vh, 80vw"
              className="object-contain"
            />
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start justify-end px-5 pb-7 md:px-10 md:pb-10 lg:px-12 lg:py-12">
        <h1
          id="not-found-title"
          style={{ "--i": 4 } as React.CSSProperties}
          className="card-pop text-hero font-black"
        >
          {notFound.title}
        </h1>
        <p
          style={{ "--i": 6 } as React.CSSProperties}
          className="card-pop mt-4 max-w-[44ch] text-body"
        >
          {notFound.body}
        </p>
        <Link
          href={`/${locale}`}
          style={{ "--i": 8 } as React.CSSProperties}
          className="card-pop mt-7 inline-flex min-h-11 items-center rounded-pill bg-surface px-6 text-body font-extrabold text-ink motion-safe:transition-transform duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] motion-safe:hover:-translate-y-0.5 active:scale-[0.96]"
        >
          {notFound.back}
        </Link>
      </div>
    </section>
  );
}
