'use client'

import { UpholsteredChair, Hearth, RecordPlayer } from '@/components/scenery/DimensionalProps'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { RainWindow } from '@/components/station/RainWindow'
import { WorldObject } from '@/components/world/WorldObject'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { COLORS } from '@/lib/constants/colors'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { LETTERS } from '@/content/memories/letters/letters'
import { POSTCARDS } from '@/content/memories/postcards/postcards'
import { FLOWERS } from '@/content/memories/flowers/flowers'

const letter004 = LETTERS.find((m) => m.id === 'letter-004')
const postcard003 = POSTCARDS.find((m) => m.id === 'postcard-003')
const flower001 = FLOWERS.find((m) => m.id === 'flower-001')

/**
 * WaitingRoom
 *
 * Quiet. Large windows. Rain slowly running down glass.
 * Comfortable wooden chairs. Old fireplace. Large bookshelf.
 * Vinyl player. Leather notebook.
 *
 * The player can freely sit. Nothing happens.
 * Sometimes silence is stronger than dialogue.
 */
export function WaitingRoom() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.014 })

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  const wallR = Math.round(16 + warmth * 10)
  const wallG = Math.round(13 + warmth * 7)
  const wallB = Math.round(10 + warmth * 4)
  const borderAlpha = 0.08 + brightness * 0.1

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Station waiting room"
    >
      {/* Back wall — slightly warmer than other scenes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${wallR},${wallG},${wallB},1) 0%,
          rgba(${wallR + 4},${wallG + 3},${wallB + 2},1) 100%)`,
        transition: 'background 3s ease',
      }} aria-hidden="true" />

      {/* Ceiling */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '16%',
        background: 'linear-gradient(180deg, rgba(5,4,3,0.96) 0%, transparent 100%)',
      }} aria-hidden="true" />

      {/* Wood floor — seams spaced closer together toward the back, suggesting depth */}
      <PerspectiveFloor
        height="28%"
        colorNear={`rgba(${Math.round(28 + warmth * 8)},${Math.round(20 + warmth * 5)},${Math.round(13 + warmth * 3)},1)`}
        colorFar={`rgba(${wallR},${wallG},${wallB},1)`}
        lineColor={`rgba(255,255,255,${0.1 + brightness * 0.08})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.2))` }}
      />

      {/* Ceiling lamp — warm, low */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.3))`,
      }} aria-hidden="true">
        <AmbientLight size="large" flickerOffset={0.5} />
      </div>

      {/* ── LARGE RAIN WINDOWS — back wall ── */}
      <div style={{
        position: 'absolute', top: '18%', left: '50%',
        transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.35))`,
        display: 'flex', gap: 16,
      }}>
        <RainWindow width={130} height={180} />
        <RainWindow width={130} height={180} />
      </div>

      {/* ── FIREPLACE — left side ── */}
      <div style={{
        position: 'absolute', bottom: '28%', left: '8%',
        transform: `translateX(calc(var(--parallax-x, 0px) * 0.6))`,
        opacity: 0.75 + brightness * 0.15,
      }} aria-hidden="true">
        <Hearth width={205} />
      </div>

      {/* ── SIDE TABLE — the surface the vinyl player sits on ── */}
      <div style={{
        position: 'absolute', bottom: '26%', right: '11%',
        transform: `translateX(calc(var(--parallax-x, 0px) * 0.55))`,
        opacity: 0.7 + brightness * 0.2,
      }} aria-hidden="true">
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(90, 0.4)} />
          <div style={{
            width: 118, height: 14,
            boxShadow: '9px -5px 0 #776047, 0 4px 0 #201b17',
            background: faceGradient(28+Math.round(warmth*8), 20+Math.round(warmth*5), 13+Math.round(warmth*3), 0.9, 12),
            border: `1px solid rgba(184,146,42,${borderAlpha})`,
            borderRadius: 1,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 6px' }}>
            {[0, 1].map((j) => (
              <div key={j} style={{
                width: 5, height: 24,
                background: 'linear-gradient(180deg, rgba(40,30,18,0.9), rgba(20,15,9,0.9))',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── VINYL PLAYER — a postcard in the record sleeve ── */}
      <WorldObject
        label="A vinyl record player — a sleeve leaning against it"
        hint={postcard003 && !isCollected(postcard003.id) ? 'A postcard in the record sleeve' : undefined}
        hoverCursorState="collect"
        isCollected={postcard003 ? isCollected(postcard003.id) : false}
        isCollectible={!!postcard003}
        interactSfx="postcard-flip"
        onInteract={() => {
          if (postcard003) { collect(postcard003); reveal(postcard003) }
        }}
        style={{
          position: 'absolute', bottom: 'calc(26% + 37px)', right: '11%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.55))`,
          opacity: 0.7 + brightness * 0.2,
        }}
      >
        <RecordPlayer width={110} />
        {/* Record sleeve leaning against the player */}
        {postcard003 && !isCollected(postcard003.id) && (
          <div style={{
            position: 'absolute', bottom: -2, left: -14,
            width: 16, height: 40,
            background: `rgba(${Math.round(26 + warmth * 6)},${Math.round(20 + warmth * 4)},${Math.round(14 + warmth * 2)},0.9)`,
            border: `1px solid rgba(184,146,42,${borderAlpha})`,
            transform: 'rotate(-4deg)',
          }} />
        )}
      </WorldObject>

      {/* ── LEATHER CHAIRS — a journal on one, a pressed flower on the other ── */}
      {[
        { left: '34%', rotation: -2 },
        { left: '54%', rotation: 3 },
      ].map(({ left, rotation }, i) => {
        const memory = i === 0 ? letter004 : flower001
        const sfx = i === 0 ? 'paper-unfold' : 'flower-rustle'
        return (
        <WorldObject
          key={left}
          label={i === 0 ? 'A leather armchair — a journal left on it' : 'Another chair — a pressed flower on the cushion'}
          hint={memory && !isCollected(memory.id) ? (i === 0 ? 'A small journal' : 'A flower') : undefined}
          hoverCursorState="collect"
          isCollected={memory ? isCollected(memory.id) : false}
          isCollectible={!!memory}
          interactSfx={sfx}
          onInteract={() => {
            if (memory) { collect(memory); reveal(memory) }
          }}
          style={{
            position: 'absolute', bottom: '28%', left,
            transform: `translateX(calc(var(--parallax-x, 0px) * (0.5 + i * 0.1))) rotate(${rotation}deg)`,
            opacity: 0.65 + brightness * 0.2,
          }}
        >
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <UpholsteredChair width={128} />
            <div style={{ position: 'absolute', left: 36, bottom: 38, transform: 'rotate(-6deg)' }}>
              {i === 1 && flower001 && !isCollected(flower001.id) && (
                <div style={{
                  width: 10, height: 14,
                  background: `rgba(61,90,71,${0.4 + brightness * 0.2})`,
                  borderRadius: '50% 50% 0 0',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: -5, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 6, height: 6, borderRadius: '50%',
                    background: `rgba(${Math.round(160 + warmth * 40)},${Math.round(90 + warmth * 20)},${Math.round(50 + warmth * 10)},0.5)`,
                  }} />
                </div>
              )}
              {i === 0 && letter004 && !isCollected(letter004.id) && (
                <div style={{
                  width: 22, height: 16,
                  background: COLORS.WOOD_MEDIUM,
                  border: `1px solid rgba(184,146,42,${borderAlpha})`,
                  borderRadius: 1,
                }} />
              )}
            </div>

          </div>
        </WorldObject>
        )
      })}

      {/* ── NAVIGATION ── */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', padding: '0 28px',
      }}>
        <button
          onClick={() => transitionTo('memory-tunnel', 'camera-move', 2000)}
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
          aria-label="Return to memory tunnel"
        >
          ← Tunnel
        </button>
        <button
          onClick={() => transitionTo('platform-eleven', 'walk-through-door', 3000)}
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
          aria-label="Walk to Platform Eleven"
        >
          Platform 11 →
        </button>
      </div>

      <style>{`
        @keyframes fire-flicker {
          from { opacity: 0.7; transform: scaleX(0.95); }
          to   { opacity: 1;   transform: scaleX(1.05); }
        }
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
