'use client'

import { TimberBench, DistantTrain } from '@/components/scenery/DimensionalProps'

import { MeadowLandscape } from '@/components/scenery/MeadowLandscape'

import { useEffect, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { StationObject } from '@/components/station/StationObject'

const GRASS_BLADES = Array.from({ length: 30 }, (_, i) => ({
  x: (i / 29) * 100,
  h: 16 + ((i * 7) % 5) * 4,
  delay: (i % 10) * 0.18,
}))

// A base color per bloom, mixed into the same warmth-reactive formula the
// rest of the scene uses — a real mixed wildflower meadow rather than one
// color repeated. Clustered to either side of the path, never on it.
const FLOWER_CORAL = { r: 230, g: 150, b: 110 }
const FLOWER_PALETTE = [
  FLOWER_CORAL,
  { r: 236, g: 206, b: 112 }, // buttery yellow
  { r: 218, g: 172, b: 202 }, // soft lavender-pink
  { r: 248, g: 238, b: 214 }, // cream white
]
const WILDFLOWER_X = [2, 6, 10, 14, 19, 24, 29, 64, 69, 74, 79, 84, 89, 94, 98]
const WILDFLOWERS = WILDFLOWER_X.map((x, i) => ({
  x,
  h: 14 + ((i * 5) % 4) * 5,
  tilt: (i % 2 ? 1 : -1) * (3 + (i % 3) * 2),
  petal: 4.5 + (i % 3) * 1,
  palette: FLOWER_PALETTE[i % FLOWER_PALETTE.length] ?? FLOWER_CORAL,
}))

/**
 * TheField
 *
 * The player has just stepped off the train onto open ground at sunrise —
 * the train sits quiet at the frame's edge, a path leads across the field
 * toward a distant tree and bench. Nothing here is urgent; the "walk"
 * toward the bench is one deliberate, unhurried step (a scene crossfade,
 * same mechanism every other walk in this app already uses), not a forced
 * animation.
 *
 * Populated rather than empty: grass moves in a slow wave, a butterfly and
 * a bird pass through on their own unpredictable schedules (never both at
 * once, never constant), seeds drift, a branch overhead sways, and a soft
 * lens flare breathes near the sun. Everything long, slow, warm — nothing
 * here is meant to be noticed consciously, just felt.
 */
export function TheField() {
  const { timeline } = useTimeline()
  const { transitionTo } = useScene()
  const reducedMotion = useReducedMotion()
  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth

  const [butterfly, setButterfly] = useState(false)
  const [bird, setBird] = useState<'perched' | 'leaving' | null>(null)
  const [seed, setSeed] = useState(0)

  // Each ambient visitor keeps its own unpredictable, self-rescheduling
  // rhythm — long gaps, never in sync with each other, never constant.
  useEffect(() => {
    if (reducedMotion) return
    let t: ReturnType<typeof setTimeout>
    const cycle = () => {
      t = setTimeout(() => {
        setButterfly(true)
        setTimeout(() => setButterfly(false), 9000)
        cycle()
      }, 10000 + Math.random() * 14000)
    }
    cycle()
    return () => clearTimeout(t)
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return
    let t: ReturnType<typeof setTimeout>
    const cycle = () => {
      t = setTimeout(() => {
        setBird('perched')
        const leaveTimer = setTimeout(() => {
          setBird('leaving')
          setTimeout(() => setBird(null), 1800)
        }, 4500 + Math.random() * 2500)
        cycle()
        return () => clearTimeout(leaveTimer)
      }, 14000 + Math.random() * 16000)
    }
    cycle()
    return () => clearTimeout(t)
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return
    let t: ReturnType<typeof setTimeout>
    const cycle = () => {
      t = setTimeout(() => {
        setSeed((n) => n + 1)
        cycle()
      }, 6000 + Math.random() * 8000)
    }
    cycle()
    return () => clearTimeout(t)
  }, [reducedMotion])

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="A field at sunrise, the train resting behind you"
    >
      <MeadowLandscape />
      <div style={{ position: 'absolute', bottom: '35%', left: '64%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <TimberBench width={90} />
          {/* A bird, occasionally perched here before it leaves */}
          {bird && (
            <div style={{
              position: 'absolute', top: -30, left: '50%',
              animation: bird === 'leaving' && !reducedMotion ? 'field-bird-leave 1.8s ease-in forwards' : 'none',
            }} aria-hidden="true">
              <svg width="10" height="7" viewBox="0 0 10 7">
                <path d="M0 5 Q2.5 1, 5 5 Q7.5 1, 10 5" fill="none" stroke={`rgba(50,40,30,0.8)`} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '22%', right: '-3%', opacity: .85 }} aria-hidden="true"><DistantTrain width={190} /></div>

      {/* A butterfly, occasionally drifting across */}
      {butterfly && !reducedMotion && (
        <div style={{ position: 'absolute', bottom: '20%', left: '-4%', animation: 'field-butterfly-cross 9s linear forwards' }} aria-hidden="true">
          <div style={{ animation: 'field-butterfly-flap 0.35s ease-in-out infinite alternate' }}>
            <svg width="12" height="10" viewBox="0 0 12 10">
              <ellipse cx="3.5" cy="3" rx="3" ry="2.4" fill={`rgba(${226+Math.round(w*15)},${150+Math.round(w*20)},${90+Math.round(w*10)},0.85)`} />
              <ellipse cx="8.5" cy="3" rx="3" ry="2.4" fill={`rgba(${226+Math.round(w*15)},${150+Math.round(w*20)},${90+Math.round(w*10)},0.85)`} />
              <rect x="5.5" y="1" width="1" height="8" rx="0.5" fill="rgba(40,30,20,0.7)" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating seeds, drifting slowly past */}
      {seed > 0 && !reducedMotion && (
        <div key={seed} style={{ position: 'absolute', bottom: '15%', left: '-2%', animation: 'field-seed-drift 12s linear forwards' }} aria-hidden="true">
          <div style={{ animation: 'field-seed-bob 2.4s ease-in-out infinite' }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: `rgba(255,250,240,0.8)`,
              boxShadow: '0 0 3px 2px rgba(255,250,240,0.3)',
            }} />
          </div>
        </div>
      )}

      {/* Long grass, moving in a slow wave rather than sitting still */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5%' }} aria-hidden="true">
        {GRASS_BLADES.map((blade, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: 0, left: `${blade.x}%`,
            width: 2, height: blade.h,
            background: `rgba(${74+Math.round(w*14)},${100+Math.round(w*12)},${54+Math.round(w*8)},0.85)`,
            transformOrigin: 'bottom center',
            animation: reducedMotion ? 'none' : `field-grass-wave 4.5s ease-in-out ${blade.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Wildflowers, foreground — a real mix, clustered along both sides
          of the path rather than a handful scattered thin */}
      {WILDFLOWERS.map((f) => (
        <div key={f.x} style={{ position: 'absolute', bottom: '2%', left: `${f.x}%`, opacity: 0.7 + b * 0.15 }} aria-hidden="true">
          <div style={{ width: 1.5, height: f.h, background: `rgba(70,95,50,0.8)`, transform: `rotate(${f.tilt}deg)` }} />
          <div style={{
            position: 'absolute', top: -f.petal + 2, left: -f.petal / 2, width: f.petal, height: f.petal, borderRadius: '50%',
            background: `rgba(${f.palette.r+Math.round(w*8)},${f.palette.g+Math.round(w*10)},${f.palette.b+Math.round(w*6)},0.9)`,
          }} />
        </div>
      ))}

      {/* Walk toward the bench — one deliberate step, not a forced animation */}
      <StationObject
        label="Walk toward the bench"
        hint="Keep walking"
        onClick={() => transitionTo('the-bench')}
        style={{ position: 'absolute', bottom: '34%', left: '64%', transform: 'translateX(-50%)', width: 60, height: 60 }}
      >
        <div style={{ width: '100%', height: '100%' }} />
      </StationObject>

      {/* Ambient caption */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
        fontStyle: 'italic', fontSize: 13,
        color: 'rgba(60,45,30,0.55)',
        textAlign: 'center', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }} aria-hidden="true">
        The morning is quiet. There&rsquo;s no hurry.
      </div>

      <style>{`
        @keyframes field-grass-wave {
          0%, 100% { transform: skewX(-6deg); }
          50% { transform: skewX(6deg); }
        }
        @keyframes field-branch-sway {
          0%, 100% { transform: rotate(-1.2deg); }
          50% { transform: rotate(1.2deg); }
        }
        @keyframes field-flare-breathe {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes field-butterfly-cross {
          0% { left: -4%; bottom: 20%; }
          40% { bottom: 28%; }
          70% { bottom: 16%; }
          100% { left: 96%; bottom: 24%; }
        }
        @keyframes field-butterfly-flap {
          from { transform: scaleX(1); }
          to { transform: scaleX(0.6); }
        }
        @keyframes field-bird-leave {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(60px, -70px); opacity: 0; }
        }
        @keyframes field-seed-drift {
          0% { left: -2%; bottom: 15%; opacity: 0; }
          10% { opacity: 0.85; }
          90% { opacity: 0.85; }
          100% { left: 92%; bottom: 32%; opacity: 0; }
        }
        @keyframes field-seed-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
