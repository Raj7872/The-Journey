// ─────────────────────────────────────────────────────────────────────────────
// Time Utilities
// Used by the station clock and cinematic timing systems.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a decimal minute value (e.g. 58.75) as HH:MM
 */
export function formatClockTime(decimalMinute: number): string {
  const hours = 11
  const minutes = Math.floor(decimalMinute)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Format a decimal minute value as HH:MM:SS
 */
export function formatClockTimeFull(decimalMinute: number): string {
  const hours = 11
  const minutes = Math.floor(decimalMinute)
  const seconds = Math.floor((decimalMinute % 1) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Get the hour hand rotation in degrees for a given time
 */
export function getHourHandDegrees(hour: number, minute: number): number {
  return (hour / 12) * 360 + (minute / 60) * 30
}

/**
 * Get the minute hand rotation in degrees
 */
export function getMinuteHandDegrees(minute: number): number {
  return (minute / 60) * 360
}

/**
 * Format milliseconds as M:SS display string
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Sleep for a given number of milliseconds
 * Used in cinematic sequences only — never in render paths
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
