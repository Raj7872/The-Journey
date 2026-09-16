'use client'

import { SunflowerBouquet } from '@/components/scenery/DimensionalProps'

import { useScene } from '@/engine/SceneManager/SceneContext'
import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useNotebook } from '@/engine/NotebookManager/NotebookContext'
import { useMemoryReveal } from '@/features/world/MemoryRevealContext'
import { AmbientLight } from '@/components/station/AmbientLight'
import { WorldObject } from '@/components/world/WorldObject'
import { SteamWisp } from '@/components/common/SteamWisp'
import { PerspectiveFloor } from '@/components/common/PerspectiveFloor'
import { useParallax } from '@/hooks/useParallax'
import { groundShadow, faceGradient } from '@/lib/utils/shading'
import { LETTERS } from '@/content/memories/letters/letters'
import { POSTCARDS } from '@/content/memories/postcards/postcards'
import { POLAROIDS } from '@/content/memories/polaroids/polaroids'
import { RECEIPTS } from '@/content/memories/receipts/receipts'

const letter003 = LETTERS.find((m) => m.id === 'letter-003')
const postcard002 = POSTCARDS.find((m) => m.id === 'postcard-002')
const polaroid001 = POLAROIDS.find((m) => m.id === 'polaroid-001')
const receipt001 = RECEIPTS.find((m) => m.id === 'receipt-001')

/**
 * PlatformCafé
 *
 * The warmest place in the station. Yellow lighting. Fresh coffee.
 * Soft jazz. Wood furniture. Bookshelves. Old radio. Typewriter.
 * The player should want to stay here.
 */
export function PlatformCafe() {
  const { transitionTo } = useScene()
  const { timeline } = useTimeline()
  const { collect, isCollected } = useNotebook()
  const { reveal } = useMemoryReveal()
  const parallaxRef = useParallax<HTMLDivElement>({ strength: 0.016 })

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth

  // Café is the warmest scene — even at low progress it feels cosy
  const cafeWarmth = Math.min(warmth + 0.3, 1)

  const wallR = Math.round(20 + cafeWarmth * 12)
  const wallG = Math.round(16 + cafeWarmth * 8)
  const wallB = Math.round(10 + cafeWarmth * 4)

  return (
    <div
      ref={parallaxRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      role="region"
      aria-label="Platform café"
    >
      {/* Warm café interior walls */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          rgba(${wallR},${wallG},${wallB},1) 0%,
          rgba(${wallR+4},${wallG+3},${wallB+2},1) 100%)`,
        transition: 'background 3s ease',
      }} aria-hidden="true" />

      {/* Low ceiling — cosy */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '15%',
        background: `linear-gradient(180deg, rgba(8,6,4,0.95) 0%, transparent 100%)`,
      }} aria-hidden="true" />

      {/* Café floor — same footprint the furniture already aligns to, now with
          seams spaced closer together toward the back to suggest depth */}
      <PerspectiveFloor
        height="40%"
        colorNear={`rgba(${Math.round(26+cafeWarmth*10)},${Math.round(18+cafeWarmth*6)},${Math.round(12+cafeWarmth*3)},0.95)`}
        colorFar={`rgba(${wallR},${wallG},${wallB},1)`}
        lineColor={`rgba(255,255,255,${0.1 + brightness * 0.08})`}
        style={{ transform: `translateX(calc(var(--parallax-x, 0px) * 0.2))` }}
      />

      {/* Overhead pendant lamp — centre */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.3))`,
      }} aria-hidden="true">
        <AmbientLight size="large" flickerOffset={0.2} />
      </div>

      {/* Side lamps for extra warmth */}
      {[22, 78].map((pct, i) => (
        <div key={pct} style={{
          position: 'absolute', top: 0, left: `${pct}%`,
          transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.4))`,
        }} aria-hidden="true">
          <AmbientLight size="small" flickerOffset={i * 2.1} />
        </div>
      ))}

      {/* ── BOOKSHELF — back wall, a postcard wedged between books ── */}
      <WorldObject
        label="A bookshelf — something wedged between the books"
        hint={postcard002 && !isCollected(postcard002.id) ? 'A postcard, wedged between books' : undefined}
        hoverCursorState="collect"
        isCollected={postcard002 ? isCollected(postcard002.id) : false}
        isCollectible={!!postcard002}
        interactSfx="postcard-flip"
        onInteract={() => {
          if (postcard002) { collect(postcard002); reveal(postcard002) }
        }}
        style={{
          position: 'absolute', top: '18%', left: '6%',
          width: '10%', height: '16%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.7))`,
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: 3,
          border: `1px solid rgba(184,146,42,${0.1 + brightness * 0.08})`,
          padding: '8px 6px',
          background: `rgba(${Math.round(18+cafeWarmth*8)},${Math.round(13+cafeWarmth*5)},${Math.round(9+cafeWarmth*3)},0.6)`,
        }}>
          {/* Book spines */}
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} style={{ display: 'flex', gap: 2, height: 18 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  flex: `0 0 ${10 + (i % 3) * 4}px`,
                  height: '100%',
                  background: `rgba(${Math.round(40 + i * 20)},${Math.round(28 + i * 10)},${Math.round(16 + i * 8)},${0.4 + brightness * 0.3})`,
                  borderRadius: '0 1px 1px 0',
                }} />
              ))}
            </div>
          ))}
          {postcard002 && !isCollected(postcard002.id) && (
            <div style={{
              position: 'absolute', top: '40%', right: 2,
              width: 10, height: 14,
              background: `rgba(242,232,213,${0.35 + brightness * 0.15})`,
              transform: 'rotate(-3deg)',
            }} />
          )}
        </div>
      </WorldObject>

      {/* Small counters ground the typewriter and radio, clear of the caf? table. */}
      {[{left:'18%',bottom:'28%',height:72,width:100},{left:'67%',bottom:'28%',height:108,width:120}].map((cabinet,i) => (
        <div key={i} aria-hidden="true" style={{position:'absolute',...cabinet,background:'linear-gradient(100deg,#4e3b28,#271f18)',borderTop:'5px solid #826943',boxShadow:'8px -5px 0 #3b3024, inset 0 1px 0 #c3a06a55',transform:`translateX(calc(var(--parallax-x, 0px) * ${i ? 0.55 : 0.5}))`}}>
          <div style={{position:'absolute',inset:'12px 10px 8px',border:'1px solid #9d7f4b33',boxShadow:'inset 2px 0 3px #0004'}} />
          <div style={{position:'absolute',top:'45%',left:'45%',width:12,height:3,background:'#9c8150'}} />
        </div>
      ))}

      {/* ── TYPEWRITER — a receipt tucked inside ── */}
      <WorldObject
        label="An old typewriter on the counter"
        hint={receipt001 && !isCollected(receipt001.id) ? 'A receipt tucked inside' : undefined}
        hoverCursorState="collect"
        isCollected={receipt001 ? isCollected(receipt001.id) : false}
        isCollectible={!!receipt001}
        interactSfx="paper-rustle"
        onInteract={() => {
          if (receipt001) { collect(receipt001); reveal(receipt001) }
        }}
        style={{
          position: 'absolute', bottom: '36%', left: '19%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.5))`,
          opacity: 0.75 + brightness * 0.15,
        }}
      >
        <div style={{
          width: 56, height: 38,
          background: faceGradient(22+Math.round(cafeWarmth*6), 18+Math.round(cafeWarmth*4), 14+Math.round(cafeWarmth*2)),
          border: `1px solid rgba(184,146,42,${0.15 + brightness * 0.1})`,
          borderRadius: '2px 2px 4px 4px',
          position: 'relative',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 6,
        }}>
          <div style={groundShadow(56, 0.35)} />
          {/* Keys */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,8px)', gap: 2 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 6,
                background: `rgba(${Math.round(30+cafeWarmth*8)},${Math.round(24+cafeWarmth*5)},${Math.round(18+cafeWarmth*3)},0.8)`,
                borderRadius: 1,
                border: `1px solid rgba(184,146,42,0.1)`,
              }} />
            ))}
          </div>
          {/* Paper in typewriter */}
          <div style={{
            position: 'absolute', top: -10, left: '50%',
            transform: 'translateX(-50%)',
            width: 34, height: 16,
            background: `rgba(242,232,213,${0.4 + brightness * 0.2})`,
          }} />
        </div>
      </WorldObject>

      {/* ── OLD RADIO — pure atmosphere, nothing hidden here ── */}
      <WorldObject
        label="A vintage radio on the shelf"
        hint="Static, and an old jazz standard"
        interactSfx="paper-rustle"
        style={{
          position: 'absolute', bottom: '40%', right: '28%',
          transform: `translateX(calc(var(--parallax-x, 0px) * 0.55))`,
          opacity: 0.7 + brightness * 0.2,
        }}
      >
        <div style={{
          position: 'relative',
          width: 48, height: 32,
          background: faceGradient(32+Math.round(cafeWarmth*8), 24+Math.round(cafeWarmth*5), 16+Math.round(cafeWarmth*3), 0.85),
          border: `1px solid rgba(184,146,42,${0.12 + brightness * 0.1})`,
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={groundShadow(48, 0.3)} />
          {/* Speaker grille */}
          <div style={{
            width: 20, height: 20,
            border: `1px solid rgba(184,146,42,0.2)`,
            borderRadius: 1,
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.5, padding: 2,
          }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ background: `rgba(184,146,42,${0.1 + brightness * 0.08})`, borderRadius: 0.5 }} />
            ))}
          </div>
          {/* Dial */}
          <div style={{
            width: 10, height: 10,
            borderRadius: '50%',
            border: `1px solid rgba(184,146,42,${0.2 + brightness * 0.15})`,
          }} />
        </div>
      </WorldObject>

      {/* ── CAFÉ TABLE — cups, napkin holder, and vase are all anchored to its
          own tabletop below, not independently guessed positions, so they
          can't drift off the surface again ── */}
      <div style={{
        position: 'absolute', bottom: '32%', left: '43%',
        transform: `translateX(-50%) translateX(calc(var(--parallax-x, 0px) * 0.42)) scale(1.65)`,
        transformOrigin: 'bottom center',
        opacity: 0.7 + brightness * 0.2,
      }}>
        <div style={{ position: 'relative' }}>
          <div style={groundShadow(150, 0.4)} />
          {/* Tabletop */}
          <div style={{
            width: 210, height: 46,
            boxShadow: '0 7px 0 #382b20, 0 9px 0 #a1814a55, inset 0 2px 1px #d3ae7744',
            borderRadius: '50%',
            background: faceGradient(30+Math.round(cafeWarmth*10), 22+Math.round(cafeWarmth*6), 14+Math.round(cafeWarmth*3), 0.92, 14),
            border: `1px solid rgba(184,146,42,${0.18 + brightness * 0.12})`,
          }} />
          {/* Pedestal leg */}
          <div style={{
            width: 13, height: 56, margin: '0 auto',
            background: 'linear-gradient(90deg, rgba(20,15,9,0.9), rgba(38,28,16,0.9) 50%, rgba(20,15,9,0.9))',
          }} />
          {/* Base */}
          <div style={{
            width: 66, height: 9, margin: '0 auto',
            borderRadius: '50%',
            background: 'rgba(18,13,8,0.85)',
          }} />

          {/* ── Everything below sits on the tabletop surface, positioned
              relative to this same table group. bottom: 89px = base 6 + leg
              36 + half the tabletop's own 26px height, so items rest in the
              body of the ellipse rather than hanging off its front lip. Kept
              well clear of left/right 0-10% and 90-100%, where the ellipse
              tapers to almost nothing and anything placed there reads as
              hanging off the edge. ── */}

          {/* Coffee cups — two mugs, one tipped; the upright one hides a letter */}
          <div style={{
            position: 'absolute', bottom: 89, left: '36%',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <WorldObject
              label="A coffee cup on the table"
              hint={letter003 && !isCollected(letter003.id) ? 'Something folded underneath' : undefined}
              hoverCursorState="collect"
              isCollected={letter003 ? isCollected(letter003.id) : false}
              isCollectible={!!letter003}
              interactSfx="paper-unfold"
              onInteract={() => {
                if (letter003) { collect(letter003); reveal(letter003) }
              }}
            >
              <div style={{
                width: 16, height: 20,
                background: faceGradient(22+Math.round(cafeWarmth*5), 18+Math.round(cafeWarmth*3), 14+Math.round(cafeWarmth*2), 0.85, 12),
                border: `1px solid rgba(184,146,42,${0.15 + brightness * 0.1})`,
                borderRadius: '3px 3px 7px 7px',
                boxShadow: 'inset 3px 0 3px #dfc9a744, 2px 2px 3px #0005',
                position: 'relative',
              }}>
                <div style={groundShadow(20, 0.35)} />
                <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)' }}>
                  <SteamWisp width={12} height={20} opacity={0.22 + brightness * 0.1} />
                </div>
                {letter003 && !isCollected(letter003.id) && (
                  <div style={{
                    position: 'absolute', bottom: -4, left: -3,
                    width: 20, height: 4,
                    background: `rgba(242,232,213,${0.3 + brightness * 0.15})`,
                  }} />
                )}
              </div>
            </WorldObject>
            {/* Slightly tipped mug — just an empty cup */}
            <div style={{ transform: 'rotate(12deg)', transformOrigin: 'bottom center' }} aria-hidden="true">
              <div style={{
                width: 14, height: 18,
                background: `rgba(${Math.round(20+cafeWarmth*5)},${Math.round(16+cafeWarmth*3)},${Math.round(12+cafeWarmth*2)},0.75)`,
                border: `1px solid rgba(184,146,42,${0.12 + brightness * 0.08})`,
                borderRadius: '0 0 3px 3px',
              }} />
            </div>
          </div>

          {/* Napkin holder — a polaroid tucked behind it */}
          <WorldObject
            label="A napkin holder on the table"
            hint={polaroid001 && !isCollected(polaroid001.id) ? 'Something behind the napkins' : undefined}
            hoverCursorState="collect"
            isCollected={polaroid001 ? isCollected(polaroid001.id) : false}
            isCollectible={!!polaroid001}
            interactSfx="polaroid-develop"
            onInteract={() => {
              if (polaroid001) { collect(polaroid001); reveal(polaroid001) }
            }}
            style={{ position: 'absolute', bottom: 89, left: '13%' }}
          >
            <div style={{ position: 'relative' }}>
              <div style={groundShadow(22, 0.35)} />
              <div style={{
                width: 18, height: 22,
                background: faceGradient(28+Math.round(cafeWarmth*8), 20+Math.round(cafeWarmth*5), 14+Math.round(cafeWarmth*3), 0.85, 12),
                border: `1px solid rgba(184,146,42,${0.15 + brightness * 0.1})`,
                borderRadius: '2px 2px 0 0',
              }} />
            </div>
          </WorldObject>

          <div style={{ position: 'absolute', bottom: 94, right: '16%' }} aria-hidden="true">
            <SunflowerBouquet width={36} single />
          </div>
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', padding: '0 28px',
      }}>
        <button
          onClick={() => transitionTo('platform-one', 'camera-move', 2000)}
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
          aria-label="Return to Platform One"
        >
          ← Platform
        </button>
        <button
          onClick={() => transitionTo('memory-tunnel', 'walk-through-door', 2800)}
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
          aria-label="Walk to the Memory Tunnel"
        >
          Tunnel →
        </button>
      </div>
    </div>
  )
}
