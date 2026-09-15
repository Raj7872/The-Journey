'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { useDebug } from '@/engine/DebugManager/DebugContext'
import { useScene } from '@/engine/SceneManager/SceneContext'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { WorldObject } from '@/components/world/WorldObject'
import { StationObject } from '@/components/station/StationObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { SteamWisp } from '@/components/common/SteamWisp'
import { HandwrittenText } from '@/components/common/HandwrittenText'
import { AmbientLight } from '@/components/station/AmbientLight'
import { TrainWindow, type TrainWindowHandle } from '@/components/train/TrainWindow'
import { TrainMusicPlayer } from '@/components/train/TrainMusicPlayer'
import { useParallax } from '@/hooks/useParallax'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { TIMING } from '@/lib/constants/timing'
import { groundShadow, faceGradient, woodGrain, specularHighlight, fabricWeave, paperFiber, lightPool } from '@/lib/utils/shading'
import { LETTERS } from '@/content/memories/letters/letters'
import { DOODLES } from '@/content/memories/doodles/doodles'
import { BOOKMARKS } from '@/content/memories/bookmarks/bookmarks'
import { POSTCARDS } from '@/content/memories/postcards/postcards'

type RideState = 'riding' | 'slowing' | 'stopped' | 'doors-open'

const letter005 = LETTERS.find((m) => m.id === 'letter-005')
const letter006 = LETTERS.find((m) => m.id === 'letter-006')
const doodle001 = DOODLES.find((m) => m.id === 'doodle-001')
const bookmark001 = BOOKMARKS.find((m) => m.id === 'bookmark-001')
const postcard004 = POSTCARDS.find((m) => m.id === 'postcard-004')

/**
 * TrainInterior
 *
 * A real (small) CSS 3D stage set, not a stack of flat divs pretending to
 * have depth. A `perspective` context on the root plus five true
 * `translateZ` planes — far wall, floor (genuinely `rotateX`'d), the near
 * window wall, the table, and the foreground seat — do the "near things
 * loom, far things shrink" work for free; mouse/tilt parallax on top is
 * only ever a 2–3px nudge. The window wall stays face-on rather than also
 * `rotateY`'d — its own `<canvas>` and reflection layers rendered corrupted
 * when nested inside a rotated 3D ancestor on real hardware, so depth here
 * comes from `translateZ` alone.
 * The camera never pans, zooms, or roams — only breathes, sways with the
 * train, and drifts by a hair. Also renders for 'final-carriage' (same
 * shell, later in the journey — the lighting profile alone shifts it
 * toward dawn).
 */
export function TrainInterior() {
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const { debugState } = useDebug()
  const { transitionTo } = useScene()
  const { playSfx, stopAmbient } = useAudio()
  const reducedMotion = useReducedMotion()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.013, tilt: true })

  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth
  const isFinalCarriage = timeline.currentScene === 'final-carriage'
  const swaying = !reducedMotion && !debugState.trainMovementPaused
  const swayState = swaying ? 'running' : 'paused'

  // ── Ride → arrival ──────────────────────────────────────────────────────
  // The ride itself has no beats to hit — it's just the journey, at whatever
  // length feels unhurried (TIMING.JOURNEY_RIDE_DURATION). Once that elapses,
  // this is the one place in the whole app that calls transitionTo without a
  // player action behind it — the train decides when it's time to slow, not
  // the player. Everything after arrival (slowing → stop → doors) is player-
  // paced again: doors open automatically, but leaving is never forced.
  const [rideState, setRideState] = useState<RideState>('riding')

  useEffect(() => {
    // No "only schedule once" ref guard here — that was the actual bug.
    // React 18 StrictMode's dev-only mount→effect→cleanup→effect-again
    // cycle would flip a ref guard true on the first pass, get its timer
    // cancelled by the simulated cleanup, then see the guard already true
    // on the second pass and skip rescheduling entirely — leaving zero
    // live timers while the (separately, correctly, ref-driven) countdown
    // display kept ticking down regardless. Effect cleanup below already
    // handles both StrictMode's double-invoke and any real remount
    // correctly on its own; the guard was actively fighting that.
    if (isFinalCarriage) return
    const t = setTimeout(() => transitionTo('final-carriage'), TIMING.JOURNEY_RIDE_DURATION)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isFinalCarriage) return
    playSfx('train-brake')
    setRideState('slowing')
    const stopTimer = setTimeout(() => {
      setRideState('stopped')
      stopAmbient('train-moving')
    }, TIMING.ARRIVAL_STOP)
    const doorsTimer = setTimeout(() => {
      setRideState('doors-open')
      playSfx('train-door')
    }, TIMING.ARRIVAL_DOORS)
    return () => { clearTimeout(stopTimer); clearTimeout(doorsTimer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinalCarriage])

  // ── Arrival announcements ────────────────────────────────────────────────
  // No literal countdown — a handful of staged announcements instead,
  // derived from a captured start time rather than decremented directly so
  // they can't drift from the real setTimeout above (backgrounded tabs,
  // slow frames). The 1s interval only forces a re-render to re-check the
  // derived value — nothing here runs per-frame. Once past `JOURNEY_ANNOUNCE_HERE`
  // the condition stays true on its own, so the wall message keeps showing
  // through slowing/stopping/doors-open without any extra state.
  const rideStartRef = useRef(Date.now())
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (rideState !== 'riding') return
    const interval = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(interval)
  }, [rideState])
  const elapsedMs = Math.min(TIMING.JOURNEY_RIDE_DURATION, Date.now() - rideStartRef.current)
  const arrivalMessage =
    elapsedMs >= TIMING.JOURNEY_ANNOUNCE_HERE ? 'Your destination is here'
    : elapsedMs >= TIMING.JOURNEY_ANNOUNCE_ALMOST ? 'Almost there'
    : elapsedMs >= TIMING.JOURNEY_ANNOUNCE_VERY_SOON ? 'Arriving Very Soon'
    : elapsedMs >= TIMING.JOURNEY_ANNOUNCE_SOON ? 'Arriving to Destination Soon'
    : null
  const showWallMessage = elapsedMs >= TIMING.JOURNEY_ANNOUNCE_HERE

  // The three collectibles (and the window's condensation wipe) live many
  // `translateZ`/`preserve-3d` levels deep for the depth illusion, which
  // real browsers can't reliably hit-test — so their actual interactive
  // surface is a flat overlay elsewhere in this component. A hardcoded
  // percentage position for that overlay only ever matches one specific
  // viewport size, though; this measures each decorative object's real
  // on-screen box directly and keeps the overlay pinned to it. Re-measured
  // periodically (not just once) because the breathing/sway animation
  // constantly nudges everything by a few px — a one-time snapshot drifts
  // out of sync with what's actually on screen.
  const coatRef = useRef<HTMLDivElement>(null)
  const napkinRef = useRef<HTMLDivElement>(null)
  const envelopeRef = useRef<HTMLDivElement>(null)
  const bookmarkRef = useRef<HTMLDivElement>(null)
  const windowWrapRef = useRef<HTMLDivElement>(null)
  const exitRef = useRef<HTMLDivElement>(null)
  const postcardRef = useRef<HTMLDivElement>(null)
  const trainWindowRef = useRef<TrainWindowHandle>(null)
  const [hitRects, setHitRects] = useState<{
    coat?: { top: number; left: number; width: number; height: number }
    napkin?: { top: number; left: number; width: number; height: number }
    envelope?: { top: number; left: number; width: number; height: number }
    bookmark?: { top: number; left: number; width: number; height: number }
    window?: { top: number; left: number; width: number; height: number }
    exit?: { top: number; left: number; width: number; height: number }
    postcard?: { top: number; left: number; width: number; height: number }
  }>({})

  useEffect(() => {
    const measure = () => {
      const rectOf = (el: HTMLDivElement | null) => {
        if (!el) return undefined
        const r = el.getBoundingClientRect()
        return { top: r.top, left: r.left, width: r.width, height: r.height }
      }
      setHitRects({
        coat: rectOf(coatRef.current),
        napkin: rectOf(napkinRef.current),
        envelope: rectOf(envelopeRef.current),
        bookmark: rectOf(bookmarkRef.current),
        window: rectOf(windowWrapRef.current),
        exit: rectOf(exitRef.current),
        postcard: rectOf(postcardRef.current),
      })
    }
    measure()
    const settleTimer = setTimeout(measure, 600)
    const driftInterval = setInterval(measure, 2000)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(settleTimer)
      clearInterval(driftInterval)
      window.removeEventListener('resize', measure)
    }
  }, [isFinalCarriage, rideState])

  // A hairline nudge, not a pan — perspective already does the heavy
  // lifting for "near things move more than far things."
  const depth = (fx: number) =>
    `translate(calc(var(--parallax-x, 0px) * ${fx}), calc(var(--parallax-y, 0px) * ${(fx * 0.45).toFixed(3)}))`

  return (
    <div
      ref={parallaxRef}
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', perspective: 950, perspectiveOrigin: '62% 55%',
        // A flat backdrop fill behind the whole 3D rig — perspective naturally
        // shrinks translateZ'd planes toward the vanishing point, which would
        // otherwise leave a bare void at the frame's edges.
        background: `rgb(${Math.round(10+w*4)},${Math.round(8+w*3)},${Math.round(6+w*2)})`,
      }}
      role="region"
      aria-label={isFinalCarriage ? 'The final carriage' : 'Inside the train'}
    >
      {/* ═══ BREATHING — a slow, near-imperceptible scale pulse ═══ */}
      <div style={{
        position: 'absolute', inset: 0, transformStyle: 'preserve-3d',
        transformOrigin: '62% 55%',
        animation: `train-breathe 10s ease-in-out infinite ${swayState}`,
      }}>
        {/* ═══ SWAY — the train's own gentle rock ═══ */}
        <div style={{
          position: 'absolute', inset: 0, transformStyle: 'preserve-3d',
          transformOrigin: 'center bottom',
          animation: `train-sway 4.2s ease-in-out infinite ${swayState}`,
        }}>

          {/* ═══════════════ PLANE — FAR WALL (Z −90, soft focus) ═══════════════ */}
          {/* scale(1.1) pre-compensates for perspective's shrink at this Z so
              the backdrop still fills the frame edge-to-edge instead of
              leaving a bare gap around it. */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            transform: `translateZ(-90px) scale(1.1) ${depth(0.05)}`,
            filter: 'blur(1.4px)', opacity: 0.68 + b * 0.18,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `${woodGrain(96, 0.04)},
                linear-gradient(180deg,
                  rgba(${Math.round(26+w*10)},${Math.round(19+w*7)},${Math.round(12+w*4)},1) 0%,
                  rgba(${Math.round(18+w*8)},${Math.round(13+w*5)},${Math.round(9+w*3)},1) 60%,
                  rgba(${Math.round(12+w*6)},${Math.round(9+w*4)},${Math.round(7+w*2)},1) 100%)`,
              transition: 'background 3s ease',
            }} aria-hidden="true" />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '20%',
              background: 'linear-gradient(180deg, rgba(4,4,6,0.9) 0%, transparent 100%)',
            }} aria-hidden="true" />
            {/* Corridor door — the camera never turns to face it */}
            <div style={{ position: 'absolute', top: '20%', left: '2%' }} aria-hidden="true">
              <div style={{
                width: 14, height: 26,
                background: `rgba(${8+Math.round(w*4)},${7+Math.round(w*3)},${6+Math.round(w*2)},0.9)`,
                border: `1px solid rgba(184,146,42,${0.12 + b * 0.08})`,
                borderRadius: '2px 2px 0 0',
              }} />
            </div>
            {/* The seat across the aisle — atmosphere only */}
            <div style={{ position: 'absolute', top: '15%', left: '5%' }} aria-hidden="true">
              <SeatBench brightness={b} warmth={w} width={62} />
            </div>
          </div>

          {/* ═══════════════ PLANE — FLOOR (genuinely rotated) ═══════════════ */}
          <PerspectiveFloor
            height="20%"
            colorNear={`rgba(${Math.round(20+w*8)},${Math.round(15+w*5)},${Math.round(10+w*3)},1)`}
            colorFar={`rgba(${Math.round(10+w*5)},${Math.round(8+w*3)},${Math.round(6+w*2)},1)`}
            lineColor={`rgba(255,255,255,${0.05 + b * 0.05})`}
            style={{
              transformOrigin: 'bottom center', pointerEvents: 'none',
              transform: `rotateX(9deg) translateZ(-20px) ${depth(0.10)}`,
            }}
          />

          {/* ═══════════════ PLANE — WINDOW WALL (Z −35, the near side wall) ═══════════════ */}
          {/* No rotateY here — the window's own <canvas> (condensation) and
              blend-mode reflection layers render corrupted when nested inside
              a rotated 3D ancestor in some browsers/GPUs (confirmed against a
              real screenshot, not a style call). translateZ alone still gives
              this plane real perspective-driven scale/parallax; it just stays
              face-on rather than genuinely angled. */}
          <div style={{
            position: 'absolute', top: '0%', left: '16%', width: '84%', height: '98%', pointerEvents: 'none',
            transform: `translateZ(-35px) ${depth(0.14)}`,
          }}>
            {/* Everything except the window itself, scaled up together — sized
                originally for a much smaller window and reading as tiny/lost
                once the window became the frame's dominant element. */}
            <div style={{ position: 'absolute', inset: 0, transformOrigin: 'top left', transform: 'scale(1.3)' }}>
            {/* Wood panel behind the curtain/lamp/rack cluster — fades out
                rather than a hard edge, so it reads as part of the wall
                instead of a slab floating in front of it */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '48%', height: '100%',
              background: `${woodGrain(90, 0.04)},
                linear-gradient(90deg,
                  rgba(${Math.round(26+w*10)},${Math.round(19+w*7)},${Math.round(12+w*4)},0.85) 0%,
                  rgba(${Math.round(24+w*9)},${Math.round(18+w*6)},${Math.round(11+w*4)},0.5) 45%,
                  transparent 85%)`,
            }} aria-hidden="true" />

            {/* A note, left on the empty wall beside the curtain — appears
                once, written in the same hand as everything else, and stays
                for the rest of the ride. Sits in the bare stretch of wall
                between the lamp/coat cluster and the table, clear of both. */}
            {showWallMessage && (
              <div style={{ position: 'absolute', top: '16%', left: '3%', width: 300 }} aria-hidden="true">
                <HandwrittenText
                  text="Thank you for coming.<br>Hope you collected all your belonging before you get off the Train.<br>You are so Amazing, and I Love You very much. ❤️"
                  color={`rgba(242,232,213,${0.7 + b * 0.2})`}
                  style={{ fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontSize: 15, lineHeight: 1.6 }}
                />
              </div>
            )}

            {/* The exit — only appears once the doors have actually opened.
                No spectacle, just warm light where there was wall before. */}
            {rideState === 'doors-open' && (
              <div ref={exitRef} style={{ position: 'absolute', top: '32%', left: '2%', width: 58, height: 130 }} aria-hidden="true">
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '3px 3px 0 0',
                  background: `linear-gradient(180deg, rgba(255,222,165,0.92) 0%, rgba(255,196,130,0.8) 100%)`,
                  boxShadow: `0 0 44px 18px rgba(255,200,130,${0.35 + b * 0.15})`,
                }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%', background: 'rgba(70,55,28,0.32)' }} />
              </div>
            )}

            {/* Hanging lamp — the room's key light, kept clear of the coat below it */}
            <div style={{ position: 'absolute', top: '0%', left: '6%' }} aria-hidden="true">
              <div style={{
                animation: `train-lamp-swing 5.5s ease-in-out infinite ${swayState}`,
                transformOrigin: 'top center',
              }}>
                <div style={{ transform: 'translateX(-50%)' }}>
                  <AmbientLight size="medium" flickerOffset={0.4} />
                </div>
              </div>
            </div>

            {/* Dust motes, drifting through the lamp's light */}
            {!reducedMotion && (
              <div style={{ position: 'absolute', top: '2%', left: '2%', width: 70, height: 100, pointerEvents: 'none' }} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: `${15 + i * 20}%`, top: `${10 + (i % 2) * 30}%`,
                    width: 1.5, height: 1.5, borderRadius: '50%',
                    background: `rgba(230,205,160,${0.3 + b * 0.2})`,
                    animation: `train-dust-float ${9 + i * 2}s ease-in-out ${i * 1.3}s infinite ${swayState}`,
                  }} />
                ))}
              </div>
            )}

            {/* Curtain, drawn back at the window's near edge — wide, with
                repeating vertical folds so it reads as hanging fabric
                instead of a single flat-colored bar. Kept clear of the
                window's own left edge so it isn't painted over. */}
            <div style={{ position: 'absolute', top: '5%', left: '28%' }} aria-hidden="true">
              <div style={{
                width: 52, height: 420, borderRadius: '4px 14px 14px 4px',
                background: `
                  repeating-linear-gradient(90deg,
                    rgba(0,0,0,0.22) 0px, transparent 4px, transparent 8px, rgba(255,255,255,0.06) 10px, transparent 13px),
                  ${fabricWeave(0.05)},
                  linear-gradient(90deg,
                    rgba(${72+Math.round(w*15)},${32+Math.round(w*8)},${29+Math.round(w*6)},0.92) 0%,
                    rgba(${58+Math.round(w*12)},${24+Math.round(w*7)},${22+Math.round(w*5)},0.95) 40%,
                    rgba(${44+Math.round(w*10)},${17+Math.round(w*6)},${16+Math.round(w*4)},0.95) 70%,
                    rgba(${58+Math.round(w*12)},${24+Math.round(w*7)},${22+Math.round(w*5)},0.9) 100%)`,
                transformOrigin: 'top center',
                animation: `train-curtain-sway 6.5s ease-in-out infinite ${swayState}`,
                boxShadow: '3px 0 8px rgba(0,0,0,0.35)',
              }} />
            </div>

            {/* Overhead luggage rack, close above the camera's own seat */}
            <div style={{
              position: 'absolute', top: '2%', left: '0%', width: '38%', height: 5,
              background: `${specularHighlight('30%', '10%', '80%', 0.35)},
                linear-gradient(90deg, rgba(140,108,40,0.5), rgba(200,164,70,0.7), rgba(140,108,40,0.5))`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }} aria-hidden="true" />
            {!isFinalCarriage ? (
              // Purely decorative here — deeply nested inside translateZ/
              // preserve-3d planes, real click/hover hit-testing on content
              // this far down a 3D transform chain resolves to the wrong
              // ancestor in real browsers (confirmed via elementFromPoint
              // against a live render, not a style guess). The actual
              // interactive hit-target for this coat is the flat overlay
              // near the end of the component, positioned to sit on top of it.
              <div ref={coatRef} style={{ position: 'absolute', top: '3%', left: '22%' }} aria-hidden="true">
                <div style={{
                  animation: `train-sway-secondary 3.6s ease-in-out infinite ${swayState}`,
                  transformOrigin: 'top center',
                }}>
                  <div style={{ position: 'relative', width: 26, height: 40 }}>
                    <div style={{
                      width: 26, height: 34,
                      background: `${fabricWeave(0.05)}, ${faceGradient(30+Math.round(w*8), 24+Math.round(w*5), 30+Math.round(w*4), 0.9, 10)}`,
                      borderRadius: '10px 10px 3px 3px',
                      marginTop: 6,
                    }} />
                    <div style={{ position: 'absolute', top: 0, left: 8, width: 10, height: 4, background: 'rgba(140,108,40,0.7)', borderRadius: 2 }} />
                    {letter006 && !isCollected(letter006.id) && (
                      <div style={{
                        position: 'absolute', bottom: 6, left: -2,
                        width: 10, height: 14,
                        background: `${paperFiber(0.03)}, rgba(242,232,213,${0.3 + b * 0.15})`,
                        transform: 'rotate(-6deg)',
                      }} />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ position: 'absolute', top: '3%', left: '22%' }} aria-hidden="true">
                <div style={{
                  animation: `train-sway-secondary 3.6s ease-in-out infinite ${swayState}`,
                  transformOrigin: 'top center',
                  opacity: 0.6 + b * 0.2,
                }}>
                  <div style={{ position: 'relative', width: 44, height: 30 }}>
                    <div style={groundShadow(40, 0.3)} />
                    <div style={{
                      width: 44, height: 30,
                      background: `${fabricWeave(0.05)}, ${faceGradient(30+Math.round(w*8), 22+Math.round(w*5), 15+Math.round(w*3))}`,
                      border: `1px solid rgba(184,146,42,${0.15 + b * 0.1})`,
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              </div>
            )}
            </div>

            {/* ── THE WINDOW — the emotional centerpiece ── */}
            <div ref={windowWrapRef} style={{ position: 'absolute', top: '1%', right: '-2%' }}>
              <TrainWindow ref={trainWindowRef} width={620} height={520} />
            </div>

            {/* A postcard, resting on the windowsill — only once the dark
                outside has started to soften. Not a memory of somewhere
                we've been; the only thing in this compartment looking
                forward instead of back. Decorative only — see the flat
                overlay near the end of the component for the real
                click/hover hit-target. */}
            {isFinalCarriage && (
              <div ref={postcardRef} style={{ position: 'absolute', top: '70%', left: '38%', transform: 'rotate(-3deg)' }} aria-hidden="true">
                <div style={{
                  width: 28, height: 20,
                  background: `${paperFiber()}, rgba(${Math.round(234+w*10)},${Math.round(226+w*8)},${Math.round(206+w*4)},0.95)`,
                  border: `1px solid rgba(184,146,42,${0.22 + b * 0.15})`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }} />
              </div>
            )}
          </div>

          {/* ═══════════════ PLANE — TABLE (Z −12, sharpest light, closer to camera than the walls) ═══════════════ */}
          {/* scale(1.45) — the table and its objects were sized for the old,
              much smaller window and read as tiny/lost against the enlarged
              composition. Scaling the whole plane up is simpler and more
              consistent than rescaling a dozen individual px values by hand. */}
          <div style={{
            position: 'absolute', inset: 0, transformOrigin: '36% 85%', pointerEvents: 'none',
            transformStyle: 'preserve-3d',
            transform: `translateZ(-12px) scale(1.85) ${depth(0.34)}`,
          }}>
            {/* The table — a real angled tabletop: planked wood seen from
                above at a steep tilt, like looking down at it from where
                you're sitting, with everything resting on that surface
                rather than scattered in front of a thin bar. Everything
                inside the tilted card below is normal flat 2D layout that
                rides along with the one rotation, the way a texture would
                be painted on a tilted plane. */}
            <div style={{ position: 'absolute', bottom: '15%', left: '32%', transform: 'translateX(-50%)' }} aria-hidden="true">
              <div style={{ position: 'relative' }}>
                <div style={groundShadow(190, 0.4)} />

                {/* ── TOP SURFACE, tilted ── */}
                <div style={{
                  position: 'relative', width: 210, height: 118,
                  transformOrigin: 'bottom center',
                  transform: 'rotateX(40deg)',
                }}>
                  {/* Planked wood — distinct boards with dark seams between them */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 4,
                    background: `
                      linear-gradient(90deg,
                        transparent 0%, transparent 19%, rgba(10,6,3,0.55) 19%, rgba(10,6,3,0.55) 21%,
                        transparent 21%, transparent 39%, rgba(10,6,3,0.55) 39%, rgba(10,6,3,0.55) 41%,
                        transparent 41%, transparent 59%, rgba(10,6,3,0.55) 59%, rgba(10,6,3,0.55) 61%,
                        transparent 61%, transparent 79%, rgba(10,6,3,0.55) 79%, rgba(10,6,3,0.55) 81%,
                        transparent 81%, transparent 100%),
                      ${woodGrain(2, 0.05)},
                      linear-gradient(200deg,
                        rgba(${72+Math.round(w*14)},${52+Math.round(w*9)},${28+Math.round(w*5)},0.96) 0%,
                        rgba(${52+Math.round(w*10)},${36+Math.round(w*6)},${18+Math.round(w*4)},0.96) 55%,
                        rgba(${38+Math.round(w*8)},${26+Math.round(w*5)},${13+Math.round(w*3)},0.96) 100%)`,
                    boxShadow: `inset 0 0 0 1px rgba(184,146,42,${0.14 + b * 0.08})`,
                  }} />
                  {/* A soft sheen where the overhead lamp catches the wood */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 4,
                    background: `radial-gradient(ellipse 60% 45% at 62% 30%, rgba(255,220,170,${0.14 + b * 0.08}) 0%, transparent 70%)`,
                  }} />
                  {/* Scratches + a ring stain, worn into the surface */}
                  <div style={{ position: 'absolute', top: 24, left: 30, width: 34, height: 1.5, background: 'rgba(15,10,6,0.3)', transform: 'rotate(-6deg)' }} />
                  <div style={{ position: 'absolute', top: 60, left: 128, width: 24, height: 1.5, background: 'rgba(15,10,6,0.22)', transform: 'rotate(9deg)' }} />
                  <div style={{ position: 'absolute', top: 18, right: 22, width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(60,40,15,0.35)' }} />

                  {/* Vase of sunflowers */}
                  <div style={{ position: 'absolute', top: 6, left: 16 }}>
                    <div style={{ position: 'relative' }}>
                      {[-9, -3, 4, 10].map((x, i) => (
                        <div key={x} style={{
                          position: 'absolute', bottom: 14, left: `calc(50% + ${x}px)`,
                          width: 1.5, height: 24 + (i % 2) * 5,
                          background: `rgba(${52+Math.round(w*8)},${86+Math.round(w*10)},${58+Math.round(w*6)},0.75)`,
                          transformOrigin: 'bottom center', transform: `rotate(${x * 1.4}deg)`,
                        }} />
                      ))}
                      {/* Each bloom: six petals fanned radially around a dark seed-head center */}
                      {[-9, -3, 4, 10].map((x, i) => (
                        <div key={`bloom-${x}`} style={{
                          position: 'absolute', bottom: 32 + (i % 2) * 5, left: `calc(50% + ${x}px)`,
                          width: 15, height: 15, transform: 'translateX(-50%)',
                        }}>
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {[0, 60, 120, 180, 240, 300].map((angle) => (
                              <div key={angle} style={{
                                position: 'absolute', bottom: '50%', left: '50%',
                                width: 5, height: 8,
                                borderRadius: '50% 50% 50% 50% / 65% 65% 35% 35%',
                                background: `linear-gradient(180deg, rgba(${255},${205+Math.round(w*6)},${60+Math.round(w*10)},0.96), rgba(${226},${152+Math.round(w*8)},${24+Math.round(w*6)},0.94))`,
                                transformOrigin: 'bottom center',
                                transform: `translateX(-50%) rotate(${angle + i * 12}deg) translateY(-3px)`,
                              }} />
                            ))}
                            <div style={{
                              position: 'absolute', top: '50%', left: '50%', width: 6.5, height: 6.5,
                              borderRadius: '50%', transform: 'translate(-50%,-50%)',
                              background: `${specularHighlight('35%', '30%', '65%', 0.25)}, radial-gradient(circle, rgba(96,62,26,0.95) 0%, rgba(48,30,14,0.95) 100%)`,
                            }} />
                          </div>
                        </div>
                      ))}
                      <div style={{
                        width: 14, height: 16, borderRadius: '2px 2px 6px 6px', margin: '0 auto',
                        background: `${specularHighlight('30%', '20%', '70%', 0.35)}, linear-gradient(180deg, rgba(${150+Math.round(w*15)},${170+Math.round(w*12)},${175+Math.round(w*10)},0.9), rgba(${100+Math.round(w*12)},${118+Math.round(w*10)},${125+Math.round(w*8)},0.92))`,
                      }} />
                    </div>
                  </div>

                  {/* Coffee cup — saucer, handle, steam, rippling surface */}
                  <div style={{ position: 'absolute', top: 60, right: 24 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 24, height: 7, borderRadius: '50%', position: 'absolute', bottom: -2, left: -6,
                        background: `${specularHighlight('40%', '20%', '70%', 0.35)}, linear-gradient(180deg, rgba(${226+Math.round(w*18)},${220+Math.round(w*14)},${204+Math.round(w*8)},0.92), rgba(${206+Math.round(w*16)},${198+Math.round(w*12)},${180+Math.round(w*8)},0.92))`,
                      }} />
                      <div style={{
                        width: 14, height: 11,
                        background: `${specularHighlight('30%', '15%', '65%', 0.3)}, rgba(${Math.round(224+w*20)},${Math.round(218+w*14)},${Math.round(202+w*8)},0.9)`,
                        borderRadius: '0 0 6px 6px', position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', top: 1, left: '50%', width: 10, height: 9, borderRadius: '50%',
                          border: `1px solid rgba(${90+Math.round(w*20)},${55+Math.round(w*10)},${30+Math.round(w*6)},0.4)`,
                          transform: 'translateX(-50%)',
                          animation: `train-tea-ripple 3.4s ease-in-out infinite ${swayState}`,
                        }} />
                      </div>
                      <div style={{
                        position: 'absolute', top: 3, right: -5,
                        width: 6, height: 7, borderRadius: '50%',
                        border: `1.5px solid rgba(${Math.round(224+w*20)},${Math.round(218+w*14)},${Math.round(202+w*8)},0.85)`,
                      }} />
                      <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)' }}>
                        <SteamWisp width={10} height={18} opacity={0.24 + b * 0.1} />
                      </div>
                    </div>
                  </div>

                  {/* Pocket watch */}
                  <div style={{ position: 'absolute', top: 44, left: 94, transform: 'rotate(8deg)', opacity: 0.65 + b * 0.2 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: `${specularHighlight('32%', '25%', '75%', 0.55)}, linear-gradient(180deg, rgba(215,175,85,0.9), rgba(140,108,40,0.9))`,
                      border: '1px solid rgba(90,68,24,0.6)', position: 'relative',
                    }}>
                      <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: 'rgba(242,232,213,0.85)' }} />
                    </div>
                  </div>

                  {/* Pencil + notebook */}
                  <div style={{ position: 'absolute', top: 58, left: 38, opacity: 0.6 + b * 0.2 }}>
                    <div style={{
                      width: 16, height: 12,
                      background: `${paperFiber()}, rgba(${230+Math.round(w*10)},${222+Math.round(w*8)},${202+Math.round(w*4)},0.9)`,
                      border: '1px solid rgba(20,15,10,0.15)',
                    }} />
                    <div style={{
                      position: 'absolute', top: -1, left: 2, width: 14, height: 1.5,
                      background: `rgba(${180+Math.round(w*20)},${130+Math.round(w*10)},${60+Math.round(w*5)},0.9)`,
                      transform: 'rotate(-18deg)', borderRadius: 1,
                    }} />
                  </div>

                  {/* Doodled napkin — its own spot on the table, decorative
                      only; see the flat overlay near the end of the
                      component for the real click/hover hit-target. Only
                      available before the final carriage — the ride is
                      over by then, and the envelope below has taken its own
                      place rather than replacing this one. */}
                  {!isFinalCarriage && (
                    <div ref={napkinRef} style={{ position: 'absolute', top: 78, left: 86, transform: 'rotate(-3deg)' }}>
                      <div style={{
                        width: 20, height: 16,
                        background: `${paperFiber()}, rgba(${Math.round(232+w*10)},${Math.round(226+w*8)},${Math.round(210+w*4)},0.9)`,
                        border: '1px solid rgba(20,15,10,0.15)',
                      }} />
                    </div>
                  )}

                  {/* The envelope — its own spot on the table, clear of
                      where the napkin used to sit, so it reads as a new
                      thing to notice rather than the napkin turning into a
                      letter. */}
                  {isFinalCarriage && (
                    <div ref={envelopeRef} style={{ position: 'absolute', top: 20, left: 148, transform: 'rotate(4deg)' }}>
                      <div style={{
                        width: 26, height: 18,
                        background: `${paperFiber()}, rgba(${Math.round(232+w*10)},${Math.round(222+w*8)},${Math.round(200+w*4)},0.92)`,
                        border: `1px solid rgba(184,146,42,${0.2 + b * 0.15})`,
                      }} />
                    </div>
                  )}
                </div>

                {/* Front edge — thickness beneath the tilted surface */}
                <div style={{
                  width: 210, height: 20,
                  background: `${woodGrain(4, 0.05)}, ${faceGradient(40+Math.round(w*10), 30+Math.round(w*7), 18+Math.round(w*4), 0.92, 12)}`,
                  borderRadius: '0 0 3px 3px',
                }} />
                {/* Pedestal leg, tapering down toward the floor */}
                <div style={{
                  position: 'absolute', top: 128, left: '50%', transform: 'translateX(-50%)',
                  width: 10, height: 46, clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                  background: `${woodGrain(90, 0.06)}, ${faceGradient(34+Math.round(w*8), 25+Math.round(w*6), 14+Math.round(w*3))}`,
                }} />
              </div>
            </div>
          </div>

          {/* ═══════════════ PLANE — FOREGROUND (Z +30, your own seat, closest of all) ═══════════════ */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transform: `translateZ(30px) ${depth(0.50)}` }}>
            {/* The near edge of the seat you're sitting in, cropped by the frame */}
            <div style={{ position: 'absolute', bottom: '-6%', left: '-8%' }} aria-hidden="true">
              <div style={{ filter: 'blur(3px)' }}>
                <SeatBench brightness={b} warmth={w} width={230} />
              </div>
            </div>
            {/* A knee, draped under the blanket — the quietest possible "you are here" */}
            <div style={{
              position: 'absolute', bottom: '-9%', left: '4%',
              width: 120, height: 50, borderRadius: '50% 50% 0 0',
              background: `linear-gradient(180deg, rgba(${22+Math.round(w*8)},${17+Math.round(w*5)},${14+Math.round(w*3)},0.6), transparent)`,
              filter: 'blur(2px)',
            }} aria-hidden="true" />
            {/* A sleeve, resting near the table — closer to camera than the cup itself */}
            <div style={{ position: 'absolute', bottom: '16%', left: '17%', transform: 'rotate(-8deg)', opacity: 0.85 }} aria-hidden="true">
              <div style={{
                width: 34, height: 16, borderRadius: '8px 3px 3px 8px',
                background: `${fabricWeave(0.05)}, ${faceGradient(58+Math.round(w*10), 40+Math.round(w*6), 30+Math.round(w*4), 0.92, 10)}`,
              }} />
            </div>
            {/* Decorative only — see the flat overlay near the end of the
                component for the real click/hover hit-target. */}
            {/* Nudged up/right from the literal corner — that spot is where
                dev-mode browser chrome (Next.js's own dev indicator, some
                extensions) tends to sit and can steal the click. */}
            <div ref={bookmarkRef} aria-hidden="true" style={{ position: 'absolute', bottom: '9%', left: '12%', transform: 'rotate(-4deg)' }}>
              <div style={{
                width: 26, height: 18,
                background: `${specularHighlight('25%', '15%', '70%', 0.18)}, rgba(${Math.round(140+w*30)},${Math.round(50+w*10)},${Math.round(35+w*6)},0.85)`,
                borderRadius: '1px 3px 3px 1px',
                borderLeft: '2px solid rgba(20,14,8,0.6)',
                position: 'relative',
              }}>
                {bookmark001 && !isCollected(bookmark001.id) && (
                  <div style={{ position: 'absolute', bottom: -5, right: 2, width: 4, height: 10, background: `rgba(184,146,42,${0.4 + b * 0.2})` }} />
                )}
              </div>
            </div>
          </div>

          {/* ═══ LIGHTING — composited pools, not per-object color guessing ═══ */}
          {/* mix-blend-mode is deliberately avoided here — combined with the
              perspective/preserve-3d context above, it renders corrupted in
              some browsers/GPUs (confirmed against a real screenshot). Low
              flat-opacity overlays instead; softer than a true blend, but reliable. */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: lightPool('40%', '8%', `rgba(255,200,130,${0.16 + b * 0.06})`, '46%'),
          }} aria-hidden="true" />
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `linear-gradient(115deg, transparent 55%, rgba(140,175,215,${0.07 + (1-w)*0.05}) 100%)`,
          }} aria-hidden="true" />

          {/* A soft reflection sweeping across the compartment, catching brass as it goes */}
          {!reducedMotion && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
              <div style={{
                position: 'absolute', top: 0, bottom: 0, width: '18%',
                background: `linear-gradient(100deg, transparent, rgba(255,245,225,${0.03 + b * 0.03}), transparent)`,
                animation: `train-reflection-sweep 13s ease-in-out infinite ${swayState}`,
              }} />
            </div>
          )}
        </div>
      </div>

      {/* Arrival announcement — a small plaque, fixed to the screen like the
          rest of the train's UI chrome (settings, notebook tab), not part
          of the 3D scene. No literal time shown, just the same staged
          announcements a conductor would actually make. Hides once the
          train starts slowing; there's nothing left to announce once
          arrival has already begun. */}
      {rideState === 'riding' && arrivalMessage && (
        <div
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: Z_INDEX.SETTINGS,
            padding: '5px 10px',
            background: 'rgba(20,15,10,0.65)',
            border: '1px solid rgba(184,146,42,0.35)',
            borderRadius: 4,
            fontFamily: 'var(--font-mono,"Special Elite",monospace)',
            fontSize: 12, letterSpacing: '1px',
            color: 'rgba(242,232,213,0.8)',
          }}
          aria-label={arrivalMessage}
        >
          <span key={arrivalMessage} style={{ animation: 'train-announce-fade 1.2s ease both' }}>
            {arrivalMessage}
          </span>
        </div>
      )}

      {/* Positioned just beneath the window's own measured on-screen box
          (the same hitRects measurement the wipe-overlay uses) rather than
          a guessed fixed spot — it holds up at whatever size the window
          actually renders at. Portaled to the document body — see the note
          on the hit-targets section below for why: this reads real,
          on-screen pixel coordinates via getBoundingClientRect(), which
          only line up with position:fixed once rendered outside
          ScaledStage's transformed ancestor. */}
      {typeof document !== 'undefined' && createPortal(
        <TrainMusicPlayer
          style={hitRects.window ? {
            top: hitRects.window.top + hitRects.window.height + 10,
            left: hitRects.window.left + hitRects.window.width / 2,
            bottom: 'auto',
          } : undefined}
        />,
        document.body
      )}

      {/* Camera housing vignette — fixed to the screen, never pans, scales, or breathes */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 90% 82% at 54% 50%, transparent 55%, rgba(6,4,3,0.5) 100%),
          linear-gradient(180deg, rgba(4,3,2,0.38) 0%, transparent 16%, transparent 84%, rgba(4,3,2,0.42) 100%)
        `,
      }} aria-hidden="true" />

      {/* ═══ REAL HIT-TARGETS — flat, outside the perspective/preserve-3d
          rig entirely ═══ */}
      {/* Nested this many `translateZ`/`preserve-3d` levels deep, real click
          and hover hit-testing resolves to the wrong ancestor on real
          browsers (verified with `elementFromPoint` against a live render —
          it returned the outer sway wrapper, not the object). The visuals
          above stay exactly where they are for the depth illusion; these
          invisible, `position:fixed` duplicates carry the actual
          interaction. Positioned from a live `getBoundingClientRect()`
          measurement of the decorative object (see the `hitRects` effect
          above) rather than a hardcoded percentage — a fixed percentage
          only ever matches the one viewport size it was tuned against,
          which was the actual bug the first time around. A few px of pad
          is added on every side for an easier, more forgiving click.

          Portaled to the document body as a group: getBoundingClientRect()
          always reports real, on-screen pixel coordinates, but ScaledStage
          wraps this whole scene in a `transform` — which makes it the new
          containing block for any `position: fixed` descendant, resolved
          in that ancestor's *unscaled* coordinate space. Feeding a real-
          pixel measurement into that space landed these overlays wherever
          the scale factor happened to push them, detached from the visuals
          they're meant to sit on. Rendering them outside ScaledStage
          entirely (the same fix already used for the cursor) sidesteps the
          mismatch rather than trying to correct for it at every site. */}
      {typeof document !== 'undefined' && createPortal(<>
      {!isFinalCarriage && hitRects.coat && (
        <WorldObject
          label="A coat hanging from the luggage rack"
          hint={letter006 && !isCollected(letter006.id) ? 'Something in the pocket' : undefined}
          hoverCursorState="collect"
          isCollected={letter006 ? isCollected(letter006.id) : false}
          isCollectible={!!letter006}
          interactSfx="paper-unfold"
          onInteract={() => { if (letter006) { collect(letter006); reveal(letter006) } }}
          style={{
            position: 'fixed',
            top: hitRects.coat.top - 12, left: hitRects.coat.left - 12,
            width: hitRects.coat.width + 24, height: hitRects.coat.height + 24,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </WorldObject>
      )}
      {!isFinalCarriage && hitRects.napkin && (
        <WorldObject
          label="A napkin, sketched on"
          hint={doodle001 && !isCollected(doodle001.id) ? 'Someone drew something here' : undefined}
          hoverCursorState="collect"
          isCollected={doodle001 ? isCollected(doodle001.id) : false}
          isCollectible={!!doodle001}
          interactSfx="paper-rustle"
          onInteract={() => { if (doodle001) { collect(doodle001); reveal(doodle001) } }}
          style={{
            position: 'fixed',
            top: hitRects.napkin.top - 12, left: hitRects.napkin.left - 12,
            width: hitRects.napkin.width + 24, height: hitRects.napkin.height + 24,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </WorldObject>
      )}
      {isFinalCarriage && hitRects.envelope && (
        <WorldObject
          label="An envelope on the table, marked 'Open when ready'"
          hint={letter005 && !isCollected(letter005.id) ? "Open when ready" : undefined}
          hoverCursorState="collect"
          isCollected={letter005 ? isCollected(letter005.id) : false}
          isCollectible={!!letter005}
          interactSfx="wax-seal-break"
          onInteract={() => { if (letter005) { collect(letter005); reveal(letter005) } }}
          style={{
            position: 'fixed',
            top: hitRects.envelope.top - 12, left: hitRects.envelope.left - 12,
            width: hitRects.envelope.width + 24, height: hitRects.envelope.height + 24,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </WorldObject>
      )}
      {hitRects.bookmark && (
        <WorldObject
          label="A paperback left open on the seat beside you"
          hint={bookmark001 && !isCollected(bookmark001.id) ? 'A bookmark, tucked in deep' : undefined}
          hoverCursorState="collect"
          isCollected={bookmark001 ? isCollected(bookmark001.id) : false}
          isCollectible={!!bookmark001}
          interactSfx="page-turn"
          onInteract={() => { if (bookmark001) { collect(bookmark001); reveal(bookmark001) } }}
          style={{
            position: 'fixed',
            top: hitRects.bookmark.top - 12, left: hitRects.bookmark.left - 12,
            width: hitRects.bookmark.width + 24, height: hitRects.bookmark.height + 24,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </WorldObject>
      )}
      {isFinalCarriage && hitRects.postcard && (
        <WorldObject
          label="A postcard, resting on the windowsill"
          hint={postcard004 && !isCollected(postcard004.id) ? 'Somewhere we\'ve never been' : undefined}
          hoverCursorState="collect"
          isCollected={postcard004 ? isCollected(postcard004.id) : false}
          isCollectible={!!postcard004}
          interactSfx="postcard-flip"
          onInteract={() => { if (postcard004) { collect(postcard004); reveal(postcard004) } }}
          style={{
            position: 'fixed',
            top: hitRects.postcard.top - 12, left: hitRects.postcard.left - 12,
            width: hitRects.postcard.width + 24, height: hitRects.postcard.height + 24,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </WorldObject>
      )}

      {/* Window condensation wipe — same deep-3D hit-testing problem as the
          three collectibles above, fixed the same way: a flat overlay
          outside the rig, pinned to the window's measured position, that
          drives the canvas imperatively rather than relying on native
          pointer events reaching a <canvas> this many transform levels down. */}
      {hitRects.window && (
        <div
          onPointerDown={(e) => trainWindowRef.current?.startWipe(e.clientX, e.clientY)}
          onPointerMove={(e) => trainWindowRef.current?.continueWipe(e.clientX, e.clientY)}
          onPointerUp={() => trainWindowRef.current?.endWipe()}
          onPointerLeave={() => trainWindowRef.current?.endWipe()}
          style={{
            position: 'fixed',
            top: hitRects.window.top, left: hitRects.window.left,
            width: hitRects.window.width, height: hitRects.window.height,
            cursor: 'none', pointerEvents: 'auto',
          }}
        />
      )}

      {/* Stepping onto the platform — same deep-3D hit-testing fix as the
          collectibles and the window: a flat, measured overlay outside the
          rig. Waits indefinitely once it appears; nothing forces the player
          to leave. */}
      {hitRects.exit && (
        <StationObject
          label="Step onto the platform"
          hint="Leave whenever you're ready"
          onClick={() => transitionTo('the-field')}
          style={{
            position: 'fixed',
            top: hitRects.exit.top, left: hitRects.exit.left,
            width: hitRects.exit.width, height: hitRects.exit.height,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </StationObject>
      )}
      </>, document.body)}

      {/* Ambient caption */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
        fontStyle: 'italic', fontSize: 13,
        color: `rgba(242,232,213,${0.2+b*0.18})`,
        textAlign: 'center', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }} aria-hidden="true">
        {rideState === 'doors-open'
          ? 'The doors are open. Leave whenever you\'re ready.'
          : rideState === 'stopped'
            ? 'The train has come to rest.'
            : rideState === 'slowing'
              ? 'The train is slowing down.'
              : isFinalCarriage
                ? 'The dark outside is beginning to soften.'
                : 'The train moves gently through the dark.'}
      </div>

      <style>{`
        @keyframes train-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
        @keyframes train-sway {
          0%, 100% { transform: rotate(-0.35deg) translateX(-1.5px); }
          50% { transform: rotate(0.35deg) translateX(1.5px); }
        }
        @keyframes train-sway-secondary {
          0%, 100% { transform: rotate(-1.2deg); }
          50% { transform: rotate(1.2deg); }
        }
        @keyframes train-lamp-swing {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        @keyframes train-curtain-sway {
          0%, 100% { transform: skewX(-1.2deg); }
          50% { transform: skewX(1.2deg); }
        }
        @keyframes train-tea-ripple {
          0%, 100% { transform: translateX(-50%) scale(0.85); opacity: 0.5; }
          50% { transform: translateX(-50%) scale(1.05); opacity: 0.9; }
        }
        @keyframes train-dust-float {
          0% { transform: translate(0, 0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(6px, -40px); opacity: 0; }
        }
        @keyframes train-reflection-sweep {
          0% { left: -20%; }
          100% { left: 110%; }
        }
        @keyframes train-announce-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function SeatBench({ brightness, warmth, width }: { brightness: number; warmth: number; width: number }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={groundShadow(width, 0.35)} />
      <div style={{
        width, height: 34,
        background: `${fabricWeave(0.045)}, ${faceGradient(52+Math.round(warmth*10), 30+Math.round(warmth*6), 16+Math.round(warmth*3), 0.95, 12)}`,
        borderRadius: 4,
        borderTop: `1px solid rgba(184,146,42,${0.18 + brightness * 0.1})`,
        position: 'relative',
      }}>
        {/* Button tufting detail */}
        <div style={{ display: 'flex', justifyContent: 'space-evenly', paddingTop: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 3, height: 3, borderRadius: '50%',
              background: `rgba(184,146,42,${0.3 + brightness * 0.2})`,
            }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: `0 ${width * 0.08}px` }}>
        {[0, 1].map((i) => (
          <div key={i} style={{
            width: 6, height: 16, borderRadius: '0 0 2px 2px',
            background: 'linear-gradient(180deg, rgba(50,38,24,0.9), rgba(28,20,10,0.9))',
          }} />
        ))}
      </div>
    </div>
  )
}
