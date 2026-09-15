'use client'

import { useEffect, useState } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useAmbientEvent } from '@/engine/AmbientEventManager/AmbientEventContext'
import { TIMING } from '@/lib/constants/timing'

interface AmbientLightProps {
  size?: 'small' | 'medium' | 'large'
  style?: React.CSSProperties
  /** Flicker delay offset in seconds so lamps don't all flicker together */
  flickerOffset?: number
}

/**
 * AmbientLight
 *
 * An old station lamp. Warm. Slightly imperfect.
 * Flickers gently — not broken, simply old.
 * Brightness responds to TimelineDirector's lighting profile.
 */
export function AmbientLight({
  size = 'medium',
  style,
  flickerOffset = 0,
}: AmbientLightProps) {
  const { timeline } = useTimeline()
  const reducedMotion = useReducedMotion()
  const { currentEvent } = useAmbientEvent()
  const [swaying, setSwaying] = useState(false)

  useEffect(() => {
    if (currentEvent?.type !== 'lamp-sway') return
    setSwaying(true)
    const t = setTimeout(() => setSwaying(false), TIMING.AMBIENT_EVENT_DURATION)
    return () => clearTimeout(t)
  }, [currentEvent])

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  // Interpolate lamp color: cold blue → warm amber
  const r = Math.round(140 + warmth * 72)
  const g = Math.round(100 + warmth * 32)
  const b = Math.round(40 + (1 - warmth) * 40)
  const lampColor = `rgb(${r},${g},${b})`

  const sizes = {
    small:  { stem: 30, dot: 6,  glow: 14 },
    medium: { stem: 55, dot: 10, glow: 24 },
    large:  { stem: 80, dot: 14, glow: 36 },
  }
  const s = sizes[size]

  const glowOpacity = brightness * 0.7
  const glowSpread = s.glow * brightness

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
      aria-hidden="true"
    >
      {/* Sway wrapper — kept separate from the outer div so a caller's own
          positioning transform (translateX for parallax, etc.) never gets
          clobbered by this one. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transformOrigin: 'top center',
          animation: swaying && !reducedMotion ? 'lamp-sway 2.4s ease-in-out' : 'none',
        }}
      >
        {/* Lamp glow orb */}
        <div
          style={{
            width: s.dot,
            height: s.dot,
            borderRadius: '50%',
            background: lampColor,
            opacity: brightness * 0.9,
            boxShadow: `
              0 0 ${glowSpread}px ${glowSpread / 2}px rgba(${r},${g},${b},${glowOpacity * 0.6}),
              0 0 ${glowSpread * 2.5}px ${glowSpread}px rgba(${r},${g},${b},${glowOpacity * 0.2})
            `,
            animation: reducedMotion
              ? 'none'
              : `lamp-flicker 4s ease-in-out ${flickerOffset}s infinite`,
            transition: 'box-shadow 2s ease, opacity 2s ease',
            flexShrink: 0,
          }}
        />

        {/* Stem */}
        <div
          style={{
            width: 1.5,
            height: s.stem,
            background: `rgba(${r},${g},${b},${brightness * 0.35})`,
            transition: 'background 2s ease',
            flexShrink: 0,
          }}
        />
      </div>

      <style>{`
        @keyframes lamp-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          75% { transform: rotate(4deg); }
        }
      `}</style>
    </div>
  )
}
