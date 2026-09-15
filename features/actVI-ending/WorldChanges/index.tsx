'use client'

import { useEffect, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { StationObject } from '@/components/station/StationObject'
import { WorldObject } from '@/components/world/WorldObject'
import { groundShadow, faceGradient, paperFiber } from '@/lib/utils/shading'
import { TIMING } from '@/lib/constants/timing'
import { TICKETS } from '@/content/memories/tickets/tickets'

const ticket003 = TICKETS.find((m) => m.id === 'ticket-003')

/**
 * WorldChanges
 *
 * Everything here is mostly the world catching up to what already happened
 * in TheQuestion — the lighting/particle profile for 'world-changes' is
 * already warmer and already has flower petals drifting (interpolated
 * automatically by the existing scene-transition system; nothing to build
 * for that). What this component adds are the few discrete, felt beats the
 * spec asks for, each keyed to an existing `WORLD_CHANGES_*` constant:
 * birds, blooming flowers, a light pulse, the train leaving quietly, and
 * finally settling into stillness. No spectacle — every beat is soft.
 */
export function WorldChanges() {
  const { timeline } = useTimeline()
  const { transitionTo } = useScene()
  const { playSfx } = useAudio()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const reducedMotion = useReducedMotion()
  const w = timeline.lightingProfile.warmth
  const b = timeline.lightingProfile.brightness

  const [birdsIn, setBirdsIn] = useState(false)
  const [flowersIn, setFlowersIn] = useState(false)
  const [lightPulse, setLightPulse] = useState(false)
  const [trainDeparting, setTrainDeparting] = useState(false)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => { setBirdsIn(true); playSfx('birds-fly') }, TIMING.WORLD_CHANGES_BIRDS),
      setTimeout(() => setFlowersIn(true), TIMING.WORLD_CHANGES_FLOWERS),
      setTimeout(() => setLightPulse(true), TIMING.WORLD_CHANGES_LIGHT),
      setTimeout(() => { setTrainDeparting(true); playSfx('train-whistle') }, TIMING.WORLD_CHANGES_WHISTLE),
      setTimeout(() => setSettled(true), TIMING.WORLD_CHANGES_CAMERA),
    ]
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="The world, quietly changing"
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(160+w*40)},${Math.round(190+w*30)},${Math.round(220+w*20)},1) 0%,
          rgba(${Math.round(235+w*15)},${Math.round(205+w*22)},${Math.round(170+w*20)},1) 55%,
          rgba(${Math.round(252+w*4)},${Math.round(228+w*10)},${Math.round(190+w*10)},1) 100%)`,
        transition: 'background 3s ease',
      }} aria-hidden="true" />

      {/* Light pulse — one soft, brief bloom, not a flash */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 30% 45%, rgba(255,244,220,0.5), transparent 65%)',
        opacity: lightPulse ? 1 : 0,
        transition: 'opacity 3.5s ease',
      }} aria-hidden="true" />

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%',
        background: `linear-gradient(180deg,
          rgba(${108+Math.round(w*20)},${138+Math.round(w*16)},${76+Math.round(w*10)},1) 0%,
          rgba(${76+Math.round(w*14)},${102+Math.round(w*12)},${54+Math.round(w*8)},1) 100%)`,
      }} aria-hidden="true" />

      {/* Flowers, blooming into the field rather than falling as petals —
          a full meadow rather than a scattered few, with three soft color
          variants mixed in so it reads as wildflowers, not one species. */}
      {[4, 10, 16, 22, 28, 34, 40, 46, 54, 60, 66, 72, 78, 84, 90, 95].map((x, i) => {
        const variant = i % 3
        const petalColor = variant === 0
          ? `rgba(${225+Math.round(w*15)},${140+Math.round(w*20)},${150+Math.round(w*15)},0.92)` // pink
          : variant === 1
            ? `rgba(${240+Math.round(w*10)},${205+Math.round(w*15)},${120+Math.round(w*10)},0.92)` // gold
            : `rgba(${190+Math.round(w*10)},${168+Math.round(w*15)},${210+Math.round(w*10)},0.92)` // lavender
        const size = 8 + (i % 4)
        return (
          <div key={x} style={{
            position: 'absolute', bottom: `${2 + (i % 4) * 2.5}%`, left: `${x}%`,
            transform: `scale(${flowersIn || reducedMotion ? 1 : 0})`,
            transformOrigin: 'bottom center',
            transition: `transform 1.1s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.1}s`,
          }} aria-hidden="true">
            <div style={{ width: 1.5, height: 14 + (i % 3) * 3, background: 'rgba(70,95,50,0.85)', margin: '0 auto' }} />
            <div style={{
              position: 'absolute', top: -size * 0.5, left: '50%', transform: 'translateX(-50%)',
              width: size, height: size, borderRadius: '50%',
              background: petalColor,
              boxShadow: '0 0 0 2px rgba(255,240,220,0.5)',
            }} />
          </div>
        )
      })}

      {/* A hidden bonus, tucked among the flowers that just bloomed — no
          hint is ever shown, exactly like every other quiet secret in this
          app. Not part of the main journey; it only exists here, after
          she's already said yes. Finding it is the whole point. */}
      {flowersIn && ticket003 && (
        <WorldObject
          label="Something small, half-hidden among the flowers"
          hoverCursorState="collect"
          isCollected={isCollected(ticket003.id)}
          interactSfx="ticket-stamp"
          onInteract={() => { collect(ticket003); reveal(ticket003) }}
          style={{
            position: 'absolute', bottom: '4%', left: '24%',
            transform: reducedMotion ? 'rotate(-6deg) scale(1)' : undefined,
            opacity: reducedMotion ? 0.85 : undefined,
            animation: !reducedMotion ? 'ticket-settle 1.4s cubic-bezier(0.34,1.4,0.64,1) 0.4s both' : 'none',
          }}
        >
          <div style={{
            width: 22, height: 14,
            background: `${paperFiber()}, rgba(${Math.round(238+w*10)},${Math.round(228+w*8)},${Math.round(205+w*4)},0.95)`,
            border: '1px solid rgba(184,146,42,0.35)',
            borderRadius: 1,
          }} />
        </WorldObject>
      )}

      {/* Birds, a small flourish crossing the sky once */}
      {birdsIn && !reducedMotion && (
        <div style={{ position: 'absolute', top: '18%', left: '-5%', animation: 'birds-cross 6s linear forwards' }} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <svg key={i} width="16" height="8" viewBox="0 0 16 8" style={{ marginLeft: i * 20, opacity: 0.6 }}>
              <path d="M0 6 Q4 0, 8 6 Q12 0, 16 6" fill="none" stroke="rgba(60,50,40,0.7)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          ))}
        </div>
      )}

      {/* The train, departing quietly on its own */}
      <div style={{
        position: 'absolute', bottom: '16%', right: trainDeparting ? '110%' : '-4%',
        transition: 'right 9s ease-in',
        opacity: 0.85,
      }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(150, 0.28)} />
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

      {/* Once everything has settled, a quiet way forward */}
      {settled && (
        <StationObject
          label="Continue"
          hint="Continue"
          onClick={() => transitionTo('credits')}
          style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', width: 140, height: 30 }}
        >
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontStyle: 'italic', fontSize: 13,
            color: `rgba(60,45,30,${0.4 + b * 0.15})`,
            animation: 'question-fade-in 2s ease both',
          }}>
            Whenever you're ready.
          </div>
        </StationObject>
      )}

      <style>{`
        @keyframes birds-cross {
          from { left: -5%; }
          to { left: 105%; }
        }
        @keyframes question-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ticket-settle {
          0% { opacity: 0; transform: rotate(-6deg) scale(0.5) translateY(6px); }
          100% { opacity: 0.85; transform: rotate(-6deg) scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
