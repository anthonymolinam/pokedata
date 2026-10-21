"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Die from "@/components/common/Die";

const BOUNCE = [0.34, 1.56, 0.64, 1] as const;

// Botón del equipo aleatorio (§4.9): el dado del Pokémon del día (§4.2) junto a
// «Compartir enlace», redondo de 44px en --surface. Gira con rebote al pulsarlo
export default function RandomTeamButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [spins, setSpins] = useState(0);

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => {
        setSpins((n) => n + 1);
        onClick();
      }}
      animate={{ rotate: reduceMotion ? 0 : spins * 360 }}
      transition={{ duration: 0.5, ease: BOUNCE }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      className="grid place-items-center size-11 shrink-0 rounded-pill bg-surface cursor-pointer disabled:opacity-35 disabled:cursor-default"
    >
      <Die />
    </motion.button>
  );
}
