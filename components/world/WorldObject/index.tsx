'use client'

import { type ReactNode, useState } from 'react'

import { useInteractiveObject } from '@/hooks/useInteractiveObject'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { useDebug } from '@/engine/DebugManager/DebugContext'
import { Z_INDEX } from '@/lib/constants/zIndex'
import type { CursorState } from '@/types/cursor'
import type { SfxKey } from '@/types/audio'

// One shared cadence for every collectible's "hint pulse" — a few seconds
// of soft glow, then several seconds of quiet, on repeat. A negative
// animation-delay (computed per instance below) syncs every collectible
// on screen to the same wall-clock phase, so they glow together rather
// than drifting out of rhythm based on when each one happened to mount.
const HINT_PULSE_PERIOD_MS = 5000

interface WorldObjectProps {
  children: ReactNode
  /** Accessibility label — always required, even for purely decorative objects */
  label: string
  /** Short hover flavor text (e.g. "A folded receipt") */
  hint?: string
  onInteract?: () => void
  /** Played once on interaction — the object's "ambient sound" */
  interactSfx?: SfxKey
  hoverCursorState?: CursorState
  isCollected?: boolean
  /**
   * Marks this object as a real, findable collectible (as opposed to
   * environmental flavor with no memory behind it) — only these get the
   * periodic hint-pulse glow while unfound. Purely decorative WorldObjects
   * should leave this unset.
   */
  isCollectible?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}

/**
 * WorldObject
 *
 * The subtle counterpart to StationObject. Where StationObject marks a clear
 * scene-transition ("walk to X") with a persistent glow, WorldObject is for
 * environmental detail and collectibles — curiosity should find these, not
 * a glow. Feedback is a small scale/brightness nudge on hover/focus only,
 * plus the lantern cursor's own state change — except for real collectibles
 * still unfound, which get a brief, repeating hint-pulse glow to help
 * without giving away exactly what's there.
 *
 * Debug-only: when the interaction-outline toggle is on, every WorldObject
 * gets a visible outline regardless of hover state, for QA/testing.
 */
export function WorldObject({
  children,
  label,
  hint,
  onInteract,
  interactSfx,
  hoverCursorState = 'hover',
  isCollected = false,
  isCollectible = false,
  disabled = false,
  style,
}: WorldObjectProps) {
  const { playSfx } = useAudio()
  const { debugState } = useDebug()
  const { isHovered, isFocused, handlers } = useInteractiveObject({
    hoverCursorState: isCollected ? 'default' : hoverCursorState,
    isCollected,
    onClick: () => {
      if (interactSfx) playSfx(interactSfx)
      onInteract?.()
    },
  })

  const isActive = isHovered || isFocused
  // Computed once per mount, never re-randomized — a stable phase offset
  // shared across every instance so they all pulse in the same rhythm.
  const [pulseDelayMs] = useState(() => -(Date.now() % HINT_PULSE_PERIOD_MS))
  const isPulsing = isCollectible && !isCollected && !disabled && !isActive

  return (
    <div
      role="button"
      tabIndex={disabled || isCollected ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      style={{
        position: 'relative',
        // Explicit — scenes that wrap WorldObject in a `pointer-events: none`
        // ancestor (e.g. a full-bleed decorative layer meant to let clicks
        // pass through) would otherwise silently disable every object inside
        // it too, since pointer-events inherits.
        pointerEvents: 'auto',
        // Explicit — without this, paint order falls back to plain DOM
        // order, and a decorative prop declared later in a scene's JSX
        // (a chair back, a table edge) would silently paint over an
        // earlier collectible regardless of where it visually belongs.
        zIndex: isActive ? Z_INDEX.OBJECT_HOVER : Z_INDEX.OBJECTS,
        // Collected objects still keep the custom lantern cursor (just idle,
        // no glow) rather than reverting to the OS cursor — only a truly
        // disabled object breaks the illusion.
        cursor: disabled ? 'default' : 'none',
        outline: 'none',
        transition: 'transform 0.5s ease, filter 0.5s ease, box-shadow 0.2s ease',
        transform: isActive && !isCollected ? 'scale(1.04)' : 'scale(1)',
        filter: isActive && !isCollected ? 'brightness(1.1)' : 'brightness(1)',
        boxShadow: debugState.showInteractionOutlines && !disabled
          ? '0 0 0 1px rgba(80,200,255,0.9), 0 0 8px 2px rgba(80,200,255,0.35)'
          : 'none',
        ...style,
      }}
      {...handlers}
    >
      {children}

      {isPulsing && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            // A fixed, modest size centered on the object — not stretched to
            // fill it. Many WorldObjects have a click target deliberately
            // larger than what they look like (e.g. a whole bookshelf as the
            // hitbox for one small photo peeking out of it); sizing the glow
            // to `inset` on the wrapper would light up that entire hitbox
            // instead of just marking the object itself.
            top: '50%',
            left: '50%',
            width: 56,
            height: 56,
            maxWidth: '90%',
            maxHeight: '90%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animationName: 'world-object-hint-pulse',
            animationDuration: `${HINT_PULSE_PERIOD_MS}ms`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `${pulseDelayMs}ms`,
          }}
        />
      )}

      {hint && isActive && !isCollected && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-6px)',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 13,
            letterSpacing: '1px',
            color: 'rgba(212,132,58,0.7)',
            pointerEvents: 'none',
            opacity: 0.9,
          }}
          aria-hidden="true"
        >
          {hint}
        </div>
      )}

      <style>{`
        @keyframes world-object-hint-pulse {
          0%, 72% { box-shadow: 0 0 0 0 rgba(255,208,120,0); opacity: 0; }
          80% { box-shadow: 0 0 22px 10px rgba(255,208,120,0.5); opacity: 1; }
          90% { box-shadow: 0 0 22px 10px rgba(255,208,120,0.5); opacity: 1; }
          100% { box-shadow: 0 0 0 0 rgba(255,208,120,0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
