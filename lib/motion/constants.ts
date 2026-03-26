/** Reusable Framer Motion transition presets */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN = [0.55, 0.055, 0.675, 0.19] as const;
export const EASE_IN_OUT = [0.45, 0, 0.55, 1] as const;
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

export const TRANSITION = {
  fast: { duration: 0.15, ease: EASE_OUT },
  medium: { duration: 0.2, ease: EASE_OUT },
  slow: { duration: 0.35, ease: EASE_OUT },
  reveal: { duration: 0.5, ease: EASE_OUT },
} as const;

export const SPRING = {
  smooth: { type: 'spring' as const, stiffness: 400, damping: 28 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 300, damping: 24 },
};

/** Stagger delay calculator: caps total stagger at maxMs */
export function stagger(index: number, delayPerItem = 0.06, maxMs = 0.4): number {
  return Math.min(index * delayPerItem, maxMs);
}
