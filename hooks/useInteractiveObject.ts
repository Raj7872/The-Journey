'use client'

import { useCallback, useRef, useState } from 'react'

import type { CursorState } from '@/types/cursor'
import { TIMING } from '@/lib/constants/timing'
import { useCursor } from '@/engine/CursorManager/CursorContext'

interface InteractiveObjectOptions {
  /** Cursor state when hovering this object */
  hoverCursorState?: CursorState
  /** Whether this object has been collected (disables interaction) */
  isCollected?: boolean
  /** Cooldown after interaction in ms */
  cooldownMs?: number
  onHover?: () => void
  onLeave?: () => void
  onClick?: () => void
}

interface InteractiveObjectResult {
  isHovered: boolean
  isFocused: boolean
  isOnCooldown: boolean
  handlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
    onClick: () => void
    onKeyDown: (e: React.KeyboardEvent) => void
  }
}

/**
 * Provides consistent hover, focus, click, and cooldown behaviour
 * for every interactive object in the station.
 * Used as a base for all collectibles and ambient interactions.
 */
export function useInteractiveObject({
  hoverCursorState = 'hover',
  isCollected = false,
  cooldownMs = TIMING.INTERACTION_COOLDOWN,
  onHover,
  onLeave,
  onClick,
}: InteractiveObjectOptions = {}): InteractiveObjectResult {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isOnCooldown, setIsOnCooldown] = useState(false)
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setCursorState } = useCursor()

  const triggerCooldown = useCallback(() => {
    setIsOnCooldown(true)
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(() => setIsOnCooldown(false), cooldownMs)
  }, [cooldownMs])

  const handleMouseEnter = useCallback(() => {
    if (isCollected) return
    setIsHovered(true)
    setCursorState(hoverCursorState)
    onHover?.()
  }, [isCollected, hoverCursorState, setCursorState, onHover])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setCursorState('default')
    onLeave?.()
  }, [setCursorState, onLeave])

  const handleFocus = useCallback(() => {
    if (isCollected) return
    setIsFocused(true)
  }, [isCollected])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  const handleClick = useCallback(() => {
    if (isCollected || isOnCooldown) return
    triggerCooldown()
    onClick?.()
  }, [isCollected, isOnCooldown, triggerCooldown, onClick])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )

  return {
    isHovered,
    isFocused,
    isOnCooldown,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    },
  }
}
