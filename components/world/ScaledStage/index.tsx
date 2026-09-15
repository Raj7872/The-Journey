'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface ScaledStageProps {
  children: ReactNode
}

// The size every scene was actually composed and tuned at. Nothing about
// this number is special — it's just the reference frame the whole app's
// absolute-positioned layouts assume.
const STAGE_WIDTH = 1440
const STAGE_HEIGHT = 900

/**
 * ScaledStage
 *
 * Every scene in this app is a fixed composition — absolute-positioned
 * elements tuned to sit exactly where they sit, the same way a stage play
 * or a hand-drawn scene is blocked once and never reflows. Handing that
 * straight to an arbitrary browser window (a narrower laptop, a tablet in
 * portrait) doesn't make it "responsive" — it makes elements that were
 * never designed to move independently drift into each other.
 *
 * This locks the whole experience to one fixed-size canvas and uniformly
 * scales that canvas to fit the real window (contain, not cover — never
 * cropped), centered, letterboxed on whichever axis has room to spare.
 * The composition itself never changes; only its size does. Nothing
 * inside ever needs to know this exists.
 *
 * Deliberately does NOT wrap real-viewport-pixel-tracking UI (the custom
 * cursor, debug/settings panels, the notebook) — a `transform` on an
 * ancestor changes the containing block for `position: fixed` descendants,
 * which would misalign anything positioned from raw `clientX`/`clientY`.
 */
export function ScaledStage({ children }: ScaledStageProps) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function updateScale() {
      const s = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT)
      setScale(s)
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    window.addEventListener('orientationchange', updateScale)
    return () => {
      window.removeEventListener('resize', updateScale)
      window.removeEventListener('orientationchange', updateScale)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050608',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
