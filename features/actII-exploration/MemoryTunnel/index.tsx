'use client'

import { useState } from 'react'
import Image from 'next/image'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CASSETTES } from '@/content/memories/cassettes/cassettes'
import { Z_INDEX } from '@/lib/constants/zIndex'
import { faceGradient } from '@/lib/utils/shading'
import { COLORS } from '@/lib/constants/colors'

const cassette001 = CASSETTES.find((m) => m.id === 'cassette-001')

// `image` is optional — leave it unset and the poster falls back to the
// dashed placeholder box. Drop a file in public/images/memories/tunnel/
// and point `image` at it (e.g. '/images/memories/tunnel/first-laugh.png')
// to have that poster show a real photo instead.
const MEMORY_POSTERS: { label: string; left: string; top: string; image?: string }[] = [
  { label: 'Our Little Rivalry',        left: '8%',  top: '20%', image: '/images/memories/tunnel/rivalry.jpg' },
  { label: 'A flower for your hair',    left: '26%', top: '22%', image: '/images/memories/tunnel/flower.jpg' },
  { label: 'The First "I Love You"',    left: '44%', top: '20%', image: '/images/memories/tunnel/loveyou.jpg' },
  { label: 'Always Watching Out for You', left: '62%', top: '22%', image: '/images/memories/tunnel/protective.jpg' },
  { label: 'The First Sunflower',        left: '80%', top: '20%', image: '/images/memories/tunnel/sunflower.jpg' },
]

/**
 * MemoryTunnel
 *
 * A long underground corridor connecting platforms.
 * Walls contain old railway advertisements that are actually memories.
 * Paper edges move. Lights flicker. Music shifts.
 * One of the prettiest parts of the experience.
 */
export function MemoryTunnel() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.025 })
  const reducedMotion = useReducedMotion()
  const [expandedPoster, setExpandedPoster] = useState<{ label: string; image?: string } | null>(null)

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  const wallR = Math.round(10 + warmth * 6)
  const wallG = Math.round(10 + warmth * 4)
  const wallB = Math.round(18 - warmth * 4)
  const borderAlpha = 0.08 + brightness * 0.12

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Memory tunnel"
    >
      {/* Tunnel walls — perspective converging */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(4,4,8,0.98) 0%,
          rgba(${wallR},${wallG},${wallB},1) 15%,
          rgba(${wallR},${wallG},${wallB},1) 85%,
          rgba(4,4,8,0.98) 100%)`,
        transition: 'background 3s ease',
      }} aria-hidden="true" />

      {/* Ceiling strip lights — long perspective */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.2))`,
        width: '70%', height: 2,
        background: `rgba(184,146,42,${0.12 + brightness * 0.15})`,
        boxShadow: `0 0 20px 4px rgba(184,146,42,${0.06 + brightness * 0.08})`,
      }} aria-hidden="true" />

      {/* Floor — a shallow band at the base of the corridor, seams tightening toward the vanishing point */}
      <PerspectiveFloor
        height="14%"
        colorNear={`rgba(${wallR+6},${wallG+5},${wallB+4},1)`}
        colorFar="rgba(4,4,8,0.98)"
        lineColor={`rgba(184,146,42,${0.1 + brightness * 0.1})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.2))` }}
      />

      {/* Vanishing point light at far end */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) translateX(calc(var(--parallax-x, 0px) * 0.1))`,
        width: 60, height: 60,
        borderRadius: '50%',
        background: `radial-gradient(circle,
          rgba(212,132,58,${0.08 + brightness * 0.1}) 0%,
          transparent 70%)`,
        transition: 'background 3s ease',
      }} aria-hidden="true" />

      {/* ── A SHORT MESSAGE, RESTING WHERE THE LIGHT CONVERGES ──
          Fills what would otherwise be an empty stretch of wall below
          the posters — sitting right where the vanishing-point glow
          already falls, so it reads as the one thing the light in this
          whole corridor was pointed at, not an afterthought. */}
      <div style={{
        position: 'absolute', top: '60%', left: '50%',
        transform: `translate(-50%, -50%) translateX(calc(var(--parallax-x, 0px) * 0.15))`,
        textAlign: 'center',
        maxWidth: 380,
      }} aria-hidden="true">
        <div style={{
          fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 32,
          lineHeight: 1.6,
          color: `rgba(242,232,213,${0.4 + brightness * 0.3})`,
          textShadow: `0 0 20px rgba(212,132,58,${0.15 + brightness * 0.15})`,
          transition: 'color 3s ease',
        }}>
          No matter how dark the tunnel of life gets,<br />I&rsquo;ll always find my way back to you.
        </div>
      </div>

      {/* ── MEMORY POSTERS ── */}
      {MEMORY_POSTERS.map((poster, i) => (
        <MemoryPoster
          key={poster.label}
          label={poster.label}
          left={poster.left}
          top={poster.top}
          image={poster.image}
          index={i}
          brightness={brightness}
          warmth={warmth}
          borderAlpha={borderAlpha}
          reducedMotion={reducedMotion}
          onExpand={() => setExpandedPoster(poster)}
        />
      ))}

      {/* ── WALL FIXTURES — sconce lights ── */}
      {[15, 40, 60, 85].map((pct, i) => (
        <div key={pct} style={{
          position: 'absolute', top: '42%', left: `${pct}%`,
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * (0.4 + i * 0.1)))`,
          opacity: 0.5 + brightness * 0.3,
        }} aria-hidden="true">
          <div style={{
            width: 4, height: 16,
            background: `rgba(184,146,42,${0.2 + brightness * 0.2})`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
              width: 8, height: 8, borderRadius: '50%',
              background: `rgba(212,132,58,${0.4 + brightness * 0.4})`,
              boxShadow: `0 0 10px 4px rgba(212,132,58,${0.1 + brightness * 0.12})`,
              animation: reducedMotion ? 'none' : `lamp-flicker ${3 + i * 0.7}s ease-in-out infinite`,
            }} />
          </div>
        </div>
      ))}

      {/* ── COAT HOOK — an old coat, a cassette in its pocket ── */}
      <WorldObject
        label="An old coat hanging on a wall hook"
        hint={cassette001 && !isCollected(cassette001.id) ? 'Something in the pocket' : undefined}
        hoverCursorState="collect"
        isCollected={cassette001 ? isCollected(cassette001.id) : false}
        isCollectible={!!cassette001}
        interactSfx="cassette-insert"
        onInteract={() => {
          if (cassette001) { collect(cassette001); reveal(cassette001) }
        }}
        style={{
          position: 'absolute', top: '38%', left: '92%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.3))`,
          opacity: 0.55 + brightness * 0.2,
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={{ width: 3, height: 10, background: `rgba(184,146,42,${0.25 + brightness * 0.2})` }} />
          <div style={{
            position: 'absolute', top: 8, left: -10,
            width: 22, height: 34,
            background: faceGradient(20+Math.round(warmth*6), 16+Math.round(warmth*4), 12+Math.round(warmth*2), 0.9, 10),
            borderRadius: '4px 4px 2px 2px',
          }} />
          {cassette001 && !isCollected(cassette001.id) && (
            <div style={{
              position: 'absolute', top: 26, left: -3,
              width: 8, height: 6,
              background: `rgba(60,45,20,0.9)`,
              borderRadius: 1,
            }} />
          )}
        </div>
      </WorldObject>

      {/* ── NAVIGATION ── */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', padding: '0 24px',
      }}>
        <button
          onClick={() => transitionTo('platform-cafe', 'camera-move', 2000)}
          style={{
            background: `rgba(212,132,58,${0.08 + brightness * 0.06})`,
            border: `1px solid rgba(212,132,58,${0.35 + brightness * 0.15})`,
            borderRadius: 3,
            cursor: 'none',
            fontFamily: 'var(--font-mono,"Special Elite",monospace)',
            fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
            color: `rgba(212,132,58,${0.6 + brightness * 0.3})`,
            padding: '10px 16px',
            boxShadow: `0 0 16px 4px rgba(212,132,58,${0.14 + brightness * 0.1})`,
            transition: 'all 0.3s ease',
          }}
          aria-label="Return to café"
        >
          ← Café
        </button>
        <button
          onClick={() => transitionTo('waiting-room', 'camera-move', 2200)}
          style={{
            background: `rgba(212,132,58,${0.08 + brightness * 0.06})`,
            border: `1px solid rgba(212,132,58,${0.35 + brightness * 0.15})`,
            borderRadius: 3,
            cursor: 'none',
            fontFamily: 'var(--font-mono,"Special Elite",monospace)',
            fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
            color: `rgba(212,132,58,${0.6 + brightness * 0.3})`,
            padding: '10px 16px',
            boxShadow: `0 0 16px 4px rgba(212,132,58,${0.14 + brightness * 0.1})`,
            transition: 'all 0.3s ease',
          }}
          aria-label="Walk to waiting room"
        >
          Waiting Room →
        </button>
      </div>

      {/* ── EXPANDED POSTER — click backdrop to close ── */}
      {expandedPoster && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_INDEX.OVERLAY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Memory: ${expandedPoster.label}, expanded`}
        >
          <div
            onClick={() => setExpandedPoster(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(2,2,4,0.82)', cursor: 'none' }}
            aria-hidden="true"
          />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* Sized by its own content (inline-flex, not a fixed box) so the
                frame hugs whatever the photo's real proportions are — a tall
                photo and a wide photo shouldn't both get squeezed into the
                same fixed rectangle with dead space around them. Capped by
                max-width/height so it never outgrows the viewport. */}
            <div style={{
              display: 'inline-flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              maxWidth: '85vw', maxHeight: '82vh',
              background: `rgba(${Math.round(14+warmth*6)},${Math.round(12+warmth*4)},${Math.round(10+warmth*2)},0.95)`,
              border: `1px solid rgba(184,146,42,${borderAlpha * 2})`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              padding: '20px 16px',
            }}>
              {expandedPoster.image ? (
                <img
                  src={expandedPoster.image}
                  alt={expandedPoster.label}
                  style={{
                    display: 'block',
                    width: 'auto', height: 'auto',
                    maxWidth: '75vw', maxHeight: '65vh',
                  }}
                />
              ) : (
                <div style={{
                  width: 280, height: 350,
                  background: `rgba(184,146,42,${0.05 + brightness * 0.05})`,
                  border: `1px dashed rgba(184,146,42,${0.1 + brightness * 0.08})`,
                }} />
              )}
              <div style={{
                fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
                fontSize: 20,
                color: COLORS.PAPER_CREAM,
              }}>
                {expandedPoster.label}
              </div>
            </div>
            <button
              onClick={() => setExpandedPoster(null)}
              aria-label="Close"
              style={{
                all: 'unset',
                cursor: 'none',
                display: 'block',
                margin: '18px auto 0',
                padding: '12px 28px',
                border: '1px solid rgba(242,232,213,0.3)',
                borderRadius: 3,
                background: 'rgba(242,232,213,0.06)',
                fontFamily: 'var(--font-mono, "Special Elite", monospace)',
                fontSize: 11,
                letterSpacing: '2px',
                color: 'rgba(242,232,213,0.75)',
              }}
            >
              CLOSE ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes poster-edge-move {
          0%, 100% { transform: rotate(-0.3deg) translateY(0); }
          50% { transform: rotate(0.3deg) translateY(-1px); }
        }
      `}</style>
    </div>
  )
}

// ── Memory Poster ─────────────────────────────────────────────────────────────

interface MemoryPosterProps {
  label: string
  left: string
  top: string
  image?: string
  index: number
  brightness: number
  warmth: number
  borderAlpha: number
  reducedMotion: boolean
  onExpand: () => void
}

function MemoryPoster({
  label, left, top, image, index,
  brightness, warmth, borderAlpha, reducedMotion, onExpand,
}: MemoryPosterProps) {
  const parallaxDepth = 0.3 + index * 0.05

  return (
    <WorldObject
      label={`Memory poster: ${label}`}
      hint="Look closer"
      onInteract={onExpand}
      style={{
        position: 'absolute',
        left, top,
        transform: `translateX(calc(var(--parallax-x, 0px) * ${parallaxDepth}))`,
        width: 120, height: 165,
        animation: reducedMotion ? 'none'
          : `poster-edge-move ${4 + index * 0.6}s ease-in-out ${index * 0.4}s infinite`,
      }}
    >
      {/* Poster frame */}
      <div style={{
        width: '100%', height: '100%',
        background: `rgba(${Math.round(14+warmth*6)},${Math.round(12+warmth*4)},${Math.round(10+warmth*2)},0.85)`,
        border: `1px solid rgba(184,146,42,${borderAlpha})`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '8px 6px',
        position: 'relative',
        transition: 'border-color 2s ease',
      }}>
        {/* Poster pin */}
        <div style={{
          position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
          width: 5, height: 5, borderRadius: '50%',
          background: `rgba(184,146,42,${0.3 + brightness * 0.3})`,
        }} />

        {/* Image area — a real photo if provided, else a dashed placeholder */}
        <div style={{
          width: '75%', height: '60%',
          position: 'relative',
          overflow: 'hidden',
          background: image ? 'transparent' : `rgba(184,146,42,${0.04 + brightness * 0.04})`,
          border: image ? 'none' : `1px dashed rgba(184,146,42,${0.06 + brightness * 0.05})`,
        }}>
          {image && (
            <Image src={image} alt={label} fill style={{ objectFit: 'cover' }} />
          )}
        </div>

        {/* Label */}
        <div style={{
          fontFamily: 'var(--font-mono,"Special Elite",monospace)',
          fontSize: 9, letterSpacing: '1px',
          color: `rgba(184,146,42,${0.3 + brightness * 0.25})`,
          textAlign: 'center',
          textTransform: 'uppercase',
          lineHeight: 1.4,
          transition: 'color 2s ease',
        }}>
          {label}
        </div>
      </div>

      {/* Subtle edge wear / curl */}
      <div style={{
        position: 'absolute', bottom: -2, right: -2,
        width: 10, height: 10,
        background: `rgba(${Math.round(14+warmth*6)},${Math.round(12+warmth*4)},${Math.round(10+warmth*2)},0.5)`,
        clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        opacity: 0.6 + brightness * 0.2,
      }} />
    </WorldObject>
  )
}
