'use client'

import { MeadowLandscape } from '@/components/scenery/MeadowLandscape'

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
      <MeadowLandscape view="letter" />

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
