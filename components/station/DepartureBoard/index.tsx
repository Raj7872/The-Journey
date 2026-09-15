'use client'

import { useEffect, useRef, useState } from 'react'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface BoardRow {
  time: string
  destination: string
  sub?: string
  platform: string
  status: string
  statusType: 'on-time' | 'last' | 'departed' | 'soon'
  featured?: boolean
}

const BOARD_ROWS: BoardRow[] = [
  { time: '23:15', destination: 'Somewhere Far Away',       sub: 'The place you always talked about going',   platform: '03', status: 'Departed',  statusType: 'departed' },
  { time: '23:31', destination: 'The Life You Almost Chose', sub: "But didn't, and that's the whole story",    platform: '07', status: 'Departed',  statusType: 'departed' },
  { time: '23:48', destination: 'Where We First Met',        sub: 'Platform still open',                       platform: '02', status: 'On Time',   statusType: 'on-time'  },
  { time: '23:59', destination: 'Platform 11:59',            sub: 'Last train of the night — for us',          platform: '11', status: 'Last Call', statusType: 'last',    featured: true },
  { time: '00:00', destination: 'Whatever Comes After This', sub: 'Destination unknown',                       platform: '—',  status: 'Soon',      statusType: 'soon'     },
]

// After YES — the board shows one final message
const FINAL_ROW: BoardRow = {
  time: '00:00',
  destination: 'HOME',
  sub: 'Final Destination',
  platform: '11',
  status: 'Boarding',
  statusType: 'on-time',
  featured: true,
}

/**
 * DepartureBoard
 *
 * A mechanical flip board. Rows appear with staggered animation.
 * The featured row (Platform 11:59) pulses amber.
 * After the journey completes, a single final row replaces everything.
 */
export function DepartureBoard() {
  const { timeline } = useTimeline()
  const reducedMotion = useReducedMotion()
  const [flippedRows, setFlippedRows] = useState<boolean[]>(new Array(BOARD_ROWS.length).fill(false))
  const [showFinal, setShowFinal] = useState(false)
  const hasFlipped = useRef(false)

  const brightness = timeline.lightingProfile.brightness
  const warmth = timeline.lightingProfile.warmth
  const isComplete = timeline.progress >= 0.96 // world-changes scene

  // Staggered row reveal on mount
  useEffect(() => {
    if (hasFlipped.current) return
    hasFlipped.current = true

    BOARD_ROWS.forEach((_, i) => {
      setTimeout(() => {
        setFlippedRows((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, i * (reducedMotion ? 0 : 220))
    })
  }, [reducedMotion])

  // Show final message after YES
  useEffect(() => {
    if (isComplete) {
      setTimeout(() => setShowFinal(true), 2000)
    }
  }, [isComplete])

  const headerAlpha = 0.25 + brightness * 0.35
  const borderAlpha = 0.06 + brightness * 0.1
  const bgAlpha = 0.92 + brightness * 0.05

  return (
    <div
      style={{
        background: `rgba(8,9,14,${bgAlpha})`,
        border: `1px solid rgba(184,146,42,${headerAlpha})`,
        overflow: 'hidden',
        boxShadow: `0 0 40px rgba(0,0,0,0.8), 0 0 20px rgba(212,132,58,${headerAlpha * 0.2})`,
        transition: 'border-color 2s ease',
      }}
      role="region"
      aria-label="Departure board"
    >
      {/* Header */}
      <div
        style={{
          background: `rgba(212,132,58,${headerAlpha * 0.25})`,
          borderBottom: `1px solid rgba(184,146,42,${headerAlpha * 0.8})`,
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 2s ease',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 13,
            color: `rgba(212,132,58,${0.5 + brightness * 0.4})`,
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Departures · Tonight
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono, "Special Elite", monospace)',
            fontSize: 13,
            color: `rgba(212,132,58,${0.25 + brightness * 0.2})`,
            letterSpacing: '1.5px',
          }}
          aria-live="polite"
        >
          {Math.floor(timeline.clockMinute >= 60 ? 0 : 11)}:
          {String(Math.floor(timeline.clockMinute >= 60 ? 0 : timeline.clockMinute)).padStart(2, '0')}
        </span>
      </div>

      {/* Rows */}
      {showFinal ? (
        <FinalBoardRow row={FINAL_ROW} brightness={brightness} />
      ) : (
        BOARD_ROWS.map((row, i) => (
          <BoardRowComponent
            key={row.time}
            row={row}
            visible={flippedRows[i] ?? false}
            delay={i * 220}
            brightness={brightness}
            warmth={warmth}
            borderAlpha={borderAlpha}
            reducedMotion={reducedMotion}
          />
        ))
      )}

      {/* Footer note */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: `1px solid rgba(255,255,255,${borderAlpha})`,
          fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
          fontStyle: 'italic',
          fontSize: 12,
          color: `rgba(242,232,213,${0.18 + brightness * 0.12})`,
          transition: 'color 2s ease',
        }}
      >
        &ldquo;All destinations are temporary. Some arrivals are permanent.&rdquo;
      </div>
    </div>
  )
}

// ── Row sub-components ────────────────────────────────────────────────────────

interface BoardRowProps {
  row: BoardRow
  visible: boolean
  delay: number
  brightness: number
  warmth: number
  borderAlpha: number
  reducedMotion: boolean
}

function BoardRowComponent({ row, visible, brightness, borderAlpha, reducedMotion }: BoardRowProps) {
  const statusColors = {
    'on-time':  `rgba(61,90,71,${0.8 + brightness * 0.2})`,
    'last':     `rgba(212,132,58,${0.7 + brightness * 0.3})`,
    'departed': `rgba(242,232,213,${0.15 + brightness * 0.1})`,
    'soon':     `rgba(242,232,213,${0.2 + brightness * 0.15})`,
  }

  return (
    <div
      style={{
        padding: '14px 20px',
        borderBottom: `1px solid rgba(255,255,255,${borderAlpha})`,
        display: 'grid',
        gridTemplateColumns: '85px 1fr 82px 92px',
        gap: 12,
        alignItems: 'center',
        background: row.featured ? `rgba(212,132,58,${0.03 + brightness * 0.03})` : 'transparent',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: reducedMotion ? 'none' : 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Time */}
      <span
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 18,
          color: row.featured
            ? `rgba(212,132,58,${0.7 + brightness * 0.3})`
            : `rgba(242,232,213,${0.4 + brightness * 0.3})`,
          letterSpacing: 1,
          transition: 'color 2s ease',
        }}
      >
        {row.time}
      </span>

      {/* Destination */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
            fontSize: 16,
            color: `rgba(242,232,213,${0.55 + brightness * 0.35})`,
            transition: 'color 2s ease',
          }}
        >
          {row.destination}
        </div>
        {row.sub && (
          <div
            style={{
              fontFamily: 'var(--font-body, "Crimson Text", Georgia, serif)',
              fontStyle: 'italic',
              fontSize: 13,
              color: `rgba(242,232,213,${0.2 + brightness * 0.15})`,
              marginTop: 2,
              transition: 'color 2s ease',
            }}
          >
            {row.sub}
          </div>
        )}
      </div>

      {/* Platform */}
      <span
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 15,
          color: `rgba(242,232,213,${0.3 + brightness * 0.25})`,
          textAlign: 'center',
          transition: 'color 2s ease',
        }}
      >
        Plat. {row.platform}
      </span>

      {/* Status */}
      <span
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 12,
          letterSpacing: 1,
          color: statusColors[row.statusType],
          textAlign: 'right',
          transition: 'color 2s ease',
        }}
      >
        {row.status}
      </span>
    </div>
  )
}

function FinalBoardRow({ row, brightness }: { row: BoardRow; brightness: number }) {
  return (
    <div
      style={{
        padding: '28px 20px',
        display: 'grid',
        gridTemplateColumns: '85px 1fr 82px 92px',
        gap: 12,
        alignItems: 'center',
        background: `rgba(212,132,58,0.08)`,
        animation: 'board-row-final 1.5s ease forwards',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 20,
          color: `rgba(212,132,58,${0.8 + brightness * 0.2})`,
          letterSpacing: 1,
        }}
      >
        {row.time}
      </span>
      <div>
        {row.sub && (
          <div
            style={{
              fontFamily: 'var(--font-mono, "Special Elite", monospace)',
              fontSize: 12,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: `rgba(212,132,58,${0.55 + brightness * 0.3})`,
              marginBottom: 2,
            }}
          >
            {row.sub}
          </div>
        )}
        <div
          style={{
            fontFamily: 'var(--font-display, "IM Fell English", Georgia, serif)',
            fontSize: 22,
            color: `rgba(242,232,213,${0.9 + brightness * 0.1})`,
          }}
        >
          {row.destination}
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 15,
          color: `rgba(242,232,213,0.5)`,
          textAlign: 'center',
        }}
      >
        Plat. {row.platform}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono, "Special Elite", monospace)',
          fontSize: 12,
          letterSpacing: 1,
          color: `rgba(61,90,71,0.9)`,
          textAlign: 'right',
        }}
      >
        NOW BOARDING
      </span>
      <style>{`
        @keyframes board-row-final {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
