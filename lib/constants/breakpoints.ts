// ─────────────────────────────────────────────────────────────────────────────
// Breakpoints
// Desktop is the primary experience. Tablet and mobile are fully supported.
// ─────────────────────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1440,
  ULTRA: 1920,
} as const

export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE}px)`,
  TABLET: `(max-width: ${BREAKPOINTS.TABLET}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP}px)`,
  WIDE: `(min-width: ${BREAKPOINTS.WIDE}px)`,
  REDUCED_MOTION: '(prefers-reduced-motion: reduce)',
  HOVER: '(hover: hover)',
} as const
