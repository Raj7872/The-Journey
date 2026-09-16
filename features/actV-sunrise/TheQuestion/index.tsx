'use client'

import { MeadowLandscape } from '@/components/scenery/MeadowLandscape'

import { useEffect, useRef, useState } from 'react'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { HandwrittenText } from '@/components/common/HandwrittenText'
import { TIMING } from '@/lib/constants/timing'
import { PROPOSAL_CONFIG } from '@/content/proposal/proposal'

type Phase = 'writing' | 'revealed'

/**
 * TheQuestion
 *
 * The quietest scene in the app. The question writes itself in the same
 * hand as the letter, then — after it and the subtext have had a moment
 * to land — one button. No spectacle; the emotion is entirely in the
 * restraint. Pressing it waits a full `TIMING.YES_PAUSE` in silence before
 * anything visibly changes.
 *
 * The station clock freezes the moment this question appears, and only
 * moves again — snapping straight to 12:00 — once she says yes.
 */
export function TheQuestion() {
  const { freezeClock, advanceToMidnight } = useTimeline()
  const { transitionTo } = useScene()
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('writing')
  const [pressed, setPressed] = useState(false)
  const hasAnswered = useRef(false)

  useEffect(() => {
    freezeClock()
  }, [freezeClock])

  function handleYes() {
    if (hasAnswered.current) return
    hasAnswered.current = true
    setPressed(true)
    advanceToMidnight()
    setTimeout(() => transitionTo('world-changes'), TIMING.YES_PAUSE)
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="The question"
    >
      <MeadowLandscape view="letter" />

      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: reducedMotion ? 'translate(-50%,-50%)' : undefined,
        animation: !reducedMotion ? 'question-zoom-in 7s ease-out both' : 'none',
        textAlign: 'center', width: 'min(480px, 84%)',
        opacity: pressed ? 0.35 : 1, transition: 'opacity 1.5s ease',
      }}>
        <div style={{
          fontFamily: 'var(--font-display,"IM Fell English",Georgia,serif)',
          fontSize: 'clamp(24px, 4vw, 34px)',
          color: 'rgba(60,42,22,0.88)',
        }}>
          <HandwrittenText
            text={PROPOSAL_CONFIG.question}
            onComplete={() => setPhase('revealed')}
            color="rgba(60,42,22,0.88)"
          />
        </div>

        {phase === 'revealed' && (
          <>
            <div style={{
              marginTop: 22,
              fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
              fontStyle: 'italic', fontSize: 15, lineHeight: 1.8,
              color: 'rgba(70,52,30,0.65)',
              whiteSpace: 'pre-line',
              animation: 'question-fade-in 2s ease both',
            }}>
              {PROPOSAL_CONFIG.subtext}
            </div>

            {!pressed && (
              <button
                onClick={handleYes}
                style={{
                  all: 'unset',
                  marginTop: 46,
                  padding: '12px 34px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
                  fontSize: 16,
                  color: 'rgba(60,42,22,0.92)',
                  border: '1px solid rgba(184,146,42,0.5)',
                  borderRadius: 3,
                  background: 'rgba(255,250,240,0.4)',
                  animation: 'question-fade-in 2s ease 2s both',
                }}
              >
                {PROPOSAL_CONFIG.yesLabel}
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes question-zoom-in {
          from { transform: translate(-50%,-50%) scale(0.93); }
          to { transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes question-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
