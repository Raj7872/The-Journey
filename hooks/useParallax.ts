'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useReducedMotion } from './useReducedMotion'

interface ParallaxOptions {
  strength?: number   // How much movement. 0.02 = subtle, 0.1 = noticeable
  enabled?: boolean
  tilt?: boolean       // Also respond to device orientation (mobile). Off by default.
  tiltSensitivity?: number // px of offset per degree of tilt, once calibrated
}

// Requesting iOS 13+ device-orientation permission must happen inside a user
// gesture, and only once — a bare 'granted'/'denied' the browser remembers
// per session, so a second prompt would just silently no-op anyway.
let tiltPermissionRequested = false

/**
 * Drives a mouse-position (and, optionally, device-tilt) parallax offset,
 * written directly to CSS custom properties (--parallax-x / --parallax-y)
 * on the returned ref's element rather than through React state — the
 * offset changes every animation frame, and piping that through setState
 * would re-render the whole subtree at 60fps forever. Attach the ref to
 * the scene's root element; descendants read
 * `calc(var(--parallax-x, 0px) * depth)`.
 */
export function useParallax<T extends HTMLElement>({
  strength = 0.02,
  enabled = true,
  tilt = false,
  tiltSensitivity = 3,
}: ParallaxOptions = {}): React.RefObject<T | null> {
  const elementRef = useRef<T>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number | null>(null)
  const tiltBaseRef = useRef<{ gamma: number; beta: number } | null>(null)
  const reducedMotion = useReducedMotion()

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      targetRef.current = {
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
      }
    },
    [strength]
  )

  const handleOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      // First reading becomes neutral center — players hold phones at all
      // kinds of resting angles, so we calibrate to wherever they started
      // rather than to the sensor's absolute zero.
      if (!tiltBaseRef.current) {
        tiltBaseRef.current = { gamma: e.gamma, beta: e.beta }
        return
      }
      const dGamma = e.gamma - tiltBaseRef.current.gamma
      const dBeta = e.beta - tiltBaseRef.current.beta
      targetRef.current = {
        x: dGamma * tiltSensitivity,
        y: dBeta * tiltSensitivity,
      }
    },
    [tiltSensitivity]
  )

  useEffect(() => {
    if (!enabled || reducedMotion) {
      elementRef.current?.style.setProperty('--parallax-x', '0px')
      elementRef.current?.style.setProperty('--parallax-y', '0px')
      return
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    let cleanupTilt: (() => void) | undefined
    if (tilt && typeof DeviceOrientationEvent !== 'undefined') {
      const attach = () => {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true })
        cleanupTilt = () => window.removeEventListener('deviceorientation', handleOrientation)
      }

      const requestPermission = (
        DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<'granted' | 'denied'>
        }
      ).requestPermission

      if (typeof requestPermission === 'function') {
        const onFirstTouch = () => {
          if (tiltPermissionRequested) return
          tiltPermissionRequested = true
          requestPermission()
            .then((state) => { if (state === 'granted') attach() })
            .catch(() => {})
        }
        window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true })
        cleanupTilt = () => window.removeEventListener('touchstart', onFirstTouch)
      } else {
        attach()
      }
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const tick = () => {
      currentRef.current = {
        x: lerp(currentRef.current.x, targetRef.current.x, 0.06),
        y: lerp(currentRef.current.y, targetRef.current.y, 0.06),
      }
      elementRef.current?.style.setProperty('--parallax-x', `${currentRef.current.x}px`)
      elementRef.current?.style.setProperty('--parallax-y', `${currentRef.current.y}px`)
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cleanupTilt?.()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, reducedMotion, handleMouseMove, tilt, handleOrientation])

  return elementRef
}
