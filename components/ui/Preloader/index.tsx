'use client'

import { useEffect, useRef, useState } from 'react'

import { TIMING } from '@/lib/constants/timing'
import { assetPipeline } from '@/engine/AssetPipeline/AssetPipeline'

interface PreloaderProps {
  onComplete: () => void
}

type Phase =
  | 'dark'         // Initial — nothing visible
  | 'lights-on'    // Lamps flicker on one by one
  | 'clock'        // Clock hands settle to 11:58
  | 'rain'         // Rain sound fades in
  | 'ready'        // "Enter" prompt appears
  | 'exiting'      // Fade out

/**
 * Preloader
 *
 * The station waking up. Never shows a spinner.
 * Minimum 3 seconds of atmosphere before allowing entry.
 * Assets load in the background while the station comes to life.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>('dark')
  const [loadProgress, setLoadProgress] = useState(0)
  const [lamp1, setLamp1] = useState(false)
  const [lamp2, setLamp2] = useState(false)
  const [lamp3, setLamp3] = useState(false)
  const [clockVisible, setClockVisible] = useState(false)
  const [enterVisible, setEnterVisible] = useState(false)
  const assetsReady = useRef(false)
  const timerReady = useRef(false)

  // Asset loading — runs once on mount
  useEffect(() => {
    const unsubscribe = assetPipeline.subscribe((state) => {
      setLoadProgress(state.loadProgress)
      if (state.criticalAssetsLoaded) {
        assetsReady.current = true
        maybeAdvanceToReady()
      }
    })

    assetPipeline.preloadCritical().catch(() => {
      // If critical assets fail, still allow entry
      assetsReady.current = true
      maybeAdvanceToReady()
    })

    return unsubscribe
  }, []) // mount-only: assetPipeline is a singleton, no deps needed

  // Minimum duration timer (3s) + lamp sequence — runs once on mount
  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('lights-on'); setLamp1(true) }, 400)
    const t2 = setTimeout(() => setLamp2(true), 900)
    const t3 = setTimeout(() => setLamp3(true), 1400)
    const t4 = setTimeout(() => { setPhase('clock'); setClockVisible(true) }, 1800)
    const t5 = setTimeout(() => setPhase('rain'), 2400)
    const t6 = setTimeout(() => {
      timerReady.current = true
      maybeAdvanceToReady()
    }, TIMING.PRELOADER_MIN)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6)
    }
  }, []) // mount-only: timer sequence, no external deps

  function maybeAdvanceToReady() {
    if (assetsReady.current && timerReady.current) {
      setPhase('ready')
      setEnterVisible(true)
    }
  }

  function handleEnter() {
    setPhase('exiting')
    setTimeout(onComplete, 1200)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'var(--color-station-void, #050608)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 1.2s ease',
        opacity: phase === 'exiting' ? 0 : 1,
        pointerEvents: phase === 'exiting' ? 'none' : 'all',
      }}
      role="status"
      aria-label="The station is waking up"
    >
      {/* Rain grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/textures/noise.svg)',
          backgroundSize: '200px',
          opacity: 0.03,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* Station arch silhouette */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 380,
          borderTop: `1px solid ${lamp1 ? 'rgba(212,132,58,0.18)' : 'rgba(212,132,58,0.06)'}`,
          borderLeft: `1px solid ${lamp1 ? 'rgba(212,132,58,0.18)' : 'rgba(212,132,58,0.06)'}`,
          borderRight: `1px solid ${lamp1 ? 'rgba(212,132,58,0.18)' : 'rgba(212,132,58,0.06)'}`,
          borderBottom: 'none',
          borderRadius: '150px 150px 0 0',
          transition: 'border-color 2s ease',
        }}
        aria-hidden="true"
      />

      {/* Lamp 1 — left */}
      <Lamp
        visible={lamp1}
        style={{ position: 'absolute', bottom: 180, left: '28%' }}
      />

      {/* Lamp 2 — right */}
      <Lamp
        visible={lamp2}
        style={{ position: 'absolute', bottom: 180, right: '28%' }}
      />

      {/* Lamp 3 — center top (subtle) */}
      <Lamp
        visible={lamp3}
        style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)' }}
        small
      />

      {/* Clock */}
      <PreloaderClock visible={clockVisible} />

      {/* Station name */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          marginTop: '-60px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            letterSpacing: '4px',
            color: 'rgba(212,132,58,0.4)',
            textTransform: 'uppercase',
            marginBottom: 20,
            transition: 'opacity 1.5s ease',
            opacity: lamp1 ? 1 : 0,
          }}
        >
          Platform 11:59
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
            fontSize: 'clamp(40px, 7vw, 72px)',
            color: 'rgba(242,232,213,0.9)',
            lineHeight: 1,
            transition: 'opacity 1.8s ease',
            opacity: lamp2 ? 1 : 0,
          }}
        >
          The Last Train
          <br />
          <span style={{ color: 'var(--color-amber-glow, #d4843a)' }}>Home</span>
        </div>

        <div
          style={{
            width: 60,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(212,132,58,0.4), transparent)',
            margin: '20px auto',
            transition: 'opacity 1.2s ease',
            opacity: lamp3 ? 1 : 0,
          }}
          aria-hidden="true"
        />

        <div
          style={{
            fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(242,232,213,0.4)',
            lineHeight: 1.8,
            transition: 'opacity 1.5s ease',
            opacity: clockVisible ? 1 : 0,
          }}
        >
          Every destination tells a story.
          <br />
          This one ends with a question.
        </div>

        {/* Enter prompt */}
        <button
          onClick={handleEnter}
          style={{
            marginTop: 48,
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 10,
            letterSpacing: '4px',
            color: 'rgba(212,132,58,0.6)',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'opacity 1.5s ease, color 0.3s ease',
            opacity: enterVisible ? 1 : 0,
            animation: enterVisible ? 'preloader-pulse 2.5s ease-in-out infinite' : 'none',
            padding: '8px 0',
          }}
          aria-label="Enter the station"
        >
          — Enter the station —
        </button>
      </div>

      {/* Load progress — very subtle, bottom edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 1,
          width: `${loadProgress * 100}%`,
          background: 'rgba(212,132,58,0.3)',
          transition: 'width 0.5s ease',
        }}
        aria-hidden="true"
      />

      <style>{`
        @keyframes preloader-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface LampProps {
  visible: boolean
  style?: React.CSSProperties
  small?: boolean
}

function Lamp({ visible, style, small }: LampProps) {
  const size = small ? 8 : 12
  const glow = small ? 15 : 25

  return (
    <div
      style={{
        width: 2,
        height: small ? 40 : 60,
        background: visible ? 'rgba(212,132,58,0.4)' : 'transparent',
        transition: 'background 0.8s ease',
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size,
          height: size,
          borderRadius: '50%',
          background: visible ? 'rgba(212,132,58,0.8)' : 'transparent',
          boxShadow: visible
            ? `0 0 ${glow}px ${glow / 2}px rgba(212,132,58,0.25), 0 0 ${glow * 2}px ${glow}px rgba(212,132,58,0.1)`
            : 'none',
          transition: 'all 1.2s ease',
          animation: visible ? 'lamp-flicker 4s ease-in-out infinite' : 'none',
        }}
      />
    </div>
  )
}

function PreloaderClock({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.5s ease',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid rgba(184,146,42,0.3)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Hour hand: ~11:58 position */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: '50%',
            width: 1.5,
            height: 14,
            marginLeft: -0.75,
            background: 'rgba(242,232,213,0.6)',
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: 'rotate(354deg)', // 11:58 ≈ 354°
          }}
        />
        {/* Minute hand: 58min */}
        <div
          style={{
            position: 'absolute',
            bottom: '50%',
            left: '50%',
            width: 1,
            height: 18,
            marginLeft: -0.5,
            background: 'rgba(242,232,213,0.4)',
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: 'rotate(348deg)', // 58min ≈ 348°
          }}
        />
        <div
          style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(212,132,58,0.8)',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 9,
          color: 'rgba(184,146,42,0.5)',
          letterSpacing: '2px',
          textAlign: 'center',
          marginTop: 6,
        }}
      >
        11:58
      </div>
    </div>
  )
}
