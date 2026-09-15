'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { TIMING } from '@/lib/constants/timing'
import { randomBetween } from '@/lib/utils/math'
import { useAnimationManager } from '@/engine/AnimationManager/AnimationContext'

interface HandwrittenTextProps {
  /** Body text — supports <br> for line breaks and <em>…</em> for emphasis */
  text: string
  /** Base ms per character — defaults to TIMING.INK_WRITE_PER_CHAR */
  msPerChar?: number
  /** Called once every character has been revealed */
  onComplete?: () => void
  /** Ink color — defaults to the standard dark ink tone */
  color?: string
  style?: React.CSSProperties
  className?: string
}

type Token =
  | { type: 'char'; value: string; em: boolean; poolsInk: boolean; jitter: { rotate: number; y: number; opacity: number } }
  | { type: 'br' }

/** Parses the limited markup letters use (<br>, <em>) into a flat token stream. */
function parseBody(text: string): Token[] {
  const tokens: Token[] = []
  let emDepth = 0
  const parts = text.split(/(<br\s*\/?>|<em>|<\/em>)/gi)

  for (const part of parts) {
    if (!part) continue
    if (/^<br\s*\/?>$/i.test(part)) {
      tokens.push({ type: 'br' })
      continue
    }
    if (/^<em>$/i.test(part)) {
      emDepth++
      continue
    }
    if (/^<\/em>$/i.test(part)) {
      emDepth = Math.max(0, emDepth - 1)
      continue
    }
    for (const value of part) {
      tokens.push({
        type: 'char',
        value,
        em: emDepth > 0,
        // The pen pauses longest at the end of a sentence — a little ink
        // pools there while it does, same as it would on real paper.
        poolsInk: /[.!?]/.test(value),
        // Slight, stable-per-character imperfection — never re-randomized on re-render.
        jitter: {
          rotate: randomBetween(-2.5, 2.5),
          y: randomBetween(-1, 1),
          opacity: randomBetween(0.88, 1),
        },
      })
    }
  }
  return tokens
}

type CharToken = Extract<Token, { type: 'char' }>
type WordUnit = { type: 'word'; chars: CharToken[] } | { type: 'space'; char: CharToken }

/** Splits a run of char tokens into words (kept together) and lone spaces (breakable). */
function splitIntoWords(chars: CharToken[]): WordUnit[] {
  const units: WordUnit[] = []
  let current: CharToken[] = []

  for (const c of chars) {
    if (/\s/.test(c.value)) {
      if (current.length > 0) {
        units.push({ type: 'word', chars: current })
        current = []
      }
      units.push({ type: 'space', char: c })
    } else {
      current.push(c)
    }
  }
  if (current.length > 0) units.push({ type: 'word', chars: current })

  return units
}

/** A single revealed character — its jitter, and the ink-pool dot after sentence-ending punctuation. */
function InkChar({ c, color }: { c: CharToken; color: string }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        // A lone space character inside its own inline-block is
        // simultaneously the first and last thing in that box, so
        // normal whitespace-collapsing rules trim it to zero width
        // — every space between words silently vanished without
        // this. `pre` stops that collapse without needing to
        // special-case which characters are spaces.
        whiteSpace: 'pre',
        transform: `rotate(${c.jitter.rotate}deg) translateY(${c.jitter.y}px)`,
        opacity: c.jitter.opacity,
      }}
    >
      {c.value}
      {/* A little ink pooling where the pen paused longest —
          the period/question/exclamation mark itself, not a
          separate mark, so it reads as the ink spreading rather
          than an extra dot appearing. */}
      {c.poolsInk && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', left: '50%', bottom: -1,
            width: 5, height: 5, borderRadius: '50%',
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle, ${color} 0%, transparent 75%)`,
            animation: 'ink-pool-bloom 0.7s ease-out 0.15s both',
          }}
        />
      )}
    </span>
  )
}

/**
 * HandwrittenText
 *
 * Reveals text character by character like ink appearing on paper —
 * never a mechanical typewriter cadence. Speed varies naturally (a little
 * slower after punctuation, a little faster through short words), and each
 * character carries a tiny, stable rotation/opacity imperfection.
 *
 * Reusable across letters, notebook pages, and the final letter.
 */
export function HandwrittenText({
  text,
  msPerChar = TIMING.INK_WRITE_PER_CHAR,
  onComplete,
  color = 'var(--color-ink-dark, #2d1f0e)',
  style,
  className,
}: HandwrittenTextProps) {
  const { animationState } = useAnimationManager()
  const tokens = useMemo(() => parseBody(text), [text])
  const [revealedCount, setRevealedCount] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setRevealedCount(0)

    if (animationState.reducedMotion) {
      setRevealedCount(tokens.length)
      onCompleteRef.current?.()
      return
    }

    let cancelled = false
    let index = 0

    function revealNext() {
      if (cancelled) return
      index++
      setRevealedCount(index)

      if (index >= tokens.length) {
        onCompleteRef.current?.()
        return
      }

      const token = tokens[index - 1]
      const nextChar = token?.type === 'char' ? token.value : ''
      // Organic rhythm: a real breath at the end of a sentence, a smaller
      // hitch at a comma or dash, quick through spaces, and — since real
      // handwriting is never metronomic — every character's own delay is
      // additionally jittered by up to ±40% regardless of which of these
      // it falls into.
      const pause = /[.!?]/.test(nextChar) ? msPerChar * 7
        : /[,—]/.test(nextChar) ? msPerChar * 3
        : /\s/.test(nextChar) ? msPerChar * 0.4
        : msPerChar
      const delay = randomBetween(pause * 0.6, pause * 1.4)

      timer = setTimeout(revealNext, delay)
    }

    let timer = setTimeout(revealNext, msPerChar)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [tokens, msPerChar, animationState.reducedMotion])

  // Group consecutive characters of the same em-state into spans for fewer DOM nodes.
  const groups: { em: boolean; chars: Extract<Token, { type: 'char' }>[] }[] = []

  for (const token of tokens.slice(0, revealedCount)) {
    if (token.type === 'br') {
      groups.push({ em: false, chars: [] })
      continue
    }
    const last = groups[groups.length - 1]
    if (last && last.em === token.em && last.chars.length > 0) {
      last.chars.push(token)
    } else {
      groups.push({ em: token.em, chars: [token] })
    }
  }

  return (
    <span className={className} style={{ color, ...style }}>
      {groups.map((group, i) =>
        group.chars.length === 0 ? (
          <br key={i} />
        ) : (
          <span key={i} style={{ fontStyle: group.em ? 'italic' : 'normal' }}>
            {/* Each word is wrapped in its own inline-block so the browser
                can only break the line between words (or at a lone space),
                never between two letters — otherwise every letter being its
                own inline-block (below) is an independently wrappable box,
                and lines break mid-word the moment they run out of room. */}
            {splitIntoWords(group.chars).map((unit, k) =>
              unit.type === 'space' ? (
                <InkChar key={k} c={unit.char} color={color} />
              ) : (
                <span key={k} style={{ display: 'inline-block' }}>
                  {unit.chars.map((c, j) => (
                    <InkChar key={j} c={c} color={color} />
                  ))}
                </span>
              )
            )}
          </span>
        )
      )}
      <style>{`
        @keyframes ink-pool-bloom {
          0% { transform: translateX(-50%) scale(0); opacity: 0; }
          45% { transform: translateX(-50%) scale(1.4); opacity: 0.5; }
          100% { transform: translateX(-50%) scale(1); opacity: 0.35; }
        }
      `}</style>
    </span>
  )
}
