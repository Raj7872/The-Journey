'use client'

import { useEffect, useRef, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { useDebug } from '@/engine/DebugManager/DebugContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { AmbientLight } from '@/components/station/AmbientLight'
import { WorldObject } from '@/components/world/WorldObject'
import { StationObject } from '@/components/station/StationObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { SteamWisp } from '@/components/common/SteamWisp'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
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
  const [trainAlongside, setTrainAlongside] = useState(false)
  const [trainStopped, setTrainStopped] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [conductorReady, setConductorReady] = useState(false)
  const hasBoarded = useRef(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => { playSfx('train-whistle'); setWhistlePlayed(true) }, TIMING.TRAIN_ARRIVAL_WHISTLE),
      // A front-on locomotive grows first (continuing the head-on approach
      // the light/rails already set up)...
      setTimeout(() => setTrainVisible(true), TIMING.TRAIN_ARRIVAL_VISIBLE),
      // ...then it swings/crossfades into the side view now sitting
      // alongside the platform, rather than the side view just popping in.
      setTimeout(() => setTrainAlongside(true), TIMING.TRAIN_ARRIVAL_SWING),
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

      {/* Rails converging toward the vanishing point — glint grows as the light approaches */}
      <div style={{ position: 'absolute', bottom: '28%', left: '50%', transform: 'translateX(-50%)', width: '90%', height: '22%', overflow: 'hidden' }} aria-hidden="true">
        {[-1, 1].map((side) => (
          <div key={side} style={{
            position: 'absolute', bottom: 0, left: '50%',
            width: 2, height: '100%',
            transformOrigin: 'bottom center',
            transform: `translateX(${side * 1}px) rotate(${side * 3.5}deg)`,
            background: 'linear-gradient(0deg, rgba(90,90,100,0.5) 0%, rgba(60,60,70,0.25) 100%)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(0deg, rgba(230,190,130,0.9) 0%, transparent 60%)',
              animation: !reducedMotion
                ? `rail-glint-grow ${TIMING.TRAIN_ARRIVAL_VISIBLE - TIMING.TRAIN_ARRIVAL_RAILS}ms ease-in ${TIMING.TRAIN_ARRIVAL_RAILS}ms backwards ${playState}`
                : 'none',
              opacity: reducedMotion ? 0.6 : undefined,
            }} />
          </div>
        ))}
      </div>

      {/* The distant light — a pinprick that grows into a headlamp */}
      {!trainVisible && (
        <div style={{
          position: 'absolute', bottom: '30%', left: '50%',
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

      {/* The train coming straight at the platform — a face-on locomotive
          that grows in place, picking up right where the distant light left
          off. It fades out as the side view crossfades in below, so the
          train reads as swinging around to pull up alongside you rather
          than teleporting from a head-on light into a side profile. */}
      {trainVisible && (
        <div style={{
          position: 'absolute', bottom: '28%', left: '50%',
          transform: 'translateX(-50%)',
          opacity: trainAlongside ? 0 : 1,
          transition: 'opacity 0.9s ease',
          animation: !reducedMotion
            ? `train-front-grow ${TIMING.TRAIN_ARRIVAL_SWING - TIMING.TRAIN_ARRIVAL_VISIBLE}ms ease-out ${playState}`
            : 'none',
        }} aria-hidden="true">
          <div style={{ position: 'relative', width: 110, height: 96 }}>
            {/* Smokestack + steam, rising above the face */}
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              width: 7, height: 16,
              background: `rgba(${16+Math.round(w*4)},${13+Math.round(w*3)},${10+Math.round(w*2)},0.95)`,
            }} />
            <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)' }}>
              <SteamWisp width={14} height={22} opacity={0.3} />
            </div>
            {/* Locomotive face */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 90, height: 80,
              background: `linear-gradient(180deg, rgba(${28+Math.round(w*8)},${22+Math.round(w*5)},${16+Math.round(w*3)},0.98) 0%, rgba(14,11,8,0.98) 100%)`,
              borderRadius: '20px 20px 6px 6px',
              border: `1px solid rgba(210,155,72,${0.25 + b * 0.2})`,
            }} />
            {/* Two cab windows flanking the headlamp */}
            <div style={{ position: 'absolute', bottom: 50, left: 12, width: 16, height: 16, background: `rgba(230,175,95,${0.5 + b * 0.3})`, boxShadow: `0 0 10px 2px rgba(212,150,70,${0.3 + b * 0.2})` }} />
            <div style={{ position: 'absolute', bottom: 50, right: 12, width: 16, height: 16, background: `rgba(230,175,95,${0.5 + b * 0.3})`, boxShadow: `0 0 10px 2px rgba(212,150,70,${0.3 + b * 0.2})` }} />
            {/* Big centered headlamp */}
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(255,235,190,0.95)',
              boxShadow: '0 0 55px 20px rgba(255,220,160,0.6)',
            }} />
          </div>
        </div>
      )}

      {/* The side view — swings in alongside the platform, slows the rest
          of the way, stops, steams, opens its door. */}
      {trainAlongside && (
        <div style={{
          position: 'absolute', bottom: '26%', left: '50%',
          transform: 'translateX(-50%)',
          animation: !reducedMotion
            ? `train-alongside-appear ${Math.max(TIMING.TRAIN_ARRIVAL_STOP - TIMING.TRAIN_ARRIVAL_SWING, 1)}ms cubic-bezier(0.25,0.7,0.3,1) forwards ${playState}`
            : 'none',
        }} aria-hidden="true">
          <div style={{ position: 'relative', width: 420, height: 130 }}>
            {/* Locomotive body */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, width: 420, height: 90,
              background: `linear-gradient(180deg, rgba(${28+Math.round(w*8)},${22+Math.round(w*5)},${16+Math.round(w*3)},0.98) 0%, rgba(14,11,8,0.98) 100%)`,
              borderTop: `1px solid rgba(210,155,72,${0.25 + b * 0.2})`,
              borderRadius: '4px 18px 0 0',
            }} />
            {/* Lit carriage windows — warm, welcoming */}
            <div style={{ position: 'absolute', bottom: 30, left: 24, display: 'flex', gap: 14 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  width: 34, height: 40,
                  background: `rgba(230,175,95,${0.5 + b * 0.3})`,
                  boxShadow: `0 0 18px 4px rgba(212,150,70,${0.3 + b * 0.2})`,
                  border: `1px solid rgba(20,15,10,0.6)`,
                }} />
              ))}
            </div>
            {/* Brass nameplate */}
            <div style={{
              position: 'absolute', top: 8, left: 24,
              padding: '2px 6px',
              background: 'linear-gradient(180deg, rgba(215,175,85,0.85), rgba(145,112,42,0.85))',
              border: '1px solid rgba(90,68,24,0.5)',
              borderRadius: 1,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono,"Special Elite",monospace)',
                fontSize: 7, letterSpacing: '1.5px',
                color: 'rgba(30,22,10,0.85)',
              }}>
                WORTH THE WAIT
              </span>
            </div>
            {/* Front headlamp */}
            <div style={{
              position: 'absolute', bottom: 40, right: -6,
              width: 16, height: 16, borderRadius: '50%',
              background: 'rgba(255,235,190,0.95)',
              boxShadow: '0 0 40px 14px rgba(255,220,160,0.55)',
            }} />
            {/* Door — closed until TRAIN_ARRIVAL_DOOR, then swings open */}
            <div style={{
              position: 'absolute', bottom: 0, left: 200,
              width: 30, height: 70,
              background: `rgba(${18+Math.round(w*4)},${14+Math.round(w*3)},${10+Math.round(w*2)},0.95)`,
              borderTop: `1px solid rgba(210,155,72,${0.3 + b * 0.2})`,
              transformOrigin: 'left center',
              transform: doorsOpen ? 'rotateY(75deg)' : 'rotateY(0deg)',
              transition: 'transform 1.4s ease-out',
            }}>
              {doorsOpen && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `rgba(230,175,95,${0.4 + b * 0.3})`,
                }} />
              )}
            </div>
            {/* Warm light spilling from the open doorway onto the platform */}
            {doorsOpen && (
              <div style={{
                position: 'absolute', bottom: -6, left: 190, width: 60, height: 40,
                background: `radial-gradient(ellipse, rgba(230,175,95,${0.25 + b * 0.15}) 0%, transparent 75%)`,
                filter: 'blur(3px)',
              }} />
            )}
            {/* A small handwritten placard, hung near the top of the door — kept
                well clear of the conductor standing at the base of it */}
            {doorsOpen && (
              <div style={{
                position: 'absolute', bottom: 58, left: 196,
                transform: 'rotate(-3deg)',
                background: 'rgba(242,232,213,0.88)',
                padding: '3px 6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                animation: 'hint-fade-in 1.5s ease 0.5s both',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
                  fontStyle: 'italic', fontSize: 8,
                  color: 'rgba(45,31,14,0.85)',
                  whiteSpace: 'nowrap',
                }}>
                  Take your time.
                </span>
              </div>
            )}
            {/* Steam — a burst as it stops, settling into gentle continuous wisps */}
            {trainStopped && (
              <div style={{ position: 'absolute', bottom: -4, left: 60, display: 'flex', gap: 10 }}>
                <SteamWisp width={26} height={44} opacity={0.5} />
                <SteamWisp width={20} height={36} opacity={0.4} />
                <SteamWisp width={30} height={50} opacity={0.45} />
              </div>
            )}
            {/* Conductor — a small silhouette by the door, a lantern raised once, then a slow idle sway */}
            {conductorReady && (
              <div style={{
                position: 'absolute', bottom: 0, left: 240,
                animation: !reducedMotion ? 'conductor-nod 1.6s ease-out, conductor-idle 4.5s ease-in-out 1.6s infinite' : 'none',
                transformOrigin: 'bottom center',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(20,16,12,0.9)', margin: '0 auto' }} />
                <div style={{ width: 12, height: 22, background: 'rgba(20,16,12,0.9)', borderRadius: '2px 2px 0 0' }} />
                <div style={{
                  position: 'absolute', top: 14, right: -6,
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'rgba(230,175,95,0.9)',
                  boxShadow: '0 0 10px 4px rgba(230,175,95,0.5)',
                }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Board — only interactive once the door has actually opened. Never forced. */}
      {doorsOpen && (
        <StationObject
          label="Board the train"
          hint="Board"
          onClick={handleBoard}
          style={{
            position: 'absolute', bottom: '30%', left: '58%',
            width: 40, height: 60,
          }}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </StationObject>
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
        @keyframes train-front-grow {
          0% { transform: translateX(-50%) scale(0.35); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes train-alongside-appear {
          0% { opacity: 0; transform: translateX(-50%) scale(0.9); }
          30% { opacity: 1; transform: translateX(-50%) scale(1.01); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
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
