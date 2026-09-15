'use client'

import { useEffect, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { useAmbientEvent } from '@/engine/AmbientEventManager/AmbientEventContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { Clock } from '@/components/station/Clock'
import { DepartureBoard } from '@/components/station/DepartureBoard'
import { RainWindow } from '@/components/station/RainWindow'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { TIMING } from '@/lib/constants/timing'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { POSTCARDS } from '@/content/memories/postcards/postcards'

const postcard001 = POSTCARDS.find((m) => m.id === 'postcard-001')

/**
 * MainHall
 *
 * The largest room. High ceilings. Old chandeliers.
 * The departure board dominates the far wall.
 * Benches, a newspaper stand, the lost & found counter.
 * Every object invites curiosity.
 */
export function MainHall() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const { currentEvent } = useAmbientEvent()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.018 })
  const [fluttering, setFluttering] = useState(false)

  useEffect(() => {
    if (currentEvent?.type !== 'newspaper-flutter') return
    setFluttering(true)
    const t = setTimeout(() => setFluttering(false), TIMING.AMBIENT_EVENT_DURATION)
    return () => clearTimeout(t)
  }, [currentEvent])

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  const wallColor = `rgba(${Math.round(11+warmth*7)},${Math.round(12+warmth*4)},${Math.round(22-warmth*6)},1)`
  const borderAlpha = 0.06 + brightness * 0.1

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Station main hall"
    >
      {/* Back wall */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${wallColor} 0%, rgba(${Math.round(14+warmth*8)},${Math.round(13+warmth*5)},${Math.round(18-warmth*4)},1) 100%)`,
          transition: 'background 3s ease',
        }}
        aria-hidden="true"
      />

      {/* High ceiling with arch details */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '22%',
          background: `linear-gradient(180deg, rgba(4,5,9,0.97) 0%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Ceiling structural ribs */}
      {[20, 40, 60, 80].map((pct) => (
        <div
          key={pct}
          style={{
            position: 'absolute',
            top: 0,
            left: `${pct}%`,
            width: 1,
            height: '22%',
            background: `linear-gradient(180deg, rgba(184,146,42,${borderAlpha * 1.5}), transparent)`,
            transform: `translateX(calc(var(--parallax-x, 0px) * (0.4 + pct * 0.003)))`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Ceiling lamps */}
      {[20, 50, 80].map((pct, i) => (
        <div
          key={pct}
          style={{
            position: 'absolute',
            top: 0,
            left: `${pct}%`,
            transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.4))`,
          }}
          aria-hidden="true"
        >
          <AmbientLight size="large" flickerOffset={i * 1.3} />
        </div>
      ))}

      {/* Stone floor — seams spaced closer together toward the back, suggesting depth */}
      <PerspectiveFloor
        height="26%"
        colorNear={`rgba(${Math.round(20+warmth*8)},${Math.round(17+warmth*5)},${Math.round(14+warmth*3)},1)`}
        colorFar={`rgba(${Math.round(14+warmth*8)},${Math.round(13+warmth*5)},${Math.round(18-warmth*4)},1)`}
        lineColor={`rgba(255,255,255,${0.14 + brightness * 0.1})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.2))` }}
      />

      {/* ── DEPARTURE BOARD — hero element ── */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.3))`,
          width: 'min(560px, 80%)',
        }}
      >
        <DepartureBoard />
      </div>

      {/* ── LARGE CLOCK top-left ── */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '10%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))`,
        }}
      >
        <Clock size={90} />
      </div>

      {/* ── BENCH — pure atmosphere, an old paperback left behind ── */}
      <WorldObject
        label="Wooden bench — an old paperback rests on it"
        hint="Someone's forgotten paperback"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute',
          bottom: '26%',
          left: '15%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        }}
      >
        {/* Bench body */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={groundShadow(100, 0.4)} />
          <div style={{
            width: 110,
            height: 14,
            background: `linear-gradient(180deg, rgba(${Math.round(50+warmth*15)},${Math.round(36+warmth*10)},${Math.round(22+warmth*5)},0.9), rgba(38,28,16,0.9))`,
            borderRadius: 2,
            borderTop: `1px solid rgba(184,146,42,${0.12 + brightness * 0.1})`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6,
                height: 22,
                borderRadius: '0 0 2px 2px',
                background: 'linear-gradient(180deg, rgba(50,38,24,0.9), rgba(28,20,10,0.9))',
              }} />
            ))}
          </div>
        </div>
      </WorldObject>

      {/* ── NEWSPAPER STAND — pages stir in the newspaper-flutter event ── */}
      <WorldObject
        label="Newspaper stand"
        hint="Today's edition"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute',
          bottom: '26%',
          right: '14%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.7))`,
          opacity: 0.7 + brightness * 0.2,
        }}
      >
        <div style={{
          position: 'relative',
          width: 44,
          height: 52,
          background: faceGradient(18+Math.round(warmth*5), 16+Math.round(warmth*3), 12+Math.round(warmth*2)),
          border: `1px solid rgba(184,146,42,${0.12 + brightness * 0.1})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={groundShadow(40, 0.35)} />
          <div style={{
            width: '70%',
            height: '80%',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            justifyContent: 'center',
            transformOrigin: 'left center',
            transition: 'transform 0.3s ease',
            transform: fluttering ? 'skewY(-3deg)' : 'skewY(0deg)',
          }}>
            {[1, 0.6, 0.6, 0.4].map((w, i) => (
              <div key={i} style={{
                height: 1.5,
                width: `${w * 100}%`,
                background: `rgba(242,232,213,${0.15 + brightness * 0.1})`,
              }} />
            ))}
          </div>
        </div>
      </WorldObject>

      {/* ── LOST & FOUND COUNTER — a postcard, face-down ── */}
      <WorldObject
        label="Lost and found counter — a postcard face-down on it"
        hint={postcard001 && !isCollected(postcard001.id) ? 'A postcard, face-down' : undefined}
        hoverCursorState="collect"
        isCollected={postcard001 ? isCollected(postcard001.id) : false}
        isCollectible={!!postcard001}
        interactSfx="postcard-flip"
        onInteract={() => {
          if (postcard001) { collect(postcard001); reveal(postcard001) }
        }}
        style={{
          position: 'absolute',
          bottom: '26%',
          right: '6%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.55))`,
          opacity: 0.65 + brightness * 0.2,
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(84, 0.4)} />
          <div style={{
            width: 80,
            height: 34,
            background: faceGradient(22+Math.round(warmth*8), 18+Math.round(warmth*5), 14+Math.round(warmth*3), 0.85),
            borderTop: `1px solid rgba(184,146,42,${0.1 + brightness * 0.08})`,
            borderLeft: `1px solid rgba(184,146,42,${0.1 + brightness * 0.08})`,
            borderRight: `1px solid rgba(184,146,42,${0.1 + brightness * 0.08})`,
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono,"Special Elite",monospace)',
              fontSize: 7,
              color: `rgba(184,146,42,${0.3 + brightness * 0.2})`,
              letterSpacing: '1px',
              textAlign: 'center',
            }}>LOST &<br/>FOUND</span>
            {postcard001 && !isCollected(postcard001.id) && (
              <div style={{
                position: 'absolute', top: -6, right: 8,
                width: 18, height: 12,
                background: `rgba(${Math.round(30+warmth*10)},${Math.round(24+warmth*6)},${Math.round(18+warmth*3)},0.9)`,
                transform: 'rotate(-4deg)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }} />
            )}
          </div>
          <div style={{
            width: 90,
            height: 8,
            background: `rgba(${Math.round(14+warmth*5)},${Math.round(12+warmth*3)},${Math.round(10+warmth*2)},0.9)`,
            marginLeft: -5,
          }} />
        </div>
      </WorldObject>

      {/* ── WINDOW — right side ── */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '4%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.8))`,
        }}
      >
        <RainWindow width={100} height={130} />
      </div>

      {/* ── NAVIGATION — to adjacent scenes ── */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', padding: '0 28px',
      }}>
        <button
          onClick={() => transitionTo('entrance-hall', 'camera-move', 2000)}
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
          aria-label="Return to entrance hall"
        >
          ← Exit
        </button>
        <button
          onClick={() => transitionTo('platform-one', 'camera-move', 2200)}
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
          aria-label="Walk to Platform One"
        >
          Platform One →
        </button>
      </div>
    </div>
  )
}
