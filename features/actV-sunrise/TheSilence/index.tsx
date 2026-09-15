'use client'

import { useEffect, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { HandwrittenText } from '@/components/common/HandwrittenText'
import { TIMING } from '@/lib/constants/timing'
import { groundShadow, faceGradient, paperFiber } from '@/lib/utils/shading'
import { PROPOSAL_CONFIG } from '@/content/proposal/proposal'

type Phase = 'writing' | 'silence' | 'continuing' | 'ready' | 'done'

/**
 * TheSilence
 *
 * The ticket unfolds into the letter. Once the first half finishes writing
 * itself, nothing happens for a protected silence
 * (`TIMING.PROPOSAL_SILENCE_MIN`) — no button, no hint, no fade, nothing
 * rendered that wasn't already there. Only after that does the letter
 * continue. This is the one place in the whole app where a duration is not
 * skippable by any interaction; the silence is the point.
 *
 * Once the second half finishes, the scene doesn't carry straight into the
 * question — it waits, then asks first.
 */
export function TheSilence() {
  const { timeline } = useTimeline()
  const { transitionTo } = useScene()
  const reducedMotion = useReducedMotion()
  const w = timeline.lightingProfile.warmth
  const [phase, setPhase] = useState<Phase>('writing')

  useEffect(() => {
    if (phase !== 'silence') return
    const t = setTimeout(() => setPhase('continuing'), TIMING.PROPOSAL_SILENCE_MIN)
    return () => clearTimeout(t)
  }, [phase])

  const firstHalf = PROPOSAL_CONFIG.finalLetterLines.join('<br>')
  const secondHalf = PROPOSAL_CONFIG.finalLetterPause.join('<br>')

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="A letter, unfolded"
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(232+w*16)},${Math.round(202+w*22)},${Math.round(168+w*20)},1) 0%,
          rgba(${Math.round(250+w*4)},${Math.round(228+w*10)},${Math.round(192+w*10)},1) 60%,
          rgba(${Math.round(253+w*2)},${Math.round(236+w*6)},${Math.round(204+w*6)},1) 100%)`,
        transition: 'background 2s ease',
      }} aria-hidden="true" />

      {/* The same low, soft sun that's been with us since the-field —
          quiet continuity, not a new light source */}
      <div style={{
        position: 'absolute', bottom: '40%', left: '14%',
        width: 100, height: 100, borderRadius: '50%', transform: 'translateX(-50%)',
        background: `radial-gradient(circle, rgba(255,238,205,0.85) 0%, rgba(255,212,152,0.4) 45%, transparent 75%)`,
        boxShadow: '0 0 120px 50px rgba(255,215,160,0.2)',
      }} aria-hidden="true" />

      {/* Ground — so the horizon reads as a place, not a color fill */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '18%',
        background: `linear-gradient(180deg,
          rgba(${Math.round(150+w*20)},${Math.round(140+w*18)},${Math.round(95+w*12)},1) 0%,
          rgba(${Math.round(120+w*16)},${Math.round(110+w*14)},${Math.round(72+w*8)},1) 100%)`,
      }} aria-hidden="true" />

      {/* An echo of everywhere we've just walked — the tree, the bench, the
          train resting at the edge — kept low on the horizon, well clear of
          the letter. Not a replay, just a trace. */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }} aria-hidden="true">
        {[4, 10, 90, 96].map((x, i) => (
          <div key={x} style={{
            position: 'absolute', bottom: '15%', left: `${x}%`,
            width: 12 + (i % 2) * 4, height: 18 + (i % 2) * 8,
            borderRadius: '50% 50% 10% 10%',
            background: 'rgba(70,55,34,0.75)',
          }} />
        ))}
        <div style={{ position: 'absolute', bottom: '16%', left: '78%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 3, height: 28, margin: '0 auto', background: 'rgba(70,55,34,0.92)' }} />
          <div style={{
            position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)',
            width: 52, height: 42, borderRadius: '50%', background: 'rgba(70,55,34,0.88)',
          }} />
          <div style={{
            position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)',
            width: 34, height: 5, borderRadius: 2, background: 'rgba(70,55,34,0.92)',
          }} />
        </div>
        <div style={{ position: 'absolute', bottom: '12%', left: '4%' }}>
          <div style={{ width: 100, height: 30, borderRadius: '4px 14px 3px 3px', background: 'rgba(70,55,34,0.85)' }} />
        </div>
      </div>

      {/* Sunlight quietly strengthening the longer the letter takes — a
          one-shot glow, never looping, tied to nothing but time spent here */}
      {!reducedMotion && (
        <div style={{
          position: 'absolute', top: '-12%', right: '-8%', width: '58%', height: '58%',
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,214,150,0.5) 0%, rgba(255,214,150,0) 70%)',
          filter: 'blur(8px)',
          animation: 'silence-sun-grow 100s ease-out forwards',
        }} aria-hidden="true" />
      )}

      {/* The letter — paper, resting in view, unhurried */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(420px, 82%)',
      }} aria-hidden="true">
        <div style={{
          position: 'relative',
          animation: !reducedMotion ? 'silence-paper-breeze 8s ease-in-out infinite' : 'none',
        }}>
          <div style={groundShadow(320, 0.22)} />
          <div style={{
            width: '100%', minHeight: 260, padding: '36px 32px',
            background: `${paperFiber(0.03)}, ${faceGradient(238+Math.round(w*8), 226+Math.round(w*6), 200+Math.round(w*4), 0.97, 6)}`,
            borderRadius: 2,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            transform: 'rotate(-0.6deg)',
            animation: !reducedMotion ? 'silence-shadow-lengthen 100s ease-out forwards' : 'none',
          }}>
            <HandwrittenText
              text={firstHalf}
              onComplete={() => setPhase((p) => (p === 'writing' ? 'silence' : p))}
              style={{ fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontSize: 16, lineHeight: 1.9 }}
            />
            {(phase === 'continuing' || phase === 'ready' || phase === 'done') && (
              <div style={{ marginTop: 18 }}>
                <HandwrittenText
                  text={secondHalf}
                  onComplete={() => setPhase((p) => (p === 'continuing' ? 'ready' : p))}
                  style={{ fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontSize: 16, lineHeight: 1.9 }}
                />
              </div>
            )}
            {(phase === 'ready' || phase === 'done') && (
              <div style={{
                marginTop: 26, textAlign: 'center',
                animation: 'silence-ready-fade 1.6s ease both',
                animationDelay: `${TIMING.READY_PROMPT_DELAY}ms`,
              }}>
                <button
                  onClick={() => {
                    setPhase('done')
                    transitionTo('the-question')
                  }}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    padding: '10px 28px',
                    fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
                    fontStyle: 'italic', fontSize: 15,
                    color: 'rgba(60,42,22,0.85)',
                    border: '1px solid rgba(184,146,42,0.45)',
                    borderRadius: 3,
                    background: 'rgba(255,250,240,0.35)',
                  }}
                >
                  Are you ready?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes silence-ready-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes silence-paper-breeze {
          0%, 100% { transform: rotate(0deg) translate(0, 0); }
          25% { transform: rotate(0.5deg) translate(2px, -1px); }
          50% { transform: rotate(-0.3deg) translate(-1px, 1px); }
          75% { transform: rotate(0.4deg) translate(1px, 0); }
        }
        @keyframes silence-shadow-lengthen {
          0% { box-shadow: 0 12px 40px rgba(0,0,0,0.18); }
          100% { box-shadow: 5px 20px 52px rgba(0,0,0,0.26); }
        }
        @keyframes silence-sun-grow {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
