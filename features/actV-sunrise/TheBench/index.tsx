'use client'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { StationObject } from '@/components/station/StationObject'
import { groundShadow, faceGradient, woodGrain, specularHighlight } from '@/lib/utils/shading'

/**
 * TheBench
 *
 * Closer now — the tree fills the frame, the bench sits beneath it, and a
 * small wrapped gift box rests on the seat. Nothing else here competes for
 * attention; the box is the only thing to interact with.
 */
export function TheBench() {
  const { timeline } = useTimeline()
  const { transitionTo } = useScene()
  const b = timeline.lightingProfile.brightness
  const w = timeline.lightingProfile.warmth

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="A bench beneath a tree, a gift box resting on it"
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${Math.round(150+w*35)},${Math.round(168+w*28)},${Math.round(195+w*18)},1) 0%,
          rgba(${Math.round(224+w*18)},${Math.round(186+w*26)},${Math.round(148+w*26)},1) 50%,
          rgba(${Math.round(250+w*5)},${Math.round(216+w*14)},${Math.round(165+w*16)},1) 80%,
          rgba(${Math.round(252+w*4)},${Math.round(226+w*10)},${Math.round(182+w*10)},1) 100%)`,
        transition: 'background 3s ease',
      }} aria-hidden="true" />

      {/* Sun, further round and lower now — we've walked closer to the light */}
      <div style={{
        position: 'absolute', bottom: '30%', left: '18%',
        width: 90, height: 90, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,238,205,0.95) 0%, rgba(255,212,152,0.45) 45%, transparent 75%)`,
        boxShadow: `0 0 110px 50px rgba(255,215,160,${0.3 + b * 0.15})`,
      }} aria-hidden="true" />

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: `linear-gradient(180deg,
          rgba(${102+Math.round(w*18)},${132+Math.round(w*14)},${72+Math.round(w*8)},1) 0%,
          rgba(${72+Math.round(w*12)},${98+Math.round(w*10)},${52+Math.round(w*6)},1) 100%)`,
      }} aria-hidden="true" />

      {/* The tree — close, filling the upper frame, leaves catching the low sun */}
      <div style={{ position: 'absolute', top: '-6%', left: '50%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <div style={{
          width: 16, height: '46%', margin: '0 auto',
          background: `${woodGrain(4, 0.05)}, ${faceGradient(60+Math.round(w*10), 42+Math.round(w*7), 26+Math.round(w*4), 0.95, 12)}`,
        }} />
        <div style={{
          position: 'absolute', top: '4%', left: '50%', transform: 'translateX(-50%)',
          width: 260, height: 190, borderRadius: '50%',
          background: `radial-gradient(ellipse at 42% 35%, rgba(${140+Math.round(w*20)},${160+Math.round(w*16)},${90+Math.round(w*10)},0.95) 0%, rgba(${88+Math.round(w*14)},${112+Math.round(w*12)},${58+Math.round(w*6)},0.96) 65%, rgba(${64+Math.round(w*10)},${86+Math.round(w*8)},${42+Math.round(w*5)},0.97) 100%)`,
        }} />
      </div>

      {/* The bench, beneath the tree */}
      <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(200, 0.35)} />
          {/* Backrest */}
          <div style={{
            position: 'absolute', bottom: 26, left: 0, width: 200, height: 34,
            background: `${woodGrain(90, 0.05)}, ${faceGradient(58+Math.round(w*10), 42+Math.round(w*7), 26+Math.round(w*4), 0.95, 10)}`,
            borderRadius: 3,
          }} />
          {/* Seat */}
          <div style={{
            width: 200, height: 16,
            background: `${woodGrain(4, 0.05)}, ${faceGradient(64+Math.round(w*10), 46+Math.round(w*8), 28+Math.round(w*4), 0.96, 10)}`,
            borderRadius: 3,
          }} />
          {/* Legs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 14px' }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: 8, height: 22, background: `rgba(${40+Math.round(w*8)},${28+Math.round(w*5)},${16+Math.round(w*3)},0.9)` }} />
            ))}
          </div>
        </div>
      </div>

      {/* The gift box, resting on the bench seat */}
      <StationObject
        label="A small gift box, resting on the bench"
        hint="Open it"
        onClick={() => transitionTo('the-gift')}
        style={{ position: 'absolute', bottom: '25%', left: '50%', transform: 'translateX(-50%)', width: 46, height: 40 }}
      >
        <div style={{ position: 'relative', width: 40, height: 34 }}>
          <div style={groundShadow(40, 0.3)} />
          <div style={{
            width: 40, height: 28,
            background: `${specularHighlight('35%', '20%', '70%', 0.3)}, ${faceGradient(150+Math.round(w*20), 60+Math.round(w*10), 45+Math.round(w*6), 0.95, 14)}`,
            borderRadius: 2,
          }} />
          {/* Ribbon */}
          <div style={{ position: 'absolute', top: 0, left: 17, width: 6, height: 28, background: `rgba(${228+Math.round(w*15)},${198+Math.round(w*12)},${140+Math.round(w*8)},0.95)` }} />
          <div style={{ position: 'absolute', top: 10, left: 0, width: 40, height: 6, background: `rgba(${228+Math.round(w*15)},${198+Math.round(w*12)},${140+Math.round(w*8)},0.95)` }} />
          <div style={{
            position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
            width: 14, height: 8, borderRadius: '50% 50% 0 0',
            borderTop: `2px solid rgba(${228+Math.round(w*15)},${198+Math.round(w*12)},${140+Math.round(w*8)},0.9)`,
            borderLeft: `2px solid rgba(${228+Math.round(w*15)},${198+Math.round(w*12)},${140+Math.round(w*8)},0.9)`,
            borderRight: `2px solid rgba(${228+Math.round(w*15)},${198+Math.round(w*12)},${140+Math.round(w*8)},0.9)`,
          }} />
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
        Someone left something here.
      </div>
    </div>
  )
}
