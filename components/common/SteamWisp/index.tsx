'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SteamWispProps {
  width?: number
  height?: number
  opacity?: number
}

/**
 * SteamWisp
 *
 * A few soft, looping curls of steam drifting upward and fading — reusable
 * anywhere something warm needs to look freshly poured (coffee cups now,
 * potentially tea/food later). Continuous ambient detail, not a discrete event.
 */
export function SteamWisp({ width = 16, height = 30, opacity = 0.3 }: SteamWispProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) return null

  return (
    <div
      aria-hidden="true"
      style={{ position: 'relative', width, height, pointerEvents: 'none' }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${30 + i * 15}%`,
            width: 3,
            height: height * 0.6,
            borderRadius: '50%',
            background: `rgba(220,220,215,${opacity})`,
            filter: 'blur(1.5px)',
            animation: `steam-wisp-rise ${2.6 + i * 0.4}s ease-in ${i * 0.7}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes steam-wisp-rise {
          0% { transform: translateY(0) translateX(0) scaleY(0.6); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-${height}px) translateX(6px) scaleY(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
