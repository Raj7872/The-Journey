'use client'

import { type ReactNode } from 'react'

import { useInteractiveObject } from '@/hooks/useInteractiveObject'
import type { CursorState } from '@/types/cursor'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { Z_INDEX } from '@/lib/constants/zIndex'

interface StationObjectProps {
  children: ReactNode
  label: string            // Accessibility label
  hint?: string            // Hover hint text (e.g. "Letters on the bench")
  onClick?: () => void
  hoverCursorState?: CursorState
  isCollected?: boolean
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
}

/**
 * StationObject
 *
 * The base wrapper for every interactive element in the station.
 * Provides consistent hover, focus, click, and accessibility behaviour.
 * Subtle glow on hover — never flashy.
 */
export function StationObject({
  children,
  label,
  hint,
  onClick,
  hoverCursorState = 'hover',
  isCollected = false,
  disabled = false,
  style,
}: StationObjectProps) {
  const { timeline } = useTimeline()
  const { isHovered, isFocused, handlers } = useInteractiveObject({
    hoverCursorState: isCollected ? 'default' : hoverCursorState,
    isCollected,
    onClick: disabled ? undefined : onClick,
  })

  const isActive = isHovered || isFocused
  const brightness = timeline.lightingProfile.brightness

  return (
    <div
      role="button"
      tabIndex={disabled || isCollected ? -1 : 0}
      aria-label={label}
      aria-pressed={isCollected ? true : undefined}
      aria-disabled={disabled}
      style={{
        position: 'relative',
        // Explicit — a scene that wraps StationObject in a `pointer-events:
        // none` ancestor (e.g. a decorative 3D-transformed layer meant to
        // let clicks pass through to what's behind it) would otherwise
        // silently disable this too, since pointer-events inherits.
        pointerEvents: 'auto',
        // Explicit — without this, paint order falls back to plain DOM
        // order, and a decorative prop declared later in a scene's JSX
        // would silently paint over an earlier interactive object.
        zIndex: isActive ? Z_INDEX.OBJECT_HOVER : Z_INDEX.OBJECTS,
        // Collected objects still keep the custom lantern cursor (just idle,
        // no glow) rather than reverting to the OS cursor — only a truly
        // disabled object breaks the illusion.
        cursor: disabled ? 'default' : 'none',
        outline: 'none',
        transition: 'filter 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease',
        filter: isActive && !isCollected
          ? `brightness(${1.3 + brightness * 0.2})`
          : `brightness(1)`,
        transform: isActive && !isCollected ? 'translateY(-1px)' : 'translateY(0)',
        // A persistent (not just hover-triggered) glow so interactive
        // objects read as clickable before the player finds them by accident.
        boxShadow: disabled || isCollected
          ? 'none'
          : isActive
            ? `0 0 30px 10px rgba(212,132,58,${0.32 + brightness * 0.2})`
            : `0 0 18px 5px rgba(212,132,58,${0.18 + brightness * 0.12})`,
        ...style,
      }}
      {...handlers}
    >
      {children}

      {/* Hover hint */}
      {hint && isActive && !isCollected && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 13,
            letterSpacing: '1.5px',
            color: `rgba(212,132,58,${0.5 + brightness * 0.4})`,
            textTransform: 'uppercase',
            pointerEvents: 'none',
            animation: 'hint-fade-in 0.3s ease forwards',
          }}
          aria-hidden="true"
        >
          {hint}
        </div>
      )}

      <style>{`
        @keyframes hint-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
