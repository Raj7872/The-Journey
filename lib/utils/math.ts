// ─────────────────────────────────────────────────────────────────────────────
// Math Utilities
// Pure functions. No side effects. Used throughout engine systems.
// ─────────────────────────────────────────────────────────────────────────────

/** Linear interpolation between a and b by t (0–1) */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Normalize value from range [min, max] to [0, 1] */
export function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min), 0, 1)
}

/** Map value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return lerp(outMin, outMax, normalize(value, inMin, inMax))
}

/** Random float between min and max */
export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Random integer between min and max (inclusive) */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

// ─────────────────────────────────────────────────────────────────────────────
// Easing Functions
// All easing in the experience flows through these.
// No bounce. No elastic. Only elegant, human curves.
// ─────────────────────────────────────────────────────────────────────────────

/** Smooth ease in — accelerates from zero */
export function easeInQuad(t: number): number {
  return t * t
}

/** Smooth ease out — decelerates to zero */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

/** Smooth ease in-out */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** Stronger ease in */
export function easeInCubic(t: number): number {
  return t * t * t
}

/** Stronger ease out */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Stronger ease in-out — the primary cinematic curve */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Very smooth, cinematic — nearly linear in the middle */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

/** Exponential ease out — starts fast, decelerates elegantly */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/** The camera breathing curve — smooth sinusoidal */
export function breathe(t: number): number {
  return Math.sin(t * Math.PI * 2) * 0.5 + 0.5
}

/**
 * Derive complete atmosphere from progress (0–1).
 * This is the single function that drives all environmental state.
 * Called by TimelineDirector, not by components directly.
 */
export function deriveEnvironmentProgress(progress: number) {
  const p = clamp(progress, 0, 1)
  return {
    rainIntensity: lerp(0.85, 0.0, easeInCubic(p)),
    fogDensity: lerp(0.6, 0.05, easeInQuad(p)),
    windStrength: lerp(0.3, 0.7, easeInOutQuad(p)),
    lightWarmth: lerp(0.15, 1.0, easeInOutCubic(p)),
    lightBrightness: lerp(0.25, 1.0, easeInQuad(p)),
    clockMinute: lerp(58.0, 59.98, p),
    plantVibrancy: lerp(0.2, 1.0, easeOutCubic(p)),
    flowerDensity: p > 0.4 ? easeOutCubic((p - 0.4) / 0.6) : 0,
    dustDensity: lerp(0.3, 0.7, easeInOutSine(p)),
    steamDensity: p < 0.7 ? lerp(0.4, 0.8, p / 0.7) : lerp(0.8, 0.2, (p - 0.7) / 0.3),
    fireflyDensity: p > 0.85 ? easeOutCubic((p - 0.85) / 0.15) : 0,
  }
}
