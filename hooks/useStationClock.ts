'use client'

import { useEffect, useState } from 'react'

import { formatClockTimeFull, getHourHandDegrees, getMinuteHandDegrees } from '@/lib/utils/time'

interface StationClockState {
  displayTime: string       // "11:58:42"
  hourDegrees: number
  minuteDegrees: number
  isFrozen: boolean         // True during proposal moment
  hasReachedMidnight: boolean
}

/**
 * Drives the station clock display.
 * Progress (0–1) moves time from 11:58 to 11:59:58.
 * Freezes at 11:59:50 during the proposal.
 * Snaps to 12:00 after YES.
 */
export function useStationClock(progress: number, isFrozen: boolean, isComplete: boolean): StationClockState {
  const [clockState, setClockState] = useState<StationClockState>({
    displayTime: '11:58',
    hourDegrees: getHourHandDegrees(11, 58),
    minuteDegrees: getMinuteHandDegrees(58),
    isFrozen: false,
    hasReachedMidnight: false,
  })

  useEffect(() => {
    if (isComplete) {
      setClockState({
        displayTime: '00:00',
        hourDegrees: getHourHandDegrees(0, 0),
        minuteDegrees: getMinuteHandDegrees(0),
        isFrozen: false,
        hasReachedMidnight: true,
      })
      return
    }

    if (isFrozen) {
      setClockState((prev) => ({ ...prev, isFrozen: true }))
      return
    }

    // 11:58:00 → 11:59:58 mapped to progress 0 → 1
    const decimalMinute = 58 + progress * 1.97
    const displayTime = formatClockTimeFull(decimalMinute)
    const hourDegrees = getHourHandDegrees(11, decimalMinute)
    const minuteDegrees = getMinuteHandDegrees(decimalMinute)

    setClockState({
      displayTime,
      hourDegrees,
      minuteDegrees,
      isFrozen: false,
      hasReachedMidnight: false,
    })
  }, [progress, isFrozen, isComplete])

  return clockState
}
