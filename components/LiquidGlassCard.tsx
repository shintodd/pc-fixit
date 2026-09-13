"use client";

import React, { useState, useEffect } from "react";
import { LiquidGlass } from "quick-liquid/react";
import { useTheme } from "next-themes";

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  material?: "clear" | "thin" | "regular" | "thick" | "ultra" | "adaptive";
  borderRadius?: number;
  chromaticAberration?: number;
  refractionStrength?: number;
  bezelWidth?: number;
  thickness?: number;
  dynamicLighting?: boolean;
  liquidPress?: boolean | { scale?: number; squish?: number };
  animateIn?: boolean | number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  type?: "button" | "submit" | "reset" | string;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * Genuine Apple-style liquid glass component powered by quick-liquid.
 * Features physical SVG backdrop refraction (Snell's law), chromatic dispersion,
 * dynamic rim highlights, and liquid press squish physics.
 */
export function LiquidGlassCard({
  children,
  material = "regular",
  borderRadius = 24,
  chromaticAberration = 0.22,
  refractionStrength = 24,
  bezelWidth = 32,
  thickness = 22,
  dynamicLighting = true,
  liquidPress = false,
  animateIn = false,
  className = "",
  as = "div",
  style,
  ...props
}: LiquidGlassCardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <LiquidGlass
      as={as}
      active={mounted}
      config={{
        material,
        borderRadius,
        chromaticAberration,
        refractionStrength,
        bezelWidth,
        thickness,
        dynamicLighting,
        appearance: isDark ? "dark" : "light",
        quality: "high",
      }}
      liquidPress={liquidPress}
      animateIn={animateIn}
      className={`glass-element ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      {...props}
    >
      {children}
    </LiquidGlass>
  );
}

/**
 * Pill-shaped liquid glass capsule for navigation bars, action buttons, and control badges.
 */
export function LiquidGlassPill({
  children,
  borderRadius = 9999,
  material = "thin",
  refractionStrength = 18,
  bezelWidth = 20,
  thickness = 16,
  className = "",
  ...props
}: LiquidGlassCardProps) {
  return (
    <LiquidGlassCard
      borderRadius={borderRadius}
      material={material}
      refractionStrength={refractionStrength}
      bezelWidth={bezelWidth}
      thickness={thickness}
      className={className}
      {...props}
    >
      {children}
    </LiquidGlassCard>
  );
}

export default LiquidGlassCard;
