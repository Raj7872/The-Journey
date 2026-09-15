'use client'

import { useEffect, useMemo, useRef } from 'react'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { randomBetween } from '@/lib/utils/math'

interface RainDrop {
  x: number
  y: number
  speed: number
  length: number
  opacity: number
  delay: number
}

interface RainWindowProps {
  width?: number
  height?: number
  style?: React.CSSProperties
  /** Content to show through the window (scenery background) */
  children?: React.ReactNode
}

/**
 * RainWindow
 *
 * A window pane with animated rain trails on the glass.
 * Drops merge naturally, vary in size, and catch light from lamps outside.
 * Rain intensity is driven by TimelineDirector.
 */
export function RainWindow({ width = 120, height = 160, style, children }: RainWindowProps) {
  const { timeline } = useTimeline()
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const drops = useRef<RainDrop[]>([])

  const DROP_COUNT = 20
  const warmth = timeline.lightingProfile.warmth
  const intensity = timeline.weatherState.rainIntensity

  // Initialize drops
  useMemo(() => {
    drops.current = Array.from({ length: DROP_COUNT }, () => ({
      x: randomBetween(0.05, 0.95),
      y: randomBetween(-0.2, 1.1),
      speed: randomBetween(0.0008, 0.0025),
      length: randomBetween(0.04, 0.12),
      opacity: randomBetween(0.15, 0.4),
      delay: randomBetween(0, 3000),
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = 0
    const startTime = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(now - lastTime, 50)
      lastTime = now
      const elapsed = now - startTime

      ctx.clearRect(0, 0, width, height)

      const activeCount = Math.floor(intensity * DROP_COUNT)

      for (let i = 0; i < activeCount; i++) {
        const d = drops.current[i]
        if (!d) continue
        if (elapsed < d.delay) continue

        // Advance drop
        d.y += d.speed * dt * intensity

        // Reset when off screen
        if (d.y > 1.1) {
          d.y = randomBetween(-0.15, -0.02)
          d.x = randomBetween(0.05, 0.95)
          d.speed = randomBetween(0.0008, 0.0025)
          d.length = randomBetween(0.04, 0.12)
          d.opacity = randomBetween(0.1, 0.35) * intensity
        }

        // Draw trail
        const x1 = d.x * width
        const y1 = d.y * height
        const y2 = (d.y + d.length) * height

        const grad = ctx.createLinearGradient(x1, y1, x1, y2)
        const dropR = Math.round(180 + warmth * 30)
        const dropG = Math.round(200 + warmth * 20)
        const dropB = 220

        grad.addColorStop(0, `rgba(${dropR},${dropG},${dropB},0)`)
        grad.addColorStop(0.5, `rgba(${dropR},${dropG},${dropB},${d.opacity})`)
        grad.addColorStop(1, `rgba(${dropR},${dropG},${dropB},${d.opacity * 0.3})`)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x1 + 0.5, y2)  // Slight slant
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [width, height, intensity, warmth, reducedMotion])

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid rgba(184,146,42,0.15)',
        borderRadius: 1,
        ...style,
      }}
      aria-label="Window to the rain-soaked tracks"
      role="img"
    >
      {/* Cross frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1.5,
            background: 'rgba(184,146,42,0.12)',
            transform: 'translateX(-50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '40%',
            height: 1.5,
            background: 'rgba(184,146,42,0.12)',
          }}
        />
      </div>

      {/* Scene behind glass */}
      <div
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        aria-hidden="true"
      >
        {children ?? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #050810 0%, #0a0f1a 100%)',
            }}
          />
        )}
      </div>

      {/* Rain on glass canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: intensity }}
        aria-hidden="true"
      />

      {/* Glass glare */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
