import React from "react";

interface LogoProps {
  className?: string;
  symbolOnly?: boolean;
  size?: number;
}

export function LogoSymbol({ className = "h-7 w-7 text-accent", size }: { className?: string; size?: number }) {
  const sizeStyle = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 550 638"
      fill="currentColor"
      className={className}
      style={sizeStyle}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 538.00 481.00 L 477.00 446.00 L 443.00 466.00 L 389.00 570.00 L 539.00 483.00 Z M 10.00 483.00 L 145.00 562.00 L 228.00 537.00 L 73.00 446.00 L 16.00 478.00 Z M 360.00 418.00 L 219.00 501.00 L 220.00 503.00 L 275.00 535.00 L 305.00 517.00 L 311.00 512.00 Z M 0.00 311.00 L 0.00 467.00 L 63.00 431.00 L 64.00 404.00 Z M 303.00 209.00 L 394.00 394.00 L 319.00 539.00 L 276.00 564.00 L 247.00 550.00 L 166.00 574.00 L 275.00 637.00 L 360.00 587.00 L 462.00 391.00 L 386.00 259.00 Z M 549.00 168.00 L 486.00 204.00 L 485.00 231.00 L 549.00 324.00 Z M 0.00 168.00 L 0.00 279.00 L 106.00 434.00 L 198.00 490.00 L 254.00 458.00 L 149.00 394.00 L 64.00 259.00 L 64.00 205.00 Z M 294.00 179.00 L 402.00 244.00 L 485.00 376.00 L 486.00 431.00 L 549.00 467.00 L 549.00 356.00 L 445.00 204.00 L 349.00 147.00 Z M 329.00 135.00 L 276.00 104.00 L 268.00 107.00 L 241.00 123.00 L 192.00 216.00 L 321.00 141.00 Z M 159.00 66.00 L 10.00 153.00 L 73.00 190.00 L 101.00 174.00 L 106.00 170.00 Z M 296.00 85.00 L 476.00 190.00 L 539.00 153.00 L 381.00 61.00 Z M 266.00 3.00 L 187.00 50.00 L 87.00 245.00 L 164.00 378.00 L 248.00 428.00 L 156.00 241.00 Z M 360.00 49.00 L 278.00 0.00 L 276.00 1.00 L 233.00 97.00 L 276.00 72.00 Z"
      />
    </svg>
  );
}

export default function Logo({ className = "", symbolOnly = false, size = 36 }: LogoProps) {
  if (symbolOnly) {
    return <LogoSymbol size={size} className="text-accent dark:text-dark-accent" />;
  }

  return (
    <div className={`flex items-center gap-3 sm:gap-3.5 ${className}`}>
      <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-surface border border-line p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95 dark:bg-dark-surface dark:border-dark-line">
        <LogoSymbol className="h-full w-full text-accent dark:text-dark-accent" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[21px] sm:text-[23px] font-extrabold tracking-tight text-ink dark:text-dark-ink">
          pcfix
        </span>
        <span className="self-end text-[11px] sm:text-[12px] font-semibold tracking-tight text-slate-500 dark:text-slate-400 -mt-0.5">
          by shin
        </span>
      </div>
    </div>
  );
}
