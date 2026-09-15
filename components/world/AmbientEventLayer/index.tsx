'use client'

import { useEffect } from 'react'

import { useAmbientEvent } from '@/engine/AmbientEventManager/AmbientEventContext'
import { useAudio } from '@/engine/AudioManager/AudioContext'
import { Z_INDEX } from '@/lib/constants/zIndex'

const CAT_COLOR = 'rgba(10,9,8,0.85)'

const LEAF_VARIANTS = [
  { color: 'rgba(184,146,42,0.55)', size: 8, shape: '0 60% 0 60%' },
  { color: 'rgba(212,132,58,0.5)', size: 6, shape: '60% 0 60% 0' },
  { color: 'rgba(150,90,40,0.55)', size: 10, shape: '0 60% 0 60%' },
  { color: 'rgba(196,160,60,0.45)', size: 7, shape: '60% 0 60% 0' },
]
const DEFAULT_LEAF_VARIANT = { color: 'rgba(184,146,42,0.55)', size: 8, shape: '0 60% 0 60%' }

/**
 * A single walking cat — a proper silhouette (legs, ears, a swishing tail)
 * rather than a legless blob. Parameterized so cat-walk can render a small
 * family of them at different sizes/delays instead of just one.
 */
function Cat({ bottom, scale, delay, duration, opacity }: {
  bottom: string
  scale: number
  delay: number
  duration: number
  opacity: number
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom,
        left: 0,
        zIndex: Z_INDEX.OBJECTS,
        animation: `ambient-cat-walk ${duration}s linear ${delay}s both, ambient-cat-bob 0.45s ease-in-out ${delay}s infinite`,
        pointerEvents: 'none',
        opacity,
      }}
    >
      <svg width={46 * scale} height={26 * scale} viewBox="-2 -3 48 29">
        <path
          d="M6,15 Q0,10 2,3 Q3,-1 6,0"
          stroke={CAT_COLOR}
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'bottom left',
            animation: `ambient-cat-tail-swish 0.9s ease-in-out ${delay}s infinite`,
          }}
        />
        <ellipse cx="20" cy="15" rx="13" ry="6" fill={CAT_COLOR} />
        <circle cx="35" cy="9.5" r="5.2" fill={CAT_COLOR} />
        <polygon points="31,6 32,1 34,5.5" fill={CAT_COLOR} />
        <polygon points="37,5 39,0.5 39.5,5" fill={CAT_COLOR} />
        <rect x="30" y="18" width="2.2" height="7" rx="1.1" fill={CAT_COLOR} transform="rotate(8 31 18)" />
        <rect x="25" y="18" width="2.2" height="7" rx="1.1" fill={CAT_COLOR} transform="rotate(-6 26 18)" />
        <rect x="12" y="18" width="2.2" height="7" rx="1.1" fill={CAT_COLOR} transform="rotate(10 13 18)" />
        <rect x="7" y="18" width="2.2" height="7" rx="1.1" fill={CAT_COLOR} transform="rotate(-10 8 18)" />
      </svg>
    </div>
  )
}

/**
 * AmbientEventLayer
 *
 * Renders the momentary visuals for ambient events that don't belong to any
 * one object — a cat crossing the floor, leaves drifting, pigeons outside.
 * lamp-sway and newspaper-flutter are handled locally by those objects
 * (AmbientLight, the newspaper prop) subscribing to the same event; train-horn
 * is audio-only. One instance is mounted globally — the manager already
 * scopes which event types can fire per scene, so no scene-awareness needed here.
 */
export function AmbientEventLayer() {
  const { currentEvent } = useAmbientEvent()
  const { playSfx } = useAudio()

  useEffect(() => {
    if (currentEvent?.type === 'train-horn') playSfx('train-whistle')
    if (currentEvent?.type === 'pigeons-fly') playSfx('birds-fly')
  }, [currentEvent, playSfx])

  if (!currentEvent) return null

  if (currentEvent.type === 'cat-walk') {
    return (
      <div aria-hidden="true">
        <Cat bottom="12%" scale={1} delay={0} duration={7} opacity={0.9} />
        <Cat bottom="10.5%" scale={0.62} delay={0.9} duration={6.2} opacity={0.75} />
        <Cat bottom="11%" scale={0.5} delay={1.7} duration={6.6} opacity={0.65} />
        <style>{`
          @keyframes ambient-cat-walk {
            from { transform: translateX(-8vw); }
            to { transform: translateX(108vw); }
          }
          @keyframes ambient-cat-bob {
            0%, 100% { margin-top: 0; }
            50% { margin-top: -1.5px; }
          }
          @keyframes ambient-cat-tail-swish {
            0%, 100% { transform: rotate(-8deg); }
            50% { transform: rotate(10deg); }
          }
        `}</style>
      </div>
    )
  }

  if (currentEvent.type === 'leaves-drift') {
    const leaves = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    return (
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.OBJECTS, pointerEvents: 'none' }}>
        {leaves.map((i) => {
          const variant = LEAF_VARIANTS[i % LEAF_VARIANTS.length] ?? DEFAULT_LEAF_VARIANT
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${4 + i * 9}%`,
                left: '-4%',
                width: variant.size,
                height: variant.size,
                borderRadius: variant.shape,
                background: variant.color,
                animation: `ambient-leaf-drift-${i % 3} ${5 + (i % 5)}s ease-in ${i * 0.35}s forwards`,
              }}
            />
          )
        })}
        <style>{`
          @keyframes ambient-leaf-drift-0 {
            from { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
            to { transform: translate(112vw, 14vh) rotate(220deg); opacity: 0.15; }
          }
          @keyframes ambient-leaf-drift-1 {
            from { transform: translate(0, 0) rotate(0deg); opacity: 0.85; }
            to { transform: translate(116vw, 24vh) rotate(320deg); opacity: 0.1; }
          }
          @keyframes ambient-leaf-drift-2 {
            from { transform: translate(0, 0) rotate(0deg); opacity: 0.75; }
            to { transform: translate(108vw, 8vh) rotate(160deg); opacity: 0.2; }
          }
        `}</style>
      </div>
    )
  }

  if (currentEvent.type === 'pigeons-fly') {
    return (
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.OBJECTS, pointerEvents: 'none' }}>
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="16"
            height="8"
            viewBox="0 0 16 8"
            style={{
              position: 'absolute',
              top: `${8 + i * 4}%`,
              left: '-5%',
              animation: `ambient-pigeon-fly 4.5s linear ${i * 0.3}s forwards`,
            }}
          >
            <path d="M0 4 Q4 0 8 4 Q12 0 16 4" stroke="rgba(30,30,32,0.6)" strokeWidth="1.4" fill="none" />
          </svg>
        ))}
        <style>{`
          @keyframes ambient-pigeon-fly {
            from { transform: translateX(0); }
            to { transform: translateX(115vw); }
          }
        `}</style>
      </div>
    )
  }

  return null
}
