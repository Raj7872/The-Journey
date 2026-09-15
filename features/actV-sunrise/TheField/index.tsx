'use client'

import { useEffect, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { StationObject } from '@/components/station/StationObject'
import { groundShadow, faceGradient } from '@/lib/utils/shading'

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
      {/* Sky — warm horizon rising into a paler dawn blue */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(140+w*40)},${Math.round(160+w*30)},${Math.round(190+w*20)},1) 0%,
          rgba(${Math.round(220+w*20)},${Math.round(180+w*30)},${Math.round(140+w*30)},1) 55%,
          rgba(${Math.round(248+w*6)},${Math.round(206+w*16)},${Math.round(150+w*20)},1) 78%,
          rgba(${Math.round(250+w*5)},${Math.round(222+w*10)},${Math.round(175+w*12)},1) 100%)`,
        transition: 'background 4s ease',
      }} aria-hidden="true" />

      {/* The sun, low and soft — still climbing, not fully risen */}
      <div style={{
        position: 'absolute', bottom: '38%', left: '28%',
        width: 70, height: 70, borderRadius: '50%', transform: 'translateX(-50%)',
        background: `radial-gradient(circle, rgba(255,236,200,${0.5 + b * 0.42}) 0%, rgba(255,210,150,${0.25 + b * 0.28}) 45%, transparent 75%)`,
        boxShadow: `0 0 90px 40px rgba(255,215,160,${0.14 + b * 0.18})`,
      }} aria-hidden="true" />

      {/* Gentle lens flare — a couple of soft bokeh circles along the line
          from the sun toward the opposite corner, slowly breathing */}
      {!reducedMotion && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
          <div style={{
            position: 'absolute', bottom: '34%', left: '42%',
            width: 22, height: 22, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,240,215,0.35), transparent 70%)',
            animation: 'field-flare-breathe 9s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '46%', left: '58%',
            width: 10, height: 10, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,230,200,0.3), transparent 70%)',
            animation: 'field-flare-breathe 9s ease-in-out infinite 1.5s',
          }} />
        </div>
      )}

      {/* Distant tree line, low on the horizon */}
      <div style={{ position: 'absolute', bottom: '36%', left: 0, right: 0, height: '6%', opacity: 0.5 + b * 0.15 }} aria-hidden="true">
        {[6, 14, 22, 62, 70, 80, 90].map((x, i) => (
          <div key={x} style={{
            position: 'absolute', bottom: 0, left: `${x}%`,
            width: 14 + (i % 3) * 4, height: `${50 + (i % 4) * 15}%`,
            borderRadius: '50% 50% 10% 10%',
            background: `rgba(${60+Math.round(w*10)},${70+Math.round(w*8)},${45+Math.round(w*6)},0.85)`,
          }} />
        ))}
      </div>

      {/* Field — rolling ground, warm and soft rather than sharply perspective-lined */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
        background: `linear-gradient(180deg,
          rgba(${100+Math.round(w*20)},${130+Math.round(w*15)},${70+Math.round(w*10)},1) 0%,
          rgba(${70+Math.round(w*14)},${96+Math.round(w*12)},${50+Math.round(w*8)},1) 100%)`,
      }} aria-hidden="true" />

      {/* The path — a lighter, worn strip leading from the foreground toward the tree and bench */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '38%', opacity: 0.5 + b * 0.15 }}
        viewBox="0 0 100 40" preserveAspectRatio="none"
      >
        <path
          d="M 50 40 C 46 30, 54 22, 51 14 C 49 9, 52 5, 53 2"
          fill="none" stroke={`rgba(${210+Math.round(w*20)},${190+Math.round(w*15)},${140+Math.round(w*10)},0.5)`}
          strokeWidth="4" strokeLinecap="round"
        />
      </svg>

      {/* The tree, and the bench beneath it, small in the distance — where the path leads */}
      <div style={{ position: 'absolute', bottom: '35%', left: '52%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(30, 0.25)} />
          <div style={{
            width: 3, height: 22, margin: '0 auto',
            background: `rgba(${60+Math.round(w*10)},${45+Math.round(w*8)},${30+Math.round(w*5)},0.9)`,
          }} />
          <div style={{
            position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
            width: 34, height: 30, borderRadius: '50%',
            background: `rgba(${70+Math.round(w*14)},${92+Math.round(w*10)},${52+Math.round(w*6)},0.92)`,
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 14, height: 4,
            background: `rgba(${50+Math.round(w*8)},${38+Math.round(w*6)},${24+Math.round(w*4)},0.9)`,
          }} />
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

      {/* Overhead branch, near the top edge — the sense of standing beneath
          the tree's outer reach, swaying very slowly */}
      {!reducedMotion && (
        <div style={{
          position: 'absolute', top: '-4%', left: '4%', width: 220, height: 90,
          transformOrigin: 'top left',
          animation: 'field-branch-sway 10s ease-in-out infinite',
        }} aria-hidden="true">
          <div style={{
            width: '100%', height: '100%', borderRadius: '0 0 60% 40%',
            background: `radial-gradient(ellipse at 30% 20%, rgba(${76+Math.round(w*14)},${98+Math.round(w*10)},${56+Math.round(w*6)},0.9) 0%, rgba(${54+Math.round(w*10)},${72+Math.round(w*8)},${38+Math.round(w*4)},0.92) 70%)`,
          }} />
        </div>
      )}

      {/* The train, resting quiet at the edge of frame — just arrived, not yet departed */}
      <div style={{ position: 'absolute', bottom: '18%', right: '-4%', opacity: 0.85 }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(150, 0.3)} />
          <div style={{
            width: 150, height: 46,
            background: faceGradient(30+Math.round(w*8), 24+Math.round(w*5), 16+Math.round(w*3), 0.95, 10),
            borderRadius: '6px 20px 3px 3px',
          }} />
          {[14, 40, 66, 92, 118].map((x) => (
            <div key={x} style={{
              position: 'absolute', top: 10, left: x,
              width: 16, height: 14, borderRadius: 2,
              background: `rgba(${210+Math.round(w*20)},${175+Math.round(w*15)},${120+Math.round(w*10)},0.5)`,
            }} />
          ))}
        </div>
      </div>

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
        style={{ position: 'absolute', bottom: '33%', left: '52%', transform: 'translateX(-50%)', width: 60, height: 60 }}
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
        The morning is quiet. There's no hurry.
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
