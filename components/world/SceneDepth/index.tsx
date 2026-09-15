'use client'

import { useId } from 'react'
import type { SceneId } from '@/types/scene'

/** Small vector scenery, with no textures, extra WebGL contexts or frame timers. */
export function SceneDepth({ sceneId }: { sceneId: SceneId }) {
  const id = useId().replace(/:/g, '')
  if (sceneId === 'credits') return null
  const meadow = ['the-field', 'the-bench', 'the-gift', 'the-silence', 'the-question', 'world-changes'].includes(sceneId)
  const platform = ['outside-station', 'platform-one', 'platform-eleven', 'train-arrival'].includes(sceneId)
  const carriage = ['train-interior', 'final-carriage'].includes(sceneId)
  const warm = meadow || ['platform-cafe', 'waiting-room'].includes(sceneId)
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`${id}-edge`}><stop stopColor={warm ? '#30251b' : '#101821'} /><stop offset="0.5" stopColor={warm ? '#806044' : '#38434a'} /><stop offset="0.6" stopColor="#11151a" /><stop offset="1" stopColor="#05080d" /></linearGradient>
          <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={warm ? '#ffe0a4' : '#b6cfe3'} stopOpacity="0.09" /><stop offset="1" stopColor="#ffe0a4" stopOpacity="0" /></linearGradient>
          <radialGradient id={`${id}-shade`}><stop offset="0.5" stopColor="#03060b" stopOpacity="0" /><stop offset="1" stopColor="#03060b" stopOpacity={meadow ? '0.16' : '0.38'} /></radialGradient>
        </defs>
        {!meadow && <>
          {/* Near jambs and their inner bevel give the viewer a place in the room. */}
          <path d="M0 0H36V900H0Z M1404 0H1440V900H1404Z" fill={`url(#${id}-edge)`} opacity="0.8" />
          <path d={platform ? 'M0 0H1440V28L720 58L0 28Z' : 'M0 0H1440V24L1360 52H80L0 24Z'} fill="#080c12" opacity="0.65" />
          <path d="M36 0V900 M1404 0V900" stroke="#d5b887" strokeOpacity="0.13" />
          {!carriage && <path d="M180 65L290 65L960 810L530 810Z" fill={`url(#${id}-beam)`} />}
          {platform && <path d="M0 845L470 900H0Z M1440 845L970 900H1440Z" fill="#04080d" opacity="0.5" />}
        </>}
        {meadow && <g fill="none" strokeLinecap="round">
          {Array.from({ length: 36 }, (_, i) => {
            const x = i < 18 ? i * 19 : 1110 + (i - 18) * 20
            const h = 26 + (i * 29) % 90
            return <path key={i} d={`M${x} 905 Q${x + 8} ${900 - h * 0.7} ${x + (i % 2 ? 25 : -20)} ${900 - h}`} stroke={i % 3 ? '#37442a' : '#8c9156'} strokeWidth={i % 3 + 2} opacity="0.48" />
          })}
        </g>}
        <rect width="1440" height="900" fill={`url(#${id}-shade)`} />
      </svg>
      <div className="scene-depth-motes" style={{ position: 'absolute', left: warm ? '57%' : '18%', top: '16%', width: 260, height: 330, opacity: meadow ? 0.35 : 0.2 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <i key={i} style={{ position: 'absolute', left: `${(i * 37) % 100}%`, top: `${(i * 23) % 100}%`, width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, borderRadius: '50%', background: warm ? '#ffe2ab' : '#d0e0ec' }} />)}
      </div>
      <style>{`
        .scene-depth-motes { animation: scene-depth-drift 24s ease-in-out infinite alternate; }
        @keyframes scene-depth-drift { from { transform: translate(0, 8px); } to { transform: translate(14px, -16px); } }
        @media (prefers-reduced-motion: reduce) { .scene-depth-motes { animation: none; } }
      `}</style>
    </div>
  )
}
