'use client'

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
  const { timeline, freezeClock, advanceToMidnight } = useTimeline()
  const { transitionTo } = useScene()
  const reducedMotion = useReducedMotion()
  const w = timeline.lightingProfile.warmth
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
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(236+w*14)},${Math.round(208+w*20)},${Math.round(175+w*18)},1) 0%,
          rgba(${Math.round(251+w*3)},${Math.round(232+w*8)},${Math.round(200+w*8)},1) 60%,
          rgba(${Math.round(254+w*1)},${Math.round(240+w*4)},${Math.round(212+w*4)},1) 100%)`,
        transition: 'background 1.5s ease',
      }} aria-hidden="true" />

      {/* The same low, soft sun that's been with us since the-field —
          quiet continuity, not a new light source */}
      <div style={{
        position: 'absolute', bottom: '38%', left: '16%',
        width: 110, height: 110, borderRadius: '50%', transform: 'translateX(-50%)',
        background: `radial-gradient(circle, rgba(255,238,205,0.85) 0%, rgba(255,212,152,0.4) 45%, transparent 75%)`,
        boxShadow: '0 0 130px 55px rgba(255,215,160,0.2)',
      }} aria-hidden="true" />

      {/* Ground — so the horizon reads as a place, not a color fill */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
        background: `linear-gradient(180deg,
          rgba(${Math.round(150+w*20)},${Math.round(140+w*18)},${Math.round(95+w*12)},1) 0%,
          rgba(${Math.round(120+w*16)},${Math.round(110+w*14)},${Math.round(72+w*8)},1) 100%)`,
      }} aria-hidden="true" />

      {/* An echo of everywhere we've just walked — the tree, the bench, the
          train resting at the edge — kept low on the horizon, well clear of
          the text. Not a replay, just a trace, so this doesn't read as an
          empty void after such a populated journey. */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }} aria-hidden="true">
        {/* Distant tree line */}
        {[4, 10, 88, 94].map((x, i) => (
          <div key={x} style={{
            position: 'absolute', bottom: '17%', left: `${x}%`,
            width: 12 + (i % 2) * 4, height: 20 + (i % 2) * 8,
            borderRadius: '50% 50% 10% 10%',
            background: 'rgba(70,55,34,0.75)',
          }} />
        ))}
        {/* The tree and bench, low on the horizon, dead center */}
        <div style={{ position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 4, height: 34, margin: '0 auto', background: 'rgba(70,55,34,0.92)' }} />
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 62, height: 50, borderRadius: '50%', background: 'rgba(70,55,34,0.88)',
          }} />
          <div style={{
            position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
            width: 42, height: 6, borderRadius: 2, background: 'rgba(70,55,34,0.92)',
          }} />
        </div>
        {/* The train, still resting quiet at the frame's edge */}
        <div style={{ position: 'absolute', bottom: '14%', right: '2%' }}>
          <div style={{ width: 120, height: 36, borderRadius: '5px 16px 3px 3px', background: 'rgba(70,55,34,0.88)' }} />
        </div>
      </div>

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
