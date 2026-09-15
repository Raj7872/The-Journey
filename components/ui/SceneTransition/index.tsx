'use client'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { Z_INDEX } from '@/lib/constants/zIndex'

/**
 * SceneTransition
 *
 * A fullscreen overlay that fades in/out during scene transitions.
 * Uses the TimelineDirector's isTransitioning flag.
 * Never instant — always a smooth crossfade.
 * Color shifts from dark (night) to bright (sunrise) with lighting.
 *
 * Opacity is derived directly from timeline state during render rather than
 * mirrored into local state via an effect — transitionProgress changes every
 * animation frame, and an effect-based mirror would double each frame's
 * render count (the update, then the effect-triggered re-render), which is
 * enough concurrent per-frame setState traffic to trip React's nested-update
 * guard during a transition.
 */
export function SceneTransition() {
  const { timeline } = useTimeline()

  const overlayOpacity = timeline.isTransitioning
    ? timeline.transitionProgress < 0.5
      ? timeline.transitionProgress * 2 * 0.85
      : (1 - timeline.transitionProgress) * 2 * 0.85
    : 0

  if (overlayOpacity < 0.01) return null

  // Transition color tinted by current lighting (dark night vs warm sunrise)
  const warmth = timeline.lightingProfile.warmth
  const r = Math.round(5 + warmth * 8)
  const g = Math.round(6 + warmth * 5)
  const b = Math.round(8 + warmth * 2)
  const overlayColor = `rgb(${r},${g},${b})`

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.TRANSITION,
        background: overlayColor,
        opacity: overlayOpacity,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
