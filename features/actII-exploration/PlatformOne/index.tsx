'use client'

import { TimberBench } from '@/components/scenery/DimensionalProps'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { COLORS } from '@/lib/constants/colors'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { LETTERS } from '@/content/memories/letters/letters'
import { TICKETS } from '@/content/memories/tickets/tickets'
import { POLAROIDS } from '@/content/memories/polaroids/polaroids'

const letter001 = LETTERS.find((m) => m.id === 'letter-001')
const letter002 = LETTERS.find((m) => m.id === 'letter-002')
const ticket002 = TICKETS.find((m) => m.id === 'ticket-002')
const polaroid002 = POLAROIDS.find((m) => m.id === 'polaroid-002')

/**
 * PlatformOne
 *
 * Almost empty. Rain outside. Steam drifting across the tracks.
 * Old wooden benches. Lanterns. Suitcases.
 * Some benches contain forgotten letters. Some suitcases hold more.
 */
export function PlatformOne() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.022 })

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth
  const rain = timeline.weatherState.rainIntensity

  const platformColor = `rgba(${Math.round(10+warmth*5)},${Math.round(11+warmth*3)},${Math.round(20-warmth*5)},1)`

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Platform One"
    >
      {/* Indoor ceiling / canopy — top third */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '25%',
        background: `linear-gradient(180deg, rgba(4,5,9,0.98) 0%, ${platformColor} 100%)`,
        borderBottom: `1px solid rgba(184,146,42,${0.06 + brightness * 0.08})`,
        transition: 'all 3s ease',
      }} aria-hidden="true" />

      {/* Sky / outside — upper right (visible through open platform) */}
      <div style={{
        position: 'absolute', top: '25%', right: 0, width: '45%', height: '50%',
        background: `linear-gradient(180deg,
          rgba(4,6,12,0.95) 0%,
          rgba(${Math.round(6+warmth*4)},${Math.round(8+warmth*3)},${Math.round(16-warmth*4)},0.9) 100%)`,
        transform: `translateX(calc(var(--parallax-x, 0px) * 0.9))`,
        transition: 'background 3s ease',
      }} aria-hidden="true">
        {/* Rain streaks outside */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${8 + i * 8}%`,
            top: 0,
            width: 1,
            height: `${12 + Math.random() * 18}%`,
            background: `rgba(160,185,220,${rain * (0.08 + Math.random() * 0.12)})`,
            animation: `rain-fall ${0.5 + Math.random() * 0.6}s linear ${Math.random() * 2}s infinite`,
            transform: `rotate(${2 + rain * 8}deg)`,
          }} />
        ))}
      </div>

      {/* Platform floor — seams spaced closer together toward the back, suggesting depth */}
      <PerspectiveFloor
        height="30%"
        colorNear={`rgba(${Math.round(18+warmth*7)},${Math.round(15+warmth*4)},${Math.round(12+warmth*2)},1)`}
        colorFar={`rgba(${Math.round(6+warmth*4)},${Math.round(7+warmth*3)},${Math.round(12-warmth*3)},1)`}
        lineColor={`rgba(255,255,255,${0.12 + brightness * 0.1})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.2))` }}
      />

      {/* Track area — lower right opens to tracks */}
      <div style={{
        position: 'absolute', bottom: '30%', right: 0, width: '40%', height: '20%',
        background: 'linear-gradient(0deg, rgba(4,5,9,0.95) 0%, transparent 100%)',
        transform: `translateX(calc(var(--parallax-x, 0px) * 0.8))`,
      }} aria-hidden="true">
        {/* Track lines */}
        {[0, 1].map(i => (
          <div key={i} style={{
            position: 'absolute',
            bottom: `${20 + i * 30}%`,
            left: '10%', right: 0,
            height: 1,
            background: `rgba(180,180,200,${0.06 + brightness * 0.05 - i * 0.02})`,
          }} />
        ))}
      </div>

      {/* Ceiling lamps */}
      {[18, 50, 82].map((pct, i) => (
        <div key={pct} style={{
          position: 'absolute', top: 0, left: `${pct}%`,
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.4))`,
        }} aria-hidden="true">
          <AmbientLight size="medium" flickerOffset={i * 0.9} />
        </div>
      ))}

      {/* ── BENCH LEFT — a letter tucked underneath ── */}
      <WorldObject
        label="A wooden bench — something tucked underneath"
        hint={letter001 && !isCollected(letter001.id) ? 'Something under the bench' : undefined}
        hoverCursorState="collect"
        isCollected={letter001 ? isCollected(letter001.id) : false}
        isCollectible={!!letter001}
        interactSfx="paper-unfold"
        onInteract={() => {
          if (letter001) { collect(letter001); reveal(letter001) }
        }}
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '10%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TimberBench width={210} />
          {/* Letter visible under bench */}
          {letter001 && !isCollected(letter001.id) && (
            <div style={{
              position: 'absolute', bottom: -8, left: 16,
              width: 32, height: 4,
              background: `rgba(242,232,213,${0.25 + brightness * 0.15})`,
              transform: 'rotate(-2deg)',
            }} />
          )}
        </div>
      </WorldObject>

      {/* ── PAPERBACK — a second letter tucked inside ── */}
      <WorldObject
        label="A paperback left on the bench"
        hint={letter002 && !isCollected(letter002.id) ? 'A paperback, dog-eared' : undefined}
        hoverCursorState="collect"
        isCollected={letter002 ? isCollected(letter002.id) : false}
        isCollectible={!!letter002}
        interactSfx="paper-unfold"
        onInteract={() => {
          if (letter002) { collect(letter002); reveal(letter002) }
        }}
        style={{
          position: 'absolute',
          bottom: 'calc(30% + 34px)',
          left: '24%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        }}
      >
        <div style={{
          width: 26, height: 18,
          background: `rgba(${Math.round(120+warmth*40)},${Math.round(40+warmth*10)},${Math.round(30+warmth*5)},0.85)`,
          borderRadius: '1px 3px 3px 1px',
          borderLeft: '2px solid rgba(20,14,8,0.6)',
          transform: 'rotate(-6deg)',
        }} />
      </WorldObject>

      {/* ── BENCH RIGHT — a ticket left behind ── */}
      <WorldObject
        label="Another bench — a train ticket on the seat"
        hint={ticket002 && !isCollected(ticket002.id) ? 'A ticket' : undefined}
        hoverCursorState="collect"
        isCollected={ticket002 ? isCollected(ticket002.id) : false}
        isCollectible={!!ticket002}
        interactSfx="ticket-stamp"
        onInteract={() => {
          if (ticket002) { collect(ticket002); reveal(ticket002) }
        }}
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '55%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.65))`,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TimberBench width={210} />
          {/* Ticket on bench */}
          {ticket002 && !isCollected(ticket002.id) && (
            <div style={{
              position: 'absolute', bottom: 32, right: 45,
              width: 28, height: 14,
              background: `rgba(242,232,213,${0.3 + brightness * 0.15})`,
              border: `1px solid rgba(184,146,42,0.2)`,
              transform: 'rotate(4deg)',
            }} />
          )}
        </div>
      </WorldObject>

      {/* ── DEPARTURE SIGN — a polaroid wedged in the frame ── */}
      <WorldObject
        label="The departure sign — something wedged in its frame"
        hint={polaroid002 && !isCollected(polaroid002.id) ? 'A photograph' : undefined}
        hoverCursorState="collect"
        isCollected={polaroid002 ? isCollected(polaroid002.id) : false}
        isCollectible={!!polaroid002}
        interactSfx="polaroid-develop"
        onInteract={() => {
          if (polaroid002) { collect(polaroid002); reveal(polaroid002) }
        }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))`,
        }}
      >
        <div style={{
          width: 54, height: 30,
          background: 'rgba(6,7,10,0.9)',
          border: `1px solid rgba(184,146,42,${0.2 + brightness * 0.15})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono,"Special Elite",monospace)', fontSize: 6, letterSpacing: '1px', color: `rgba(212,132,58,${0.4+brightness*0.3})` }}>
            PLATFORM 01
          </span>
        </div>
        {polaroid002 && !isCollected(polaroid002.id) && (
          <div style={{
            position: 'absolute', bottom: -6, right: -4,
            width: 20, height: 24,
            background: COLORS.PAPER_CREAM,
            transform: 'rotate(8deg)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }} />
        )}
      </WorldObject>

      {/* ── SUITCASE — heavier than it looks, but nothing inside worth finding tonight ── */}
      <WorldObject
        label="An abandoned suitcase"
        hint="Heavier than it looks"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '34%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.68))`,
          opacity: 0.75 + brightness * 0.15,
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(48, 0.4)} />
          <div style={{
            width: 44, height: 34,
            background: faceGradient(28+Math.round(warmth*8), 20+Math.round(warmth*5), 14+Math.round(warmth*3)),
            border: `1px solid rgba(184,146,42,${0.15 + brightness * 0.1})`,
            borderRadius: 2,
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 18, height: 4, background: `rgba(184,146,42,${0.2 + brightness * 0.15})`, borderRadius: 2 }} />
            <div style={{
              position: 'absolute', left: -4, top: '50%',
              width: 4, height: 8,
              background: `rgba(184,146,42,${0.25 + brightness * 0.15})`,
              borderRadius: 1,
              transform: 'translateY(-50%)',
            }} />
          </div>
        </div>
      </WorldObject>

      {/* Fresh flowers beside an empty bench — nobody sitting there tonight */}
      <div style={{
        position: 'absolute', bottom: '31%', left: '78%',
        transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        opacity: 0.5 + brightness * 0.2,
      }} aria-hidden="true">
        <div style={{ width: 1, height: 16, background: `rgba(61,90,71,${0.4 + brightness * 0.2})`, margin: '0 auto' }} />
        <div style={{ display: 'flex', gap: 3, marginTop: -4 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: `rgba(${212 - i * 10},${132 + i * 20},${58 + i * 30},0.6)`,
            }} />
          ))}
        </div>
      </div>

      {/* ── SLEEPING CAT (ambient micro-moment) ── */}
      <div style={{
        position: 'absolute', bottom: '30%', right: '18%',
        transform: `translateX(calc(var(--parallax-x, 0px) * 0.55))`,
        opacity: 0.45 + brightness * 0.2,
      }} aria-label="A sleeping cat on the bench" role="img">
        <div style={{
          width: 28, height: 14,
          background: `rgba(${Math.round(60+warmth*10)},${Math.round(50+warmth*8)},${Math.round(40+warmth*5)},0.6)`,
          borderRadius: '50% 50% 40% 40%',
          position: 'relative',
        }}>
          {/* Cat head */}
          <div style={{
            position: 'absolute', top: -8, left: 2,
            width: 12, height: 10,
            background: `rgba(${Math.round(60+warmth*10)},${Math.round(50+warmth*8)},${Math.round(40+warmth*5)},0.7)`,
            borderRadius: '50%',
          }} />
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', padding: '0 28px',
      }}>
        <button
          onClick={() => transitionTo('main-hall', 'camera-move', 2000)}
          style={{
            background: `rgba(212,132,58,${0.08 + brightness * 0.06})`,
            border: `1px solid rgba(212,132,58,${0.35 + brightness * 0.15})`,
            borderRadius: 3,
            cursor: 'none',
            fontFamily: 'var(--font-mono,"Special Elite",monospace)',
            fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
            color: `rgba(212,132,58,${0.6 + brightness * 0.3})`,
            padding: '10px 16px',
            boxShadow: `0 0 16px 4px rgba(212,132,58,${0.14 + brightness * 0.1})`,
            transition: 'all 0.3s ease',
          }}
          aria-label="Return to main hall"
        >
          ← Hall
        </button>
        <button
          onClick={() => transitionTo('platform-cafe', 'walk-through-door', 2500)}
          style={{
            background: `rgba(212,132,58,${0.08 + brightness * 0.06})`,
            border: `1px solid rgba(212,132,58,${0.35 + brightness * 0.15})`,
            borderRadius: 3,
            cursor: 'none',
            fontFamily: 'var(--font-mono,"Special Elite",monospace)',
            fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
            color: `rgba(212,132,58,${0.6 + brightness * 0.3})`,
            padding: '10px 16px',
            boxShadow: `0 0 16px 4px rgba(212,132,58,${0.14 + brightness * 0.1})`,
            transition: 'all 0.3s ease',
          }}
          aria-label="Walk to the Platform Café"
        >
          Café →
        </button>
      </div>

      <style>{`
        @keyframes rain-fall {
          from { transform: translateY(-10%) rotate(var(--slant, 5deg)); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          to { transform: translateY(110%) rotate(var(--slant, 5deg)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
