"use client";

import { motion } from "framer-motion";

export default function HeroScan() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Precision micro-grid background pattern representing motherboard circuit grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage: `radial-gradient(#2563eb 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 65% at 50% 25%, #000 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 65% at 50% 25%, #000 50%, transparent 100%)",
        }}
      />

      {/* Clean horizontal circuit datum line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-blue-500/25 dark:via-blue-400/35 to-transparent" />

      {/* Restrained technical ambient glow focused on hero input area */}
      <motion.div
        animate={{
          scale: [1, 1.05, 0.98, 1],
          opacity: [0.35, 0.45, 0.38, 0.35],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-100px] sm:top-[-160px] h-[480px] sm:h-[580px] w-[600px] sm:w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-35 dark:opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 45%, rgba(37,99,235,0.22) 0%, rgba(14,165,233,0.10) 50%, transparent 80%)",
        }}
      />

      {/* Soft bottom fadeout into page surface */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface dark:from-dark-surface to-transparent pointer-events-none" />
    </div>
  );
}
