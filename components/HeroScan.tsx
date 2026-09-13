"use client";

import { motion } from "framer-motion";

export default function HeroScan() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
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
        className="absolute left-1/2 top-[-100px] sm:top-[-180px] h-[520px] sm:h-[640px] w-[640px] sm:w-[1000px] -translate-x-1/2 rounded-full blur-3xl opacity-40 dark:opacity-65"
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
        className="absolute left-1/2 top-[-40px] sm:top-[-90px] h-[400px] sm:h-[480px] w-[520px] sm:w-[750px] -translate-x-1/2 rounded-full blur-3xl opacity-35 dark:opacity-50"
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
        className="absolute left-1/2 top-[140px] sm:top-[180px] h-[360px] sm:h-[420px] w-[580px] sm:w-[900px] -translate-x-1/2 rounded-full blur-[64px] sm:blur-[72px] opacity-65 dark:opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(14,165,233,0.45) 0%, rgba(99,102,241,0.38) 40%, rgba(236,72,153,0.24) 75%, transparent 100%)",
        }}
      />

      {/* Soft bottom fadeout blending smoothly into the page surface */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface dark:from-dark-surface to-transparent pointer-events-none" />
    </div>
  );
}
