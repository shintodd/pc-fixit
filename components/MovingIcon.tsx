"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type MovingIconAnimation =
  | "pulse"
  | "shake"
  | "gauge"
  | "flicker"
  | "bounce"
  | "spin"
  | "float"
  | "wrench";

export interface MovingIconProps {
  icon: LucideIcon;
  animation?: MovingIconAnimation;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const ANIMATION_VARIANTS: Record<MovingIconAnimation, Variants> = {
  pulse: {
    initial: { scale: 1 },
    hover: {
      scale: [1, 1.22, 0.95, 1.12, 1],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  },
  shake: {
    initial: { rotate: 0, x: 0 },
    hover: {
      rotate: [0, -10, 10, -6, 6, -2, 0],
      x: [0, -2, 2, -1, 1, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  },
  gauge: {
    initial: { rotate: 0 },
    hover: {
      rotate: [-20, 24, -12, 16, -4, 0],
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  },
  flicker: {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: [1, 1.15, 0.92, 1.1, 1],
      rotate: [0, -8, 8, -4, 4, 0],
      transition: { duration: 0.55, ease: "easeInOut" },
    },
  },
  bounce: {
    initial: { y: 0 },
    hover: {
      y: [0, -6, 0, -3, 0],
      transition: { duration: 0.45, ease: "easeOut" },
    },
  },
  spin: {
    initial: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  },
  float: {
    initial: { y: 0 },
    hover: {
      y: [0, -3, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  },
  wrench: {
    initial: { rotate: 0 },
    hover: {
      rotate: [0, -25, 20, -15, 10, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  },
};

export default function MovingIcon({
  icon: Icon,
  animation = "pulse",
  className = "h-5 w-5",
  size,
  strokeWidth = 2,
}: MovingIconProps) {
  const variants = ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.pulse;

  return (
    <motion.span
      variants={variants}
      whileHover="hover"
      className="inline-flex items-center justify-center shrink-0 origin-center select-none"
      aria-hidden="true"
    >
      <Icon className={className} size={size} strokeWidth={strokeWidth} />
    </motion.span>
  );
}
