'use client'

import { useEffect, useRef, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { useDebug } from '@/engine/DebugManager/DebugContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AmbientLight } from '@/components/station/AmbientLight'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { ArrivalCarriage } from '@/components/train/ArrivalCarriage'
import { TIMING } from '@/lib/constants/timing'

/**
 * TrainArrival
 *
 * A choreographed, non-interactive-until-the-end sequence: a light in the
 * distance, a horn, the rails beginning to glint, the train growing until
 * it fills the platform, steam, and finally an open door. All timing comes
 * from TIMING.TRAIN_ARRIVAL_* so the beats are defined in one place.
 *
 * The player is never moved forward automatically — once the door opens,
 * the sequence just holds there, patiently, until the door is clicked.
 *
 * Wrapped by a keyed child (TrainArrivalSequence) so the debug "replay
 * arrival" control can restart the whole choreography for free — bumping
 * the key remounts the subtree, which resets both the setTimeout schedule
 * and every CSS animation still mid-flight.
 */
export function TrainArrival() {
  const { debugState } = useDebug()
  return <TrainArrivalSequence key={debugState.trainArrivalReplayToken} />
}

function TrainArrivalSequence() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { playSfx } = useAudio()
  const { debugState } = useDebug()
  const reducedMotion = useReducedMotion()

  const [whistlePlayed, setWhistlePlayed] = useState(false)
  const [trainVisible, setTrainVisible] = useState(false)
  const [trainStopped, setTrainStopped] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [conductorReady, setConductorReady] = useState(false)
  const hasBoarded = useRef(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => { playSfx('train-whistle'); setWhistlePlayed(true) }, TIMING.TRAIN_ARRIVAL_WHISTLE),
      // One carriage follows the approach from the distant light to the platform.
      setTimeout(() => setTrainVisible(true), TIMING.TRAIN_ARRIVAL_VISIBLE),
      setTimeout(() => { playSfx('train-brake'); setTrainStopped(true) }, TIMING.TRAIN_ARRIVAL_STOP),
      setTimeout(() => { playSfx('train-door'); setDoorsOpen(true) }, TIMING.TRAIN_ARRIVAL_DOOR),
      setTimeout(() => setConductorReady(true), TIMING.TRAIN_ARRIVAL_NOD),
    ]
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth
  const paused = debugState.trainMovementPaused
  const playState = paused ? 'paused' : 'running'

  function handleBoard() {
    if (hasBoarded.current) return
    hasBoarded.current = true
    transitionTo('train-interior', 'train-board')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} role="region" aria-label="The last train arriving">
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(7+w*4)},${Math.round(8+w*3)},${Math.round(16-w*3)},1) 0%,
          rgba(${Math.round(9+w*5)},${Math.round(9+w*3)},${Math.round(14-w*2)},1) 100%)`,
        transition: 'background 3s ease',
        // Very subtle whole-scene vibration once the train is close, easing
        // back to stillness the instant it stops.
        animation: !reducedMotion && whistlePlayed && !trainStopped
          ? `train-vibration 0.16s linear infinite ${playState}`
          : 'none',
      }} aria-hidden="true" />

      <PerspectiveFloor
        height="28%"
        colorNear={`rgba(${Math.round(16+w*7)},${Math.round(14+w*4)},${Math.round(11+w*2)},1)`}
        colorFar={`rgba(${Math.round(7+w*4)},${Math.round(8+w*3)},${Math.round(14-w*3)},1)`}
        lineColor={`rgba(255,255,255,${0.1 + b * 0.08})`}
      />

      {/* Distant skyline beyond the vanishing point — gives the empty far
          distance something to hold besides flat gradient */}
      <div style={{
        position: 'absolute', bottom: '38%', left: '50%', transform: 'translateX(-50%)',
        width: '50%', height: '10%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3,
        opacity: 0.5 + b * 0.2,
      }} aria-hidden="true">
        {[10, 16, 8, 22, 12, 18, 9].map((h, i) => (
          <div key={i} style={{
            width: 10, height: `${h * 3}px`,
            background: `rgba(${8+Math.round(w*4)},${9+Math.round(w*3)},${16-Math.round(w*3)},0.9)`,
          }} />
        ))}
      </div>

      {/* Trackside lampposts — small, receding toward the vanishing point,
          reinforcing depth on either side of the empty track */}
      {[0, 1, 2].map((i) => {
        const depthT = i / 2 // 0 (near) -> 1 (far)
        const size = 1 - depthT * 0.65
        return [-1, 1].map((side) => (
          <div key={`${side}-${i}`} style={{
            position: 'absolute',
            bottom: `${29 + depthT * 14}%`,
            left: `${50 + side * (26 - depthT * 20)}%`,
            opacity: (0.5 + b * 0.3) * (1 - depthT * 0.4),
          }} aria-hidden="true">
            <div style={{ width: Math.max(1, 2 * size), height: 34 * size, background: 'rgba(20,18,16,0.7)', margin: '0 auto' }} />
            <div style={{
              width: 5 * size, height: 5 * size, borderRadius: '50%', marginTop: -4 * size,
              background: 'rgba(230,175,95,0.85)',
              boxShadow: `0 0 ${14 * size}px ${5 * size}px rgba(212,150,70,${0.35 * size})`,
            }} />
          </div>
        ))
      })}

      {/* Drifting mist along the platform edge */}
      <div style={{
        position: 'absolute', bottom: '26%', left: '-15%', width: '130%', height: '10%',
        background: `linear-gradient(0deg, rgba(150,170,200,${0.05 + (1-w)*0.04}) 0%, transparent 100%)`,
        animation: !reducedMotion ? `arrival-mist-drift 22s ease-in-out infinite ${playState}` : 'none',
      }} aria-hidden="true" />

      {/* Platform lamps, framing either side of the scene */}
      <div style={{ position: 'absolute', top: 0, left: '14%' }} aria-hidden="true">
        <AmbientLight size="large" flickerOffset={0.5} />
      </div>
      <div style={{ position: 'absolute', top: 0, right: '14%' }} aria-hidden="true">
        <AmbientLight size="large" flickerOffset={1.7} />
      </div>

      {/* A small bird, perched and waiting same as everyone else */}
      <div style={{ position: 'absolute', top: '9%', right: '15.5%', opacity: 0.5 + b * 0.25 }} aria-hidden="true">
        <svg width="14" height="10" viewBox="0 0 14 10">
          <ellipse cx="7" cy="6" rx="5.5" ry="3.5" fill="rgba(20,18,16,0.85)" />
          <circle cx="12" cy="4" r="2.4" fill="rgba(20,18,16,0.85)" />
          <polygon points="14,4 16,3.3 14.2,5" fill="rgba(20,18,16,0.85)" />
        </svg>
      </div>

      {/* Platform sign — continuity with Platform Eleven */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono,"Special Elite",monospace)',
        fontSize: 14, letterSpacing: '3px',
        color: `rgba(210,155,72,${0.3+b*0.3})`,
        textTransform: 'uppercase', textAlign: 'center',
      }} aria-hidden="true">
        Platform 11:59
      </div>

      {/* A waiting bench off to the side — pure atmosphere */}
      <WorldObject
        label="A bench, waiting for the train same as you"
        hint="Not long now"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute', bottom: '27%', left: '10%',
          opacity: 0.55 + b * 0.2,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={groundShadow(90, 0.35)} />
          <div style={{
            width: 96, height: 13,
            background: faceGradient(46+Math.round(w*10), 34+Math.round(w*7), 20+Math.round(w*4), 0.9, 10),
            borderRadius: 2,
            borderTop: `1px solid rgba(210,155,72,${0.14 + b * 0.1})`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 5, height: 18, borderRadius: '0 0 2px 2px',
                background: 'linear-gradient(180deg, rgba(46,34,20,0.9), rgba(26,18,10,0.9))',
              }} />
            ))}
          </div>
          {/* A small carving, worn into the wood by someone who waited here before */}
          <div style={{
            position: 'absolute', top: -1, left: 10,
            fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
            fontStyle: 'italic', fontSize: 7,
            color: 'rgba(20,15,10,0.4)',
            transform: 'rotate(-3deg)',
          }}>
            R ♡ E
          </div>
        </div>
      </WorldObject>

      <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <path d="M980 520L-180 730 M980 524L1510 730" stroke="#7d8585" strokeOpacity="0.4" strokeWidth="2" fill="none" />
        <path d="M980 520L-180 730 M980 524L1510 730" stroke="#edc58c" strokeOpacity={whistlePlayed ? 0.28 : 0.04} style={{ transition: 'stroke-opacity 8s ease' }} fill="none" />
      </svg>

      {/* The distant light — a pinprick that grows into a headlamp */}
      {!trainVisible && (
        <div style={{
          position: 'absolute', bottom: '42%', left: '68%',
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'rgba(255,225,180,1)',
          transform: 'translateX(-50%)',
          animation: !reducedMotion
            ? `distant-light-grow ${TIMING.TRAIN_ARRIVAL_VISIBLE - TIMING.TRAIN_ARRIVAL_LIGHT}ms ease-in ${TIMING.TRAIN_ARRIVAL_LIGHT}ms backwards ${playState}`
            : 'none',
          opacity: reducedMotion ? 1 : undefined,
        }} aria-hidden="true" />
      )}

      {trainVisible && (
        <ArrivalCarriage
          doorsOpen={doorsOpen}
          stopped={trainStopped}
          conductorReady={conductorReady}
          reducedMotion={reducedMotion}
          paused={paused}
          onBoard={handleBoard}
        />
      )}

      {doorsOpen && (
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
          fontStyle: 'italic', fontSize: 13,
          color: `rgba(242,232,213,${0.25+b*0.2})`,
          textAlign: 'center', whiteSpace: 'nowrap',
          animation: 'hint-fade-in 2s ease 1s both',
        }} aria-hidden="true">
          The train waits. It isn&rsquo;t going anywhere without you.
        </div>
      )}

      <style>{`
        @keyframes distant-light-grow {
          0% { width: 4px; height: 4px; opacity: 0; box-shadow: 0 0 6px 2px rgba(255,225,180,0); }
          100% { width: 16px; height: 16px; opacity: 1; box-shadow: 0 0 60px 22px rgba(255,220,160,0.7); }
        }
        @keyframes rail-glint-grow {
          0% { opacity: 0; }
          100% { opacity: 0.85; }
        }
        @keyframes train-vibration {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0.6px, 0.4px); }
        }
        @keyframes conductor-nod {
          0% { transform: rotate(0deg); }
          40% { transform: rotate(-6deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes conductor-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes hint-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes arrival-mist-drift {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(5%); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
