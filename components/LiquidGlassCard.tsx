"use client";

import React, { ElementType } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  borderRadius?: number;
  liquidPress?: boolean | { scale?: number; squish?: number };
  className?: string;
  as?: keyof React.JSX.IntrinsicElements | any;
  type?: "button" | "submit" | "reset" | string;
  disabled?: boolean;
  role?: string;
  [key: string]: any;
}

/**
 * Genuine Apple-style liquid glass component.
 * Features high-transmittance optical frosted glass, dual-lobe specular rim lighting,
 * subtle bottom refractive lip, deep ambient drop shadow, and tactile liquid squish physics.
 */
export function LiquidGlassCard({
  children,
  borderRadius = 24,
  liquidPress = false,
  className = "",
  as = "div",
  style,
  ...props
}: LiquidGlassCardProps) {
  const Component = as as ElementType;

  if (liquidPress && (as === "button" || as === "div")) {
    const scaleFactor = typeof liquidPress === "object" && liquidPress.scale ? liquidPress.scale : 0.97;
    return (
      <motion.button
        type={props.type as any || "button"}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: scaleFactor }}
        transition={{ type: "spring", stiffness: 450, damping: 24 }}
        className={`apple-liquid-glass ${className}`}
        style={{
          borderRadius: `${borderRadius}px`,
          ...style,
        }}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <Component
      className={`apple-liquid-glass ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Pill-shaped liquid glass capsule for command bars, action pills, and floating inputs.
 */
export function LiquidGlassPill({
  children,
  borderRadius = 9999,
  className = "",
  ...props
}: LiquidGlassCardProps) {
  return (
    <LiquidGlassCard
      borderRadius={borderRadius}
      className={className}
      {...props}
    >
      {children}
    </LiquidGlassCard>
  );
}

export default LiquidGlassCard;

