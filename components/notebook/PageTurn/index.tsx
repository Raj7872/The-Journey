'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { TIMING } from '@/lib/constants/timing'
import { useAnimationManager } from '@/engine/AnimationManager/AnimationContext'

interface PageTurnProps {
  /** Changing this key plays the flip transition */
  pageKey: string | number
  children: ReactNode
}

/**
 * PageTurn
 *
 * Wraps notebook page content and plays a physical-feeling flip whenever
 * `pageKey` changes — the current page tilts away and fades, then the new
 * page settles back into place. Reusable for section changes and
 * within-section page changes alike.
 */
export function PageTurn({ pageKey, children }: PageTurnProps) {
  const { animationState } = useAnimationManager()
  const [displayedKey, setDisplayedKey] = useState(pageKey)
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (pageKey === displayedKey) {
      setDisplayedChildren(children)
      return
    }

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (animationState.reducedMotion) {
      setDisplayedKey(pageKey)
      setDisplayedChildren(children)
      setPhase('idle')
      return
    }

    const half = TIMING.NOTEBOOK_PAGE_TURN / 2
    setPhase('out')

    const t1 = setTimeout(() => {
      setDisplayedKey(pageKey)
      setDisplayedChildren(children)
      setPhase('in')

      const t2 = setTimeout(() => setPhase('idle'), half)
      timersRef.current.push(t2)
    }, half)
    timersRef.current.push(t1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, animationState.reducedMotion])

  const half = TIMING.NOTEBOOK_PAGE_TURN / 2

  return (
    <div
      style={{
        transition: animationState.reducedMotion
          ? 'none'
          : `transform ${half}ms ease, opacity ${half}ms ease`,
        transform: phase === 'out' ? 'rotateY(-14deg) scale(0.97)' : 'rotateY(0deg) scale(1)',
        opacity: phase === 'out' ? 0 : 1,
        transformOrigin: 'left center',
        perspective: 1200,
      }}
    >
      {displayedChildren}
    </div>
  )
}
