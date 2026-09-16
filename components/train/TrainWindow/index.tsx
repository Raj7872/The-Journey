'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useDebug } from '@/engine/DebugManager/DebugContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { faceGradient } from '@/lib/utils/shading'

interface TrainWindowProps {
  width?: number
  height?: number
  style?: React.CSSProperties
}

/**
 * Imperative wipe controls, driven from outside the component. The window
 * sits several `translateZ`/`preserve-3d` levels deep for the depth
 * illusion â€” the same nesting that broke click hit-testing for the
 * compartment's collectibles also breaks native pointer events on this
 * canvas. The caller measures the window's real on-screen box and forwards
 * pointer events from a flat, non-3D overlay positioned on top of it.
 */
export interface TrainWindowHandle {
  startWipe: (clientX: number, clientY: number) => void
  continueWipe: (clientX: number, clientY: number) => void
  endWipe: () => void
}

// Each scenery layer scrolls a hand-placed, non-uniform segment that is
// rendered twice back-to-back so the loop point is seamless. Segment widths
// and durations are deliberately not simple multiples of one another, so
// mountains/forest/near-field rarely line back up the same way twice in a
// normal viewing session â€” the closest thing to "no obvious loop" without a
// procedural generator.
const MOUNTAIN_PEAKS = [
  { x: 40, h: 60 }, { x: 160, h: 90 }, { x: 300, h: 50 }, { x: 420, h: 75 },
  { x: 560, h: 100 }, { x: 700, h: 55 }, { x: 860, h: 80 }, { x: 1020, h: 65 },
  { x: 1180, h: 95 },
]
const MOUNTAIN_SEGMENT = 1360

const FOREST_TREES = [
  18, 40, 55, 90, 130, 145, 175, 230, 260, 310, 340, 400, 430, 470, 520,
  560, 610, 650, 700, 760, 800,
]
const FOREST_SEGMENT = 860
// Village cluster + river appear once per forest segment â€” landmarks, not wallpaper
const VILLAGE_X = 560
const RIVER_X = 220

const POLE_XS = [30, 150, 265, 375, 480, 590]
const POLE_SEGMENT = 640

function useScenery(segmentWidth: number, durationS: number, speedMultiplier: number, paused: boolean, reducedMotion: boolean) {
  return {
    width: segmentWidth * 2,
    style: {
      animation: !reducedMotion
        ? `train-scenery-scroll-${segmentWidth} ${durationS / speedMultiplier}s linear infinite ${paused ? 'paused' : 'running'}`
        : 'none',
      transform: reducedMotion ? `translateX(0)` : undefined,
    },
  }
}

/**
 * TrainWindow
 *
 * A framed compartment window: layered parallax scenery (mountains, forest,
 * a village + river that pass once per cycle, near-field telephone poles)
 * under a drifting mist, plus a fogged-glass canvas the player can wipe
 * clear with the pointer. No prompt ever indicates the wipe is possible â€”
 * two small drawings sit beneath the fog, visible only where it's cleared,
 * and slowly re-fog over time like real condensation.
 *
 * A long (5 minute), one-shot CSS animation quietly carries the sky from
 * night toward dawn the longer the player stays â€” pure decoration local to
 * this component, not tied to game state, so it never touches pacing.
 *
 * Occasionally â€” every 45â€“90s, on its own unpredictable schedule â€” the
 * scenery dips into a 2â€“3s tunnel: the outside goes dark and the glass's
 * own reflection of the lamp becomes the dominant thing on the pane. Purely
 * atmospheric, gated behind the same pause/reduced-motion checks as the
 * rest of the window's motion.
 */
export const TrainWindow = forwardRef<TrainWindowHandle, TrainWindowProps>(function TrainWindow(
  { width = 220, height = 170, style },
  ref
) {
  const { timeline } = useTimeline()
  const { debugState } = useDebug()
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDragging = useRef(false)
  const [wiping, setWiping] = useState(false)
  const [inTunnel, setInTunnel] = useState(false)

  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth
  const speed = debugState.trainScenerySpeed
  const paused = debugState.trainMovementPaused
  const condensationDisabled = debugState.trainCondensationDisabled

  const mountains = useScenery(MOUNTAIN_SEGMENT, 95, speed, paused, reducedMotion)
  const forest = useScenery(FOREST_SEGMENT, 52, speed, paused, reducedMotion)
  const near = useScenery(POLE_SEGMENT, 17, speed, paused, reducedMotion)

  // â”€â”€ Tunnels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (reducedMotion || paused) return
    let enterTimer: ReturnType<typeof setTimeout>
    let exitTimer: ReturnType<typeof setTimeout>
    const scheduleNext = () => {
      enterTimer = setTimeout(() => {
        setInTunnel(true)
        exitTimer = setTimeout(() => {
          setInTunnel(false)
          scheduleNext()
        }, 2200 + Math.random() * 800)
      }, 45000 + Math.random() * 45000)
    }
    scheduleNext()
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer) }
  }, [reducedMotion, paused])

  // â”€â”€ Condensation canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    if (condensationDisabled) return

    function paintFrost(alpha: number) {
      if (!ctx) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = `rgba(220,232,244,${alpha})`
      ctx.fillRect(0, 0, width, height)
      for (let i = 0; i < 36; i++) {
        const x = (i * 53) % width
        const y = (i * 97) % height
        const r = 12 + (i % 5) * 6
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.55})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Kept deliberately hazy rather than opaque â€” the outside scenery should
    // stay dimly visible through the condensation, not disappear behind it,
    // and a wipe should feel like clearing a haze rather than uncovering a
    // wall. `source-over` painting is cumulative, so the periodic re-fog is
    // capped (tracked via `fogLevel`) rather than left to compound toward
    // full opacity over a long session.
    const INITIAL_ALPHA = 0.24
    const REGEN_ALPHA = 0.015
    const MAX_ALPHA = 0.32
    paintFrost(INITIAL_ALPHA)
    let fogLevel = INITIAL_ALPHA
    const regen = setInterval(() => {
      if (fogLevel >= MAX_ALPHA) return
      paintFrost(REGEN_ALPHA)
      fogLevel += (1 - fogLevel) * REGEN_ALPHA
    }, 4000)
    return () => clearInterval(regen)
  }, [width, height, condensationDisabled])

  function wipeAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    // The canvas's own drawing coordinate space is fixed at `width`x`height`
    // regardless of size on screen â€” a `transform: scale()` on an ancestor
    // (ScaledStage) changes what getBoundingClientRect() reports without
    // changing that internal space, so the raw client-to-rect offset needs
    // rescaling back into canvas coordinates rather than used as-is.
    const x = (clientX - rect.left) * (width / rect.width)
    const y = (clientY - rect.top) * (height / rect.height)
    ctx.globalCompositeOperation = 'destination-out'
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 22)
    grad.addColorStop(0, 'rgba(0,0,0,1)')
    grad.addColorStop(0.7, 'rgba(0,0,0,0.85)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.fill()
  }

  useImperativeHandle(ref, () => ({
    startWipe: (clientX, clientY) => { isDragging.current = true; setWiping(true); wipeAt(clientX, clientY) },
    continueWipe: (clientX, clientY) => { if (isDragging.current) wipeAt(clientX, clientY) },
    endWipe: () => { isDragging.current = false; setWiping(false) },
  }))

  return (
    <div style={{ position: 'relative', width, height, pointerEvents: 'auto', ...style }}>
      {/* â”€â”€ Glass + scenery â”€â”€ */}
      <div style={{
        position: 'absolute', inset: 6,
        overflow: 'hidden',
        background: `linear-gradient(180deg,
          rgba(${Math.round(8+w*6)},${Math.round(10+w*5)},${Math.round(20-w*3)},1) 0%,
          rgba(${Math.round(5+w*4)},${Math.round(6+w*3)},${Math.round(12-w*2)},1) 100%)`,
      }}>
        {/* Stars â€” fade out as dawn approaches */}
        <div style={{ animation: !reducedMotion ? 'train-window-stars-fade 300s linear forwards' : 'none' }}>
          {[12, 30, 55, 72, 88].map((x, i) => (
            <div key={x} style={{
              position: 'absolute', left: `${x}%`, top: `${8 + (i % 3) * 6}%`,
              width: 1.5, height: 1.5, borderRadius: '50%',
              background: `rgba(230,230,240,${0.4 + b * 0.3})`,
            }} />
          ))}
        </div>

        {/* Dawn slowly rising â€” a one-shot 5-minute fade the longer the
            player lingers here, quietly carrying the sky from night toward
            first light without ever looping or resetting */}
        {!reducedMotion && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `linear-gradient(0deg,
              rgba(255,190,130,0.55) 0%,
              rgba(255,175,140,0.25) 30%,
              rgba(120,110,150,0.08) 60%,
              transparent 100%)`,
            animation: 'train-window-dawn-rise 300s linear forwards',
          }} />
        )}

        {/* Mountains â€” furthest, slowest */}
        <div style={{ position: 'absolute', bottom: '30%', left: 0, height: '45%', display: 'flex', ...mountains.style, width: mountains.width }}>
          {[0, 1].map((copy) => (
            <svg key={copy} width={MOUNTAIN_SEGMENT} height="100%" viewBox={`0 0 ${MOUNTAIN_SEGMENT} 100`} preserveAspectRatio="none">
              <polygon
                points={`0,100 ${MOUNTAIN_PEAKS.map((p) => `${p.x},${100 - p.h}`).join(' ')} ${MOUNTAIN_SEGMENT},100`}
                fill={`rgba(${20+Math.round(w*8)},${22+Math.round(w*6)},${34-Math.round(w*4)},${0.55 + b * 0.15})`}
              />
            </svg>
          ))}
        </div>

        {/* Forest + one village + one river crossing per segment */}
        <div style={{ position: 'absolute', bottom: '28%', left: 0, height: '30%', display: 'flex', ...forest.style, width: forest.width }}>
          {[0, 1].map((copy) => (
            <div key={copy} style={{ position: 'relative', width: FOREST_SEGMENT, height: '100%', flexShrink: 0 }}>
              {FOREST_TREES.map((x, i) => (
                <div key={x} style={{
                  position: 'absolute', bottom: 0, left: x,
                  width: 0, height: 0,
                  borderLeft: `${7 + (i % 3) * 2}px solid transparent`,
                  borderRight: `${7 + (i % 3) * 2}px solid transparent`,
                  borderBottom: `${22 + (i % 4) * 6}px solid rgba(${10+Math.round(w*4)},${16+Math.round(w*3)},${10+Math.round(w*2)},0.8)`,
                }} />
              ))}
              {/* Village â€” a small cluster of lit windows, once per segment */}
              <div style={{ position: 'absolute', bottom: 2, left: VILLAGE_X, display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 5, height: 5 + (i % 2) * 2,
                    background: `rgba(230,175,95,${0.5 + b * 0.35})`,
                    boxShadow: `0 0 5px 1px rgba(230,175,95,${0.3 + b * 0.2})`,
                  }} />
                ))}
              </div>
              {/* River + bridge â€” a pale reflective band with two piers, once per segment */}
              <div style={{
                position: 'absolute', bottom: 0, left: RIVER_X, width: 60, height: '100%',
                background: `linear-gradient(90deg, transparent, rgba(150,180,210,${0.12 + b * 0.1}), transparent)`,
              }}>
                <div style={{ position: 'absolute', bottom: 0, left: 14, width: 3, height: 16, background: 'rgba(20,18,16,0.6)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 42, width: 3, height: 16, background: 'rgba(20,18,16,0.6)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Telephone poles â€” nearest, fastest */}
        <div style={{ position: 'absolute', bottom: '27%', left: 0, height: '20%', display: 'flex', ...near.style, width: near.width }}>
          {[0, 1].map((copy) => (
            <div key={copy} style={{ position: 'relative', width: POLE_SEGMENT, height: '100%', flexShrink: 0 }}>
              {POLE_XS.map((x) => (
                <div key={x} style={{ position: 'absolute', bottom: 0, left: x }}>
                  <div style={{ width: 2, height: '100%', background: 'rgba(12,10,8,0.75)' }} />
                  <div style={{ position: 'absolute', top: 2, left: -6, width: 14, height: 2, background: 'rgba(12,10,8,0.7)' }} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Morning mist â€” drifts constantly, and as a whole thickens then
            clears over the same 5-minute arc as the dawn light, echoing the
            spec's forest â†’ mist â†’ open fields progression */}
        <div style={{
          position: 'absolute', bottom: '20%', left: '-15%', width: '130%', height: '18%',
          animation: !reducedMotion ? 'train-window-mist-envelope 300s linear forwards' : 'none',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(0deg, rgba(210,220,235,${0.1 + (1-w)*0.06}) 0%, transparent 100%)`,
            animation: !reducedMotion
              ? `train-mist-drift 37s ease-in-out infinite ${paused ? 'paused' : 'running'}`
              : 'none',
          }} />
        </div>

        {/* Tunnel darkness â€” the outside world briefly disappears */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: '#000',
          opacity: inTunnel ? 0.88 : 0,
          transition: inTunnel ? 'opacity 0.5s ease-in' : 'opacity 1.1s ease-out',
        }} aria-hidden="true" />

        {/* Glass reflection â€” a faint ghost of the compartment's warm lamplight
            sitting on the near surface of the glass, not the scenery beyond it.
            Drifts a touch opposite the camera's own motion, the way a real
            reflection would as your head (not the world outside) moves. In a
            tunnel, with nothing outside to compete with it, it becomes the
            dominant thing on the pane â€” the window turns into a mirror. */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          transform: 'translate(calc(var(--parallax-x, 0px) * -0.06), calc(var(--parallax-y, 0px) * -0.06))',
          background: `
            linear-gradient(118deg, transparent 28%, rgba(255,196,140,${0.11 + b * 0.07}) 41%, transparent 53%),
            linear-gradient(118deg, transparent 60%, rgba(255,214,170,${0.06 + b * 0.05}) 68%, transparent 76%)`,
        }} aria-hidden="true" />

        {/* Tunnel-only reflection boost â€” with nothing outside to compete,
            the lamp's ghost on the glass gets noticeably stronger */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          transform: 'translate(calc(var(--parallax-x, 0px) * -0.06), calc(var(--parallax-y, 0px) * -0.06))',
          background: `
            linear-gradient(118deg, transparent 25%, rgba(255,196,140,0.3) 40%, transparent 55%),
            linear-gradient(118deg, transparent 58%, rgba(255,214,170,0.16) 67%, transparent 78%)`,
          opacity: inTunnel ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }} aria-hidden="true" />

        {/* Hidden decals â€” only visible where the condensation above is wiped clear */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', top: '30%', left: '52%', width: 76, height: 32, opacity: 0.55 }}
          viewBox="0 0 90 32"
        >
          <text x="2" y="25" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="rgba(255,255,255,0.82)">R</text>
          <path
            d="M47 27 C 34 18, 32 8, 40 5 C 44 3, 47 7, 47 10 C 47 7, 50 3, 54 5 C 62 8, 60 18, 47 27 Z"
            fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round"
          />
          <text x="66" y="25" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="rgba(255,255,255,0.82)">R</text>
        </svg>
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', top: '58%', left: '20%', width: 40, height: 16, opacity: 0.45 }}
          viewBox="0 0 40 16"
        >
          <path
            d="M2 8 Q 8 2, 14 8 T 26 8 T 38 8"
            fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.3" strokeLinecap="round"
          />
        </svg>

        {/* Condensation â€” wipe with the pointer to clear it. No hint is ever shown. */}
        {/* No pointer handlers here â€” this deep in the 3D rig, native
            hit-testing on a <canvas> is unreliable on real browsers (the
            same issue that broke the compartment's collectibles). Wiping is
            driven imperatively via `ref` from a flat overlay outside the
            3D chain instead; see `startWipe`/`continueWipe`/`endWipe` above. */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, cursor: 'none' }}
        />

        {/* A sleeve and hand, reaching up from below to clear the glass â€”
            the one moment this scene lets you see any part of "yourself."
            Fades in only while actively wiping; no character model, just
            the impression of an arm caught at the edge of the frame. */}
        <div style={{
          position: 'absolute', bottom: -14, left: '50%',
          transform: 'translateX(-50%)',
          opacity: wiping ? 1 : 0,
          transition: wiping ? 'opacity 0.15s ease-out' : 'opacity 0.5s ease-in',
          pointerEvents: 'none',
        }} aria-hidden="true">
          <div style={{
            width: 46, height: 60,
            background: `linear-gradient(0deg, rgba(${58+Math.round(w*14)},${40+Math.round(w*8)},${30+Math.round(w*5)},0.92) 0%, rgba(${58+Math.round(w*14)},${40+Math.round(w*8)},${30+Math.round(w*5)},0.75) 55%, transparent 100%)`,
            borderRadius: '40% 40% 0 0',
            filter: 'blur(1px)',
          }} />
          <div style={{
            position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
            width: 26, height: 20,
            background: `radial-gradient(ellipse, rgba(226,190,160,0.55) 0%, transparent 75%)`,
            filter: 'blur(2.5px)',
          }} />
        </div>
      </div>

      {/* â”€â”€ Frame â€” wood with a brass inner ring, deepened with an inset
          shadow so the glass reads as recessed rather than flush â”€â”€ */}
      <div style={{
        position: 'absolute', inset: 0,
        border: `6px solid`,
        borderImage: `${faceGradient(46+Math.round(w*10), 34+Math.round(w*7), 20+Math.round(w*4), 1, 12)} 1`,
        boxShadow: 'inset 0 0 10px 3px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 4,
        border: `1px solid rgba(184,146,42,${0.35 + b * 0.25})`,
        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.03)`,
        pointerEvents: 'none',
      }} />
      {/* Brass latch */}
      <div style={{
        position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
        width: 14, height: 6, borderRadius: 2,
        background: `linear-gradient(180deg, rgba(210,170,80,0.9), rgba(140,108,40,0.9))`,
        border: `1px solid rgba(90,68,24,0.6)`,
      }} />

      <style>{`
        @keyframes train-scenery-scroll-${MOUNTAIN_SEGMENT} {
          from { transform: translateX(0); }
          to { transform: translateX(-${MOUNTAIN_SEGMENT}px); }
        }
        @keyframes train-scenery-scroll-${FOREST_SEGMENT} {
          from { transform: translateX(0); }
          to { transform: translateX(-${FOREST_SEGMENT}px); }
        }
        @keyframes train-scenery-scroll-${POLE_SEGMENT} {
          from { transform: translateX(0); }
          to { transform: translateX(-${POLE_SEGMENT}px); }
        }
        @keyframes train-mist-drift {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(4%); opacity: 1; }
        }
        @keyframes train-window-stars-fade {
          0% { opacity: 1; }
          55% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes train-window-dawn-rise {
          0% { opacity: 0; }
          65% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes train-window-mist-envelope {
          0% { opacity: 0.5; }
          40% { opacity: 1; }
          85% { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
})
