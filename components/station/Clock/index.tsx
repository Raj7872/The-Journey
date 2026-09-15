'use client'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getHourHandDegrees, getMinuteHandDegrees } from '@/lib/utils/time'

interface ClockProps {
  size?: number   // diameter in px, default 70
  showLabel?: boolean
}

/**
 * Clock
 *
 * The station clock. Driven by TimelineDirector's clockMinute value.
 * Moves from 11:58 toward midnight as the player explores.
 * Freezes during the proposal. Snaps to 12:00 after YES.
 *
 * The clock is symbolic — it tells the story, not the time.
 */
export function Clock({ size = 70, showLabel = true }: ClockProps) {
  const { timeline } = useTimeline()
  const reducedMotion = useReducedMotion()

  const { clockMinute } = timeline
  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  const hourDeg = getHourHandDegrees(11, clockMinute)
  const minuteDeg = getMinuteHandDegrees(clockMinute)

  // At midnight (60+): the clock permanently reads 12:00
  const isMidnight = clockMinute >= 60
  const displayH = isMidnight ? '12' : '11'
  const displayM = isMidnight ? '00' : String(Math.floor(clockMinute)).padStart(2, '0')
  const displayLabel = `${displayH}:${displayM}`

  const r = Math.round(160 + warmth * 52)
  const g = Math.round(120 + warmth * 26)
  const b = Math.round(42 + (1 - warmth) * 20)

  const borderAlpha = 0.2 + brightness * 0.3
  const rimColor = `rgba(${r},${g},${b},${borderAlpha})`
  const handColor = `rgba(242,232,213,${0.4 + brightness * 0.5})`
  const centerColor = `rgba(${r},${g},${b},${0.5 + brightness * 0.4})`

  const transitionDuration = reducedMotion ? '0s' : '1s'

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      aria-label={`Station clock showing ${displayLabel}`}
      role="img"
    >
      {/* Clock face */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1.5px solid ${rimColor}`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `border-color ${transitionDuration} ease`,
        }}
      >
        {/* Inner rim */}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            border: `1px solid rgba(${r},${g},${b},${borderAlpha * 0.5})`,
          }}
          aria-hidden="true"
        />

        {/* Hour hand */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: '50%',
            width: 2,
            height: size * 0.28,
            marginLeft: -1,
            background: handColor,
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: `rotate(${hourDeg}deg)`,
            transition: `transform ${transitionDuration} ease, background ${transitionDuration} ease`,
          }}
          aria-hidden="true"
        />

        {/* Minute hand */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: '50%',
            width: 1.5,
            height: size * 0.36,
            marginLeft: -0.75,
            background: `rgba(242,232,213,${0.3 + brightness * 0.4})`,
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: `rotate(${minuteDeg}deg)`,
            transition: `transform ${transitionDuration} ease`,
          }}
          aria-hidden="true"
        />

        {/* Centre dot */}
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: centerColor,
            position: 'relative',
            zIndex: 2,
            transition: `background ${transitionDuration} ease`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Label */}
      {showLabel && (
        <div
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 12,
            color: `rgba(${r},${g},${b},${0.4 + brightness * 0.3})`,
            letterSpacing: '1.5px',
            transition: `color ${transitionDuration} ease`,
          }}
          aria-hidden="true"
        >
          {displayLabel}
        </div>
      )}
    </div>
  )
}
