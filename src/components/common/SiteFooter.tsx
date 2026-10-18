import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import Pokeball from "@/components/common/Pokeball";
import FooterPeeker from "@/components/common/FooterPeeker";
import { getDailyPokemon } from "@/lib/daily-server";
import { formatPokemonDisplayName } from "@/lib/pokeapi";
import { CANONICAL_TO_SPANISH } from "@/constants/pokemonAliases";
import { getLocalizedPath } from "@/constants/routes";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

const REPO_URL = "https://github.com/anthonymolinam/pokedata";

// Enlace de texto del pie (§4.7): en hover el texto sube 2px, el subrayado solo en el foco
const footerLink =
  "group inline-flex items-center h-11 rounded-pill text-small underline-offset-4 decoration-2 focus-visible:underline";
const lift =
  "inline-block motion-safe:transition-transform motion-safe:duration-150 group-hover:-translate-y-0.5";

export default function SiteFooter({ locale }: { locale: Locale }) {
  const { nav, footer } = getDictionary(locale);

  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const shortSha = commitSha ? commitSha.slice(0, 7) : "dev";
  const commitUrl = commitSha ? `${REPO_URL}/commit/${commitSha}` : REPO_URL;

  const links = [
    { key: "pokedex", href: `/${locale}`, label: nav.pokedex },
    { key: "types", href: getLocalizedPath(locale, "types"), label: nav.types },
    { key: "compare", href: getLocalizedPath(locale, "compare"), label: nav.compare },
  ];

  // Pie compacto (DESIGN.md §4.7): campo de tinta a sangre, unos 160px en
  // escritorio y 96px por encima para el Pokémon del día que se asoma
  return (
    <footer data-field="ink" className="mt-24 bg-field text-field-ink">
      <div className="shell relative py-8">
        <Suspense fallback={null}>
          <DailyPeeker locale={locale} />
        </Suspense>

        <div className="grid gap-y-4 md:grid-cols-3 md:items-center md:gap-x-8">
          <div>
            <p className="flex items-center gap-2 display text-[1.375rem] leading-none">
              <Pokeball className="size-7" />
              PokéData
            </p>
            <p className="mt-2 text-small text-bone-soft">{footer.tagline}</p>
          </div>

          <nav aria-label={footer.nav}>
            <ul className="flex flex-wrap gap-x-5">
              {links.map(({ key, href, label }) => (
                <li key={key}>
                  <Link href={href} className={`${footerLink} font-extrabold`}>
                    <span className={lift}>{label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${footerLink} font-extrabold`}
                >
                  <span className={lift}>
                    {footer.github}
                    <span aria-hidden="true"> ↗</span>
                    <span className="sr-only"> {footer.newTab}</span>
                  </span>
                </a>
              </li>
            </ul>
          </nav>

          <a
            href={commitUrl}
            aria-label={`${footer.version} ${shortSha}`}
            className={`${footerLink} font-bold num gap-2 md:justify-self-end`}
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
            <span className={lift}>{shortSha}</span>
          </a>
        </div>

        <p className="mt-6 max-w-[72ch] text-small text-bone-soft">
          {footer.legal}{" "}
          <a
            href="https://pokeapi.co"
            className="font-extrabold text-bone underline-offset-4 decoration-2 hover:underline focus-visible:underline"
          >
            {footer.pokeapi}
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

// El primero de los tres Pokémon del día, el mismo en todas las páginas. Se
// calcula en cada petición para que cambie a las 00:00 UTC aunque la página
// sea estática.
async function DailyPeeker({ locale }: { locale: Locale }) {
  await connection();
  const [first] = getDailyPokemon();
  const { hero } = getDictionary(locale);
  const slug = (locale === "es" && CANONICAL_TO_SPANISH[first.name]) || first.name;

  return (
    <FooterPeeker
      id={first.id}
      href={`/${locale}/pokemon/${slug}`}
      label={`${hero.footerPeek} ${formatPokemonDisplayName(first.name)}`}
    />
  );
}
