'use client'

import { PaneledDoor } from '@/components/scenery/DimensionalProps'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { StationObject } from '@/components/station/StationObject'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { groundShadow } from '@/lib/utils/shading'

/**
 * OutsideStation
 *
 * The experience begins here. Rain falls. The station glows ahead.
 * Everything else is dark. One thing draws the eye: the door.
 * Clicking the door begins the journey.
 */
export function OutsideStation() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.015 })

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  function handleEnterStation() {
    transitionTo('entrance-hall', 'walk-through-door', 2500)
  }

  return (
    <div
      ref={parallaxRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
      role="region"
      aria-label="Outside the station"
    >
      {/* Sky layer — deep navy */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 30%, 
            rgba(${Math.round(18 + warmth * 12)},${Math.round(20 + warmth * 8)},${Math.round(35 - warmth * 10)},0.8) 0%, 
            rgba(5,6,10,1) 100%)`,
          transition: 'background 4s ease',
        }}
        aria-hidden="true"
      />

      {/* Ground / pavement — wet reflections, faint joints instead of a tile grid */}
      <PerspectiveFloor
        height="35%"
        colorNear="rgba(10,12,20,0.95)"
        colorFar="rgba(5,6,10,1)"
        lineColor="rgba(180,200,230,0.05)"
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))` }}
      />

      {/* Street lamp reflections on wet ground */}
      <div
        style={{
          position: 'absolute',
          bottom: '32%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.3))`,
          width: 2,
          height: '20%',
          background: `linear-gradient(0deg, 
            rgba(212,132,58,${0.15 + warmth * 0.1}) 0%, 
            transparent 100%)`,
          filter: 'blur(4px)',
        }}
        aria-hidden="true"
      />

      {/* Station building — background */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.4))`,
          width: '70%',
          maxWidth: 700,
          height: '55%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        aria-hidden="true"
      >
        {/* Building silhouette */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `rgba(${Math.round(10 + warmth * 6)},${Math.round(11 + warmth * 4)},${Math.round(20 - warmth * 5)},0.95)`,
            borderTop: `1px solid rgba(184,146,42,${0.08 + brightness * 0.12})`,
            transition: 'background 4s ease, border-color 4s ease',
          }}
        />
      </div>

      {/* Station arch */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.5))`,
          width: 260,
          height: 300,
          borderTop: `1px solid rgba(184,146,42,${0.15 + brightness * 0.2})`,
          borderLeft: `1px solid rgba(184,146,42,${0.15 + brightness * 0.2})`,
          borderRight: `1px solid rgba(184,146,42,${0.15 + brightness * 0.2})`,
          borderBottom: 'none',
          borderRadius: '130px 130px 0 0',
          transition: 'border-color 4s ease',
        }}
        aria-hidden="true"
      />

      {/* Station windows — warm light within */}
      {[
        { left: '35%', top: '30%', w: 28, h: 36 },
        { left: '48%', top: '25%', w: 22, h: 30 },
        { left: '60%', top: '30%', w: 28, h: 36 },
      ].map((win, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: win.left,
            top: win.top,
            width: win.w,
            height: win.h,
            background: `rgba(212,132,58,${0.08 + brightness * 0.12 + warmth * 0.06})`,
            border: `1px solid rgba(184,146,42,${0.12 + brightness * 0.15})`,
            boxShadow: `0 0 ${20 + brightness * 20}px ${8 + brightness * 10}px rgba(212,132,58,${0.04 + brightness * 0.06})`,
            transform: `translateX(calc(var(--parallax-x, 0px) * (0.4 + i * 0.05)))`,
            transition: 'all 4s ease',
            animation: `lamp-flicker ${3.5 + i * 0.8}s ease-in-out infinite`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Left street lamp */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '22%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        }}
        aria-hidden="true"
      >
        <AmbientLight size="medium" flickerOffset={0.3} />
      </div>

      {/* Right street lamp */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          right: '22%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        }}
        aria-hidden="true"
      >
        <AmbientLight size="medium" flickerOffset={1.1} />
      </div>

      {/* "Platform 11:59" sign above entrance */}
      <div
        style={{
          position: 'absolute',
          bottom: '64%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.5))`,
          textAlign: 'center',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 14,
            letterSpacing: '2.5px',
            color: `rgba(184,146,42,${0.4 + brightness * 0.35})`,
            textTransform: 'uppercase',
            transition: 'color 4s ease',
          }}
        >
          Platform 11:59
        </div>
      </div>

      {/* A forgotten umbrella, left leaning by the wall — pure atmosphere */}
      <WorldObject
        label="An umbrella, forgotten against the wall"
        hint="Someone left in a hurry"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute',
          bottom: '27%',
          left: '30%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5)) rotate(-10deg)`,
          transformOrigin: 'bottom center',
          opacity: 0.4 + brightness * 0.2,
        }}
      >
        <div style={{ position: 'relative', width: 34, height: 48 }}>
          <div style={groundShadow(20, 0.25)} />
          {/* Canopy — wide dome, clearly reads as an umbrella rather than a cap */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 34, height: 17,
            borderRadius: '34px 34px 0 0',
            background: `rgba(184,146,42,0.14)`,
            borderTop: `1px solid rgba(184,146,42,0.4)`,
            borderLeft: `1px solid rgba(184,146,42,0.4)`,
            borderRight: `1px solid rgba(184,146,42,0.4)`,
          }} />
          {/* Ribs radiating from the apex */}
          {[-28, -14, 0, 14, 28].map((angle) => (
            <div key={angle} style={{
              position: 'absolute', top: 0, left: 17,
              width: 1, height: 17,
              background: 'rgba(184,146,42,0.32)',
              transformOrigin: 'top center',
              transform: `rotate(${angle}deg)`,
            }} />
          ))}
          {/* Pole */}
          <div style={{
            position: 'absolute', top: 16, left: 16.25,
            width: 1.5, height: 24,
            background: 'rgba(184,146,42,0.35)',
          }} />
          {/* Curved handle */}
          <div style={{
            position: 'absolute', bottom: 0, left: 10.5,
            width: 11, height: 11,
            borderRadius: '0 0 0 11px',
            borderBottom: '1.5px solid rgba(184,146,42,0.35)',
            borderLeft: '1.5px solid rgba(184,146,42,0.35)',
          }} />
        </div>
      </WorldObject>

      {/* THE DOOR — the only interaction on this scene */}
      <StationObject
        label="Enter the station"
        hint="Enter"
        onClick={handleEnterStation}
        hoverCursorState="hover"
        style={{
          position: 'absolute',
          bottom: '28%',
          left: '50%',
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.5))`,
          width: 170,
          height: 270,
        }}
      >
        <PaneledDoor width={170} height={270} />
      </StationObject>

      {/* Ground platform line */}
      <div
        style={{
          position: 'absolute',
          bottom: '28%',
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(184,146,42,${0.15 + brightness * 0.15}), transparent)`,
          transition: 'background 4s ease',
        }}
        aria-hidden="true"
      />

      {/* Ambient caption */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'rgba(242,232,213,0.22)',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          animation: 'hint-fade-in 2s ease 1s both',
        }}
        aria-hidden="true"
      >
        The last train leaves at midnight.
      </div>

      <style>{`
        @keyframes hint-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
