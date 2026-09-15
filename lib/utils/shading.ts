// ─────────────────────────────────────────────────────────────────────────────
// Shading Utilities
// Small, reusable pseudo-3D helpers for otherwise-flat CSS props — a soft
// ground-contact shadow and a light-top-to-dark-bottom face gradient.
// Applied consistently so furniture across scenes reads as having volume
// and weight rather than being a flat colored rectangle.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'

/**
 * A blurred shadow anchored beneath an object to ground it in the scene.
 * Position the parent `relative` and place this as the first child.
 */
export function groundShadow(width: number, opacity = 0.35): CSSProperties {
  return {
    position: 'absolute',
    bottom: -Math.round(width * 0.08),
    left: '50%',
    transform: 'translateX(-50%)',
    width,
    height: Math.round(width * 0.26),
    borderRadius: '50%',
    background: `radial-gradient(ellipse, rgba(0,0,0,${opacity}) 0%, transparent 72%)`,
    pointerEvents: 'none',
  }
}

/**
 * A light-top → dark-bottom gradient for a box face, given a base RGB triple.
 * Suggests an object catching ambient light from above instead of a flat fill.
 */
export function faceGradient(r: number, g: number, b: number, alpha = 0.9, lightAmount = 18): string {
  const hi = (n: number) => Math.min(n + lightAmount, 255)
  const lo = (n: number) => Math.max(n - lightAmount, 0)
  return `linear-gradient(180deg, rgba(${hi(r)},${hi(g)},${hi(b)},${alpha}) 0%, rgba(${r},${g},${b},${alpha}) 45%, rgba(${lo(r)},${lo(g)},${lo(b)},${alpha}) 100%)`
}

/**
 * A subtle lighter strip along the top edge of a box, standing in for a
 * distinct top face catching more light than the front. Use as a top border.
 */
export function topEdgeHighlight(r: number, g: number, b: number, alpha = 0.5): string {
  const hi = (n: number) => Math.min(n + 35, 255)
  return `1px solid rgba(${hi(r)},${hi(g)},${hi(b)},${alpha})`
}

/**
 * A faint repeating-line grain pass for wood surfaces. Layer this as a
 * second `background` (or `backgroundImage`) on top of `faceGradient` —
 * the gradient supplies the light, this supplies the material.
 */
export function woodGrain(angle = 90, opacity = 0.05): string {
  return `repeating-linear-gradient(${angle}deg, rgba(10,6,3,${opacity}) 0px, rgba(10,6,3,${opacity}) 1px, transparent 2px, transparent 6px)`
}

/**
 * A soft specular highlight for brass/metal surfaces, positioned toward
 * whatever's lighting the object. Layer on top of a metal `faceGradient`.
 */
export function specularHighlight(x = '30%', y = '20%', size = '65%', opacity = 0.5): string {
  return `radial-gradient(ellipse ${size} ${size} at ${x} ${y}, rgba(255,244,214,${opacity}) 0%, transparent 70%)`
}

/**
 * A faint repeating-dot weave for fabric (seats, curtains, coats) — duller
 * and lower-contrast than wood or metal, since cloth absorbs light rather
 * than catching it.
 */
export function fabricWeave(opacity = 0.05): string {
  return `repeating-radial-gradient(circle at 2px 2px, rgba(0,0,0,${opacity}) 0px, transparent 1.5px, transparent 4px)`
}

/**
 * Extremely faint horizontal fiber lines for paper — letters, notebooks,
 * napkins. Layer on top of the paper's base fill color.
 */
export function paperFiber(opacity = 0.035): string {
  return `repeating-linear-gradient(0deg, rgba(60,45,25,${opacity}) 0px, transparent 1px, transparent 3px)`
}

/**
 * A soft radial "pool" of light, composited over nearby surfaces rather
 * than baked into any one object's own color — the same lamp or window
 * light should fall across the table, the wall, and the floor consistently
 * instead of every object separately guessing its own brightness.
 */
export function lightPool(x: string, y: string, colorRgba: string, size = '55%'): string {
  return `radial-gradient(circle ${size} at ${x} ${y}, ${colorRgba}, transparent 70%)`
}
