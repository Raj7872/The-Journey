'use client'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { StationObject } from '@/components/station/StationObject'
import { groundShadow, faceGradient, paperFiber, specularHighlight } from '@/lib/utils/shading'
import { PROPOSAL_CONFIG } from '@/content/proposal/proposal'

/**
 * TheGift
 *
 * Close on the open box, lid set aside, a folded ticket resting inside —
 * `PROPOSAL_CONFIG.giftTicket`, real content, not placeholder. Only the
 * ticket itself is interactive; clicking it carries it into the silence
 * where it unfolds into the letter.
 */
export function TheGift() {
  const { timeline } = useTimeline()
  const { transitionTo } = useScene()
  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth
  const ticket = PROPOSAL_CONFIG.giftTicket

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="An open gift box, a folded ticket resting inside"
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(220+w*20)},${Math.round(190+w*24)},${Math.round(155+w*22)},1) 0%,
          rgba(${Math.round(248+w*6)},${Math.round(220+w*12)},${Math.round(180+w*12)},1) 55%,
          rgba(${Math.round(252+w*3)},${Math.round(232+w*8)},${Math.round(198+w*8)},1) 100%)`,
        transition: 'background 2.5s ease',
      }} aria-hidden="true" />

      {/* Soft bench-wood surface beneath, just enough to ground the box */}
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '20%',
        background: `${faceGradient(64+Math.round(w*10), 46+Math.round(w*8), 28+Math.round(w*4), 0.5, 10)}`,
        borderRadius: '6px 6px 0 0',
      }} aria-hidden="true" />

      {/* The open box */}
      <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(150, 0.32)} />
          {/* Lid, set aside */}
          <div style={{
            position: 'absolute', bottom: 4, left: -74, width: 62, height: 14, transform: 'rotate(-8deg)',
            background: `${specularHighlight('35%', '25%', '70%', 0.25)}, ${faceGradient(148+Math.round(w*18), 58+Math.round(w*10), 44+Math.round(w*6), 0.92, 10)}`,
            borderRadius: 2,
          }} />
          {/* Box body */}
          <div style={{
            width: 150, height: 70,
            background: `${specularHighlight('30%', '15%', '65%', 0.22)}, ${faceGradient(140+Math.round(w*18), 54+Math.round(w*10), 40+Math.round(w*6), 0.95, 12)}`,
            borderRadius: '2px 2px 6px 6px',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Interior shadow, deep inside the box */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)' }} />
          </div>
        </div>
      </div>

      {/* The folded ticket, resting inside — the only interactive thing here */}
      <StationObject
        label={`A folded ticket — from ${ticket.from}, to ${ticket.to}`}
        hint="Unfold it"
        onClick={() => transitionTo('the-silence')}
        style={{ position: 'absolute', bottom: '25%', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: 74, height: 46 }}
      >
        <div style={{
          width: 70, height: 42,
          background: `${paperFiber(0.03)}, rgba(${238+Math.round(w*10)},${228+Math.round(w*8)},${205+Math.round(w*6)},0.96)`,
          border: `1px solid rgba(184,146,42,${0.25 + b * 0.15})`,
          borderRadius: 2,
          position: 'relative',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono,"Special Elite",monospace)', fontSize: 7, letterSpacing: '1px',
            color: 'rgba(80,60,30,0.65)', textTransform: 'uppercase',
          }}>
            {ticket.from} → {ticket.to}
          </div>
          <div style={{ width: '70%', height: 1, background: 'rgba(80,60,30,0.2)' }} />
          <div style={{
            fontFamily: 'var(--font-mono,"Special Elite",monospace)', fontSize: 6, letterSpacing: '0.5px',
            color: 'rgba(80,60,30,0.5)',
          }}>
            {ticket.passenger} + {ticket.companion}
          </div>
          {/* Perforated edge, like a real ticket stub */}
          <div style={{ position: 'absolute', right: -1, top: 0, bottom: 0, width: 1, borderLeft: '1px dashed rgba(80,60,30,0.35)' }} />
        </div>
      </StationObject>

      {/* Ambient caption */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-body,"Crimson Text",Georgia,serif)',
        fontStyle: 'italic', fontSize: 13,
        color: 'rgba(60,45,30,0.55)',
        textAlign: 'center', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }} aria-hidden="true">
        {ticket.noteOnBack}
      </div>
    </div>
  )
}
