"use client";

import { motion } from "framer-motion";

export default function HeroScan() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden select-none"
    >
      {/* Precision micro-grid background pattern with radial mask */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 65% at 50% 25%, #000 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 65% at 50% 25%, #000 50%, transparent 100%)",
        }}
      />

      {/* Cybernetic horizontal light horizon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 dark:via-blue-400/40 to-transparent" />

      {/* Primary cyan/blue ambient aurora orb */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.96, 1],
          opacity: [0.35, 0.5, 0.4, 0.35],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-180px] h-[640px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl opacity-40 dark:opacity-65"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.28) 0%, rgba(14,165,233,0.16) 45%, transparent 75%)",
        }}
      />

      {/* Secondary violet/indigo accent orb */}
      <motion.div
        animate={{
          x: [-24, 24, -24],
          y: [-12, 16, -12],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-90px] h-[480px] w-[750px] -translate-x-1/2 rounded-full blur-3xl opacity-35 dark:opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.24) 0%, rgba(236,72,153,0.12) 50%, transparent 75%)",
        }}
      />

      {/* Central chromatic aurora wash directly illuminating the hero search liquid glass */}
      <motion.div
        animate={{
          scale: [1, 1.08, 0.96, 1],
          opacity: [0.5, 0.7, 0.55, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[180px] h-[420px] w-[900px] max-w-[96vw] -translate-x-1/2 rounded-full blur-[72px] opacity-60 dark:opacity-55"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(14,165,233,0.45) 0%, rgba(99,102,241,0.38) 40%, rgba(236,72,153,0.24) 75%, transparent 100%)",
        }}
      />
    </div>
  );
}
