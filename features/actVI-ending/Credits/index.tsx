'use client'

import { MeadowLandscape } from '@/components/scenery/MeadowLandscape'

import { useEffect, useState } from 'react'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { HandwrittenText } from '@/components/common/HandwrittenText'
import { TIMING } from '@/lib/constants/timing'
import { groundShadow, faceGradient, paperFiber } from '@/lib/utils/shading'

type Phase = 'page1' | 'turning' | 'page2' | 'closing' | 'white'

const PAGE_ONE_TEXT = 'Every road eventually leads somewhere.'
const PAGE_TWO_TEXT = 'I\'m glad ours leads here.'
const FINAL_MESSAGE = 'For the one who turned ordinary days into something worth remembering. ❤️'

/**
 * Credits
 *
 * No scrolling credits. One page, a held pause, a single deliberate page
 * turn, one more page, another pause — then the notebook's own cover swings
 * shut over it, and the whole view holds on warm light, not white — one
 * last handwritten line once it's had a moment to settle. Nothing after this.
 */
export function Credits() {
  const { timeline } = useTimeline()
  const w = timeline.lightingProfile.warmth
  const [phase, setPhase] = useState<Phase>('page1')
  const [showFinalMessage, setShowFinalMessage] = useState(false)

  useEffect(() => {
    if (phase !== 'turning') return
    const t = setTimeout(() => setPhase('page2'), TIMING.CREDITS_PAGE_TURN)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'closing') return
    const t = setTimeout(() => setPhase('white'), 1600)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'white') return
    const t = setTimeout(() => setShowFinalMessage(true), TIMING.FINAL_FADE_HOLD * 0.6)
    return () => clearTimeout(t)
  }, [phase])

  function handlePageOneComplete() {
    setTimeout(() => setPhase('turning'), TIMING.CREDITS_PAGE_PAUSE)
  }

  function handlePageTwoComplete() {
    setTimeout(() => setPhase('closing'), TIMING.CREDITS_CLOSE_DELAY)
  }

  const isClosed = phase === 'closing' || phase === 'white'

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: 1200 }}
      role="region"
      aria-label="The notebook, closing on its final page"
    >
      <MeadowLandscape view="ending" />
      <div aria-hidden="true" style={{position:'absolute',bottom:0,left:'10%',right:'10%',height:'24%',background:'repeating-linear-gradient(0deg, transparent 0 48px, #302a2080 49px 51px), linear-gradient(120deg,#b39665,#675640)',transform:'perspective(700px) rotateX(35deg)',transformOrigin:'bottom center',boxShadow:'inset 0 3px 0 #d4bf92'}} />

      {/* The final pages */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 'min(380px, 78%)',
        opacity: phase === 'white' ? 0 : 1, transition: 'opacity 3s ease',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(300, 0.3)} />
          <div style={{
            position: 'relative',
            width: '100%', minHeight: 220, padding: '32px 28px',
            background: `${paperFiber(0.03)}, ${faceGradient(236+Math.round(w*8), 224+Math.round(w*6), 198+Math.round(w*4), 0.97, 6)}`,
            borderRadius: 2,
            boxShadow: '0 10px 34px rgba(0,0,0,0.35)',
          }}>
            {/* Page one — turns away to reveal page two beneath it */}
            <div style={{
              position: phase === 'page1' ? 'relative' : 'absolute', inset: phase === 'page1' ? undefined : 0,
              padding: phase === 'page1' ? undefined : '32px 28px',
              transformOrigin: 'left center',
              transform: phase === 'page1' ? 'rotateY(0deg)' : 'rotateY(-165deg)',
              opacity: phase === 'page1' || phase === 'turning' ? 1 : 0,
              transition: `transform ${TIMING.CREDITS_PAGE_TURN}ms cubic-bezier(0.4,0,0.2,1), opacity ${TIMING.CREDITS_PAGE_TURN}ms ease`,
              pointerEvents: 'none',
            }}>
              <HandwrittenText
                text={PAGE_ONE_TEXT}
                onComplete={handlePageOneComplete}
                style={{ fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontSize: 15, lineHeight: 1.9 }}
              />
            </div>

            {/* Page two — sits underneath, revealed once page one has turned */}
            {(phase === 'page2' || phase === 'closing' || phase === 'white') && (
              <div style={{ position: 'relative' }}>
                <HandwrittenText
                  text={PAGE_TWO_TEXT}
                  onComplete={handlePageTwoComplete}
                  style={{ fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontSize: 15, lineHeight: 1.9 }}
                />
              </div>
            )}
          </div>

          {/* The cover — hinged on the left edge, swinging shut over the page */}
          <div style={{
            position: 'absolute', inset: 0,
            transformOrigin: 'left center',
            transform: isClosed ? 'rotateY(0deg)' : 'rotateY(-100deg)',
            transition: 'transform 1.6s cubic-bezier(0.4,0,0.2,1)',
            background: `${faceGradient(46+Math.round(w*10), 32+Math.round(w*7), 20+Math.round(w*4), 0.98, 12)}`,
            borderRadius: 2,
            boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
          }} aria-hidden="true" />
        </div>
      </div>

      {/* Final hold — fades to a warm light, not white, and stays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 42%, rgba(255,246,224,.65), rgba(255,233,192,.15) 60%, transparent)',
        opacity: phase === 'white' ? 1 : 0,
        transition: `opacity ${TIMING.FINAL_FADE_HOLD}ms ease`,
        pointerEvents: phase === 'white' ? 'auto' : 'none',
      }} aria-hidden="true" />

      {/* One last line, once the warmth has had a moment to settle */}
      {showFinalMessage && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 'min(520px, 85%)', textAlign: 'center',
          padding: '35px 42px', background: 'radial-gradient(ellipse, #fff0d2cc, #fff0d200 75%)', textShadow: '0 1px 1px #fff8e4',
        }} aria-hidden="true">
          <HandwrittenText
            text={FINAL_MESSAGE}
            color="rgba(90,58,26,0.82)"
            style={{ fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.9 }}
          />
        </div>
      )}
    </div>
  )
}
