import Link from "next/link";
import Pokeball from "@/components/common/Pokeball";
import { getLocalizedPath } from "@/constants/routes";
import { getDictionary } from "@/constants/translations";
import { Locale } from "@/proxy";

const REPO_URL = "https://github.com/anthonymolinam/pokedata";

// Enlace de texto del pie (§4.7): en hover el texto sube 2px, el subrayado solo en el foco
const footerLink =
  "group inline-flex items-center h-11 rounded-pill text-small underline-offset-4 decoration-2 focus-visible:underline";
const lift =
  "inline-block motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:-translate-y-0.5";

export default function SiteFooter({ locale }: { locale: Locale }) {
  const { nav, footer } = getDictionary(locale);

  const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const shortSha = commitSha ? commitSha.slice(0, 7) : "dev";
  const commitUrl = commitSha ? `${REPO_URL}/commit/${commitSha}` : REPO_URL;

  const links = [
    { key: "pokedex", href: `/${locale}`, label: nav.pokedex },
    { key: "types", href: getLocalizedPath(locale, "types"), label: nav.types },
    { key: "compare", href: getLocalizedPath(locale, "compare"), label: nav.compare },
    { key: "team", href: getLocalizedPath(locale, "team"), label: nav.team },
  ];

  // Pie compacto (DESIGN.md §4.7): campo --footer a sangre con dos filas,
  // marca y enlaces arriba, aviso legal y versión abajo
  return (
    <footer data-field="footer" className="mt-16 bg-field text-field-ink">
      <div className="shell py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
          <div>
            <p className="flex items-center gap-2 display text-[1.375rem] leading-none">
              <Pokeball className="size-7" />
              PokéData
            </p>
            <p className="mt-2 text-small text-on-dark-soft">{footer.tagline}</p>
          </div>

          <nav aria-label={footer.nav}>
            <ul className="flex flex-wrap gap-x-5 md:justify-end">
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
        </div>

        <div className="mt-6 pt-4 border-t border-on-dark/15 flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="text-small text-on-dark-soft">
            {footer.legal}{" "}
            <a
              href="https://pokeapi.co"
              className="font-extrabold text-on-dark underline-offset-4 decoration-2 hover:underline focus-visible:underline"
            >
              {footer.pokeapi}
            </a>
            .
          </p>

          <a
            href={commitUrl}
            aria-label={`${footer.version} ${shortSha}`}
            className={`${footerLink} shrink-0 self-start md:self-auto font-bold num gap-2`}
          >
            <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
            <span className={lift}>{shortSha}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
