'use client'

import { useEffect, useRef } from 'react'

import { useCursor } from '@/engine/CursorManager/CursorContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Z_INDEX } from '@/lib/constants/zIndex'

/**
 * Cursor
 *
 * A tiny glowing lantern that follows the mouse.
 * Expands subtly on hover, adds sparkle on collect state.
 * Never calls attention to itself — it simply exists.
 */
export function Cursor() {
  const { cursorState } = useCursor()
  const reducedMotion = useReducedMotion()
  const cursorRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const currentRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)
  const hasPositionedRef = useRef(false)

  // Smooth follow with lerp
  useEffect(() => {

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      // Snap straight to the real position on the very first move instead of
      // easing in from off-screen — otherwise the cursor visibly lags in
      // from the corner the first time the player moves the mouse.
      if (!hasPositionedRef.current) {
        hasPositionedRef.current = true
        currentRef.current = { x: e.clientX, y: e.clientY }
      }
    }
    window.addEventListener('mousemove', handleMove, { passive: true })

    const tick = () => {
      const speed = reducedMotion ? 1 : 0.22
      currentRef.current.x += (posRef.current.x - currentRef.current.x) * speed
      currentRef.current.y += (posRef.current.y - currentRef.current.y) * speed

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion])

  // State-based sizes
  const state = cursorState.state
  const isHover = state === 'hover' || state === 'collect'
  const isCollect = state === 'collect'
  const isRead = state === 'read' || state === 'proposal'

  const coreSize = isHover ? 12 : isRead ? 4 : 9
  const glowSize = isHover ? 36 : isRead ? 12 : 28
  const coreOpacity = isRead ? 0.8 : 1
  const glowOpacity = isCollect ? 0.35 : isHover ? 0.28 : 0.2

  if (!cursorState.isEnabled) return null

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        // Explicit size so percentage-based positioning on children (the
        // core dot's top/left: 50%) resolves against this box rather than
        // collapsing to 0×0 — every child here is position:absolute, so
        // without this the container has no intrinsic size and the core
        // dot ends up centered on the box's origin instead of its middle,
        // landing up to glowSize/2 px away from the real cursor position.
        width: glowSize,
        height: glowSize,
        zIndex: Z_INDEX.CURSOR,
        pointerEvents: 'none',
        opacity: cursorState.isVisible ? 1 : 0,
        willChange: 'transform',
        // Offset so the hot-spot is the centre of the lantern
        marginLeft: -(glowSize / 2),
        marginTop: -(glowSize / 2),
      }}
      aria-hidden="true"
    >
      {/* Glow halo */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: glowSize,
          height: glowSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,132,58,0.5) 0%, transparent 70%)',
          opacity: glowOpacity,
          transition: 'all 0.3s ease',
        }}
      />

      {/* Core lantern dot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: coreSize,
          height: coreSize,
          borderRadius: '50%',
          background: isCollect
            ? 'rgba(255,220,100,0.95)'
            : 'rgba(212,132,58,0.9)',
          transform: 'translate(-50%, -50%)',
          opacity: coreOpacity,
          boxShadow: isHover
            ? '0 0 8px 3px rgba(212,132,58,0.4)'
            : '0 0 4px 1px rgba(212,132,58,0.2)',
          transition: 'all 0.25s ease',
        }}
      />

      {/* Sparkle ring — collect state only */}
      {isCollect && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 28,
            height: 28,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid rgba(212,132,58,0.5)',
            animation: 'cursor-ring-expand 0.8s ease-out infinite',
          }}
        />
      )}

      <style>{`
        @keyframes cursor-ring-expand {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
