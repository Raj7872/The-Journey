'use client'

import { TimberBench, KeepsakeBox } from '@/components/scenery/DimensionalProps'

import { MeadowLandscape } from '@/components/scenery/MeadowLandscape'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { StationObject } from '@/components/station/StationObject'

/**
 * TheBench
 *
 * Closer now — the tree fills the frame, the bench sits beneath it, and a
 * small wrapped gift box rests on the seat. Nothing else here competes for
 * attention; the box is the only thing to interact with.
 */
export function TheBench() {
  const { transitionTo } = useScene()

  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="A bench beneath a tree, a gift box resting on it"
    >
      <MeadowLandscape view="bench" />

      {/* Left-aligned to sit under the tree's trunk/canopy in this close
          view (translate(270 663) in MeadowLandscape) rather than the wide
          view's tree position — centering here instead would land the
          bench on the path that cuts through the middle of the frame. */}
      <div style={{ position: 'absolute', bottom: '18%', left: '30%', transform: 'translateX(-50%)' }} aria-hidden="true">
        <TimberBench width={390} />
      </div>

      {/* The gift box, resting on the bench seat */}
      <StationObject
        label="A small gift box, resting on the bench"
        hint="Open it"
        onClick={() => transitionTo('the-gift')}
        style={{ position: 'absolute', bottom: 'calc(18% + 62px)', left: '32%', transform: 'translateX(-50%)', width: 88, height: 65 }}
      >
        <KeepsakeBox width={88} />
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
