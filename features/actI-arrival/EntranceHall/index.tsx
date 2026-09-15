'use client'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { Clock } from '@/components/station/Clock'
import { StationObject } from '@/components/station/StationObject'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { TICKETS } from '@/content/memories/tickets/tickets'

const ticket001 = TICKETS.find((m) => m.id === 'ticket-001')

/**
 * EntranceHall
 *
 * Warm lamps flicker on one by one. An old clock shows 11:58.
 * Worn stone floor. The sound of rain recedes behind heavy doors.
 * Travel posters line the walls — some subtly referencing memories.
 * The player is drawn deeper by a corridor of light.
 */
export function EntranceHall() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.02 })

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  const wallAlpha = 0.06 + brightness * 0.1

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Station entrance hall"
    >
      {/* Back wall */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, 
            rgba(${Math.round(10+warmth*6)},${Math.round(11+warmth*4)},${Math.round(20-warmth*5)},1) 0%, 
            rgba(${Math.round(14+warmth*8)},${Math.round(13+warmth*5)},${Math.round(18-warmth*4)},1) 100%)`,
          transition: 'background 3s ease',
        }}
        aria-hidden="true"
      />

      {/* Stone floor — seams spaced closer together toward the back, suggesting depth */}
      <PerspectiveFloor
        height="28%"
        colorNear={`rgba(${Math.round(20+warmth*8)},${Math.round(17+warmth*5)},${Math.round(14+warmth*3)},0.95)`}
        colorFar={`rgba(${Math.round(10+warmth*6)},${Math.round(11+warmth*4)},${Math.round(20-warmth*5)},1)`}
        lineColor={`rgba(255,255,255,${0.12 + brightness * 0.1})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.3))` }}
      />

      {/* Ceiling */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20%',
          background: `linear-gradient(180deg, 
            rgba(5,6,10,0.95) 0%, 
            transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Left wall panelling */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          bottom: '28%',
          left: 0,
          width: '18%',
          borderRight: `1px solid rgba(184,146,42,${wallAlpha})`,
          background: `rgba(${Math.round(12+warmth*5)},${Math.round(10+warmth*3)},${Math.round(8+warmth*2)},0.3)`,
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.8))`,
          transition: 'all 3s ease',
        }}
        aria-hidden="true"
      >
        {/* Travel poster */}
        <div style={{ margin: '20px 12px', opacity: 0.4 }}>
          <div style={{
            width: '100%',
            paddingBottom: '140%',
            background: `rgba(184,146,42,${0.06 + brightness * 0.04})`,
            border: `1px solid rgba(184,146,42,${0.1 + brightness * 0.08})`,
          }} />
        </div>
      </div>

      {/* Right wall panelling with poster */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          bottom: '28%',
          right: 0,
          width: '18%',
          borderLeft: `1px solid rgba(184,146,42,${wallAlpha})`,
          background: `rgba(${Math.round(12+warmth*5)},${Math.round(10+warmth*3)},${Math.round(8+warmth*2)},0.3)`,
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.8))`,
          transition: 'all 3s ease',
        }}
        aria-hidden="true"
      >
        <div style={{ margin: '20px 12px', opacity: 0.4 }}>
          <div style={{
            width: '100%',
            paddingBottom: '140%',
            background: `rgba(184,146,42,${0.06 + brightness * 0.04})`,
            border: `1px solid rgba(184,146,42,${0.1 + brightness * 0.08})`,
          }} />
        </div>
      </div>

      {/* Left ceiling lamp */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '25%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))`,
        }}
        aria-hidden="true"
      >
        <AmbientLight size="medium" flickerOffset={0} />
      </div>

      {/* Right ceiling lamp */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: '25%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))`,
        }}
        aria-hidden="true"
      >
        <AmbientLight size="medium" flickerOffset={1.6} />
      </div>

      {/* Clock on back wall */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.3))`,
        }}
      >
        <Clock size={80} />
      </div>

      {/* Abandoned luggage trolley */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '12%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.7))`,
          opacity: 0.25 + brightness * 0.15,
        }}
        aria-hidden="true"
      >
        <div style={groundShadow(38, 0.3)} />
        <div style={{
          width: 36,
          height: 26,
          borderTop: `1px solid rgba(184,146,42,0.3)`,
          borderLeft: `1px solid rgba(184,146,42,0.3)`,
          borderRight: `1px solid rgba(184,146,42,0.3)`,
          borderBottom: 'none',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: 4,
            right: 4,
            height: 8,
            borderLeft: '1px solid rgba(184,146,42,0.2)',
            borderRight: '1px solid rgba(184,146,42,0.2)',
          }} />
        </div>
      </div>

      {/* Vintage ticket machine — a ticket sticking out of it */}
      <WorldObject
        label="A vintage ticket machine"
        hint={ticket001 && !isCollected(ticket001.id) ? 'A ticket, half-printed' : undefined}
        hoverCursorState="collect"
        isCollected={ticket001 ? isCollected(ticket001.id) : false}
        isCollectible={!!ticket001}
        interactSfx="ticket-stamp"
        onInteract={() => {
          if (ticket001) { collect(ticket001); reveal(ticket001) }
        }}
        style={{
          position: 'absolute',
          bottom: '29%',
          right: '14%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.75))`,
          opacity: 0.5 + brightness * 0.2,
        }}
      >
        <div style={{
          width: 26, height: 40,
          background: faceGradient(16+Math.round(warmth*6), 14+Math.round(warmth*4), 12+Math.round(warmth*2), 0.9, 10),
          border: `1px solid rgba(184,146,42,${0.18 + brightness * 0.12})`,
          borderRadius: '2px 2px 0 0',
          position: 'relative',
        }}>
          <div style={groundShadow(30, 0.35)} />
          <div style={{
            position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
            width: 14, height: 8,
            border: `1px solid rgba(184,146,42,0.25)`,
          }} />
          {ticket001 && !isCollected(ticket001.id) && (
            <div style={{
              position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
              width: 8, height: 14,
              background: `rgba(242,232,213,${0.35 + brightness * 0.15})`,
            }} />
          )}
        </div>
      </WorldObject>

      {/* Corridor to main hall — the natural draw */}
      <StationObject
        label="Walk to the main hall"
        onClick={() => transitionTo('main-hall', 'camera-move', 2200)}
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.2))`,
          width: 120,
          height: '55%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {/* Arch perspective */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse 80% 60% at 50% 80%, 
              rgba(212,132,58,${0.04 + brightness * 0.06}) 0%, 
              transparent 70%)`,
            borderTop: `1px solid rgba(184,146,42,${0.08 + brightness * 0.1})`,
            borderLeft: `1px solid rgba(184,146,42,${0.08 + brightness * 0.1})`,
            borderRight: `1px solid rgba(184,146,42,${0.08 + brightness * 0.1})`,
            borderBottom: 'none',
            borderRadius: '60px 60px 0 0',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono, "Special Elite", monospace)',
              fontSize: 8,
              letterSpacing: '2px',
              color: `rgba(212,132,58,${0.3 + brightness * 0.3})`,
              textTransform: 'uppercase',
            }}
          >
            Main Hall →
          </span>
        </div>
      </StationObject>

      {/* Rain footprints on floor */}
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '45%',
          opacity: 0.08 + brightness * 0.05,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {[0, 12, 24, 36].map((offset) => (
          <div
            key={offset}
            style={{
              width: 6,
              height: 10,
              background: 'rgba(184,146,42,0.6)',
              borderRadius: '3px 3px 0 0',
              marginBottom: 8,
              transform: offset % 24 === 0 ? 'translateX(8px)' : 'translateX(-8px)',
              opacity: 1 - offset / 60,
            }}
          />
        ))}
      </div>
    </div>
  )
}
