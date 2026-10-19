"use client";

import { MotionConfig } from "framer-motion";

// Movimiento reducido (DESIGN.md §6): con prefers-reduced-motion, Framer Motion
// salta los transform (desplazamientos, escalas, giros) y conserva la opacidad,
// así que todo el contenido sigue apareciendo sin viajar
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
