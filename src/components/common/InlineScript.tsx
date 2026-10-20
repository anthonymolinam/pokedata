"use client";

// Script inline que solo corre al cargar el HTML. En el cliente React lo
// renderiza como text/plain: así no avisa de que encontró un <script> (no lo
// ejecutaría) y suppressHydrationWarning acepta el cambio de tipo. Patrón de
// node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
