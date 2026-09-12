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
          opacity: [0.15, 0.25, 0.18, 0.15],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-260px] h-[720px] w-[1100px] -translate-x-1/2 rounded-full blur-3xl opacity-20 dark:opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(14,165,233,0.06) 50%, transparent 75%)",
        }}
      />

      {/* Secondary violet/indigo accent orb */}
      <motion.div
        animate={{
          x: [-30, 30, -30],
          y: [-15, 20, -15],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-140px] h-[450px] w-[700px] -translate-x-1/2 rounded-full blur-3xl opacity-15 dark:opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
