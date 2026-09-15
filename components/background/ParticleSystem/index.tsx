'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'

/** Safe read from a Float32Array — avoids non-null assertions */
function at(arr: Float32Array, i: number): number {
  return arr[i] ?? 0
}

// ─────────────────────────────────────────────────────────────────────────────
// Dust Motes — slow floating particles in light shafts
// ─────────────────────────────────────────────────────────────────────────────

const MAX_DUST = 200
const DUST_COLOR = new THREE.Color(0.85, 0.75, 0.55)

function DustSystem() {
  const { timeline } = useTimeline()
  const ref = useRef<THREE.Points>(null)
  const positions = useRef(new Float32Array(MAX_DUST * 3))
  const phases = useRef(new Float32Array(MAX_DUST))
  const speeds = useRef(new Float32Array(MAX_DUST))

  useMemo(() => {
    for (let i = 0; i < MAX_DUST; i++) {
      positions.current[i * 3 + 0] = (Math.random() - 0.5) * 20
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 8
      phases.current[i] = Math.random() * Math.PI * 2
      speeds.current[i] = 0.05 + Math.random() * 0.1
    }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions.current.slice(), 3))
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: DUST_COLOR,
        size: 0.04,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    []
  )

  useFrame((state) => {
    const pts = ref.current
    if (!pts) return
    const density = timeline.particleProfile.dustDensity
    if (density < 0.02) { pts.visible = false; return }
    pts.visible = true

    const t = state.clock.elapsedTime
    const pos = pts.geometry.attributes['position'] as THREE.BufferAttribute
    const count = Math.floor(density * MAX_DUST)
    pts.geometry.setDrawRange(0, count)

    for (let i = 0; i < count; i++) {
      const ph = at(phases.current, i)
      const sp = at(speeds.current, i)
      pos.array[i * 3 + 1] = at(positions.current, i * 3 + 1) + Math.sin(t * sp + ph) * 0.5
      pos.array[i * 3 + 0] = at(positions.current, i * 3 + 0) + Math.cos(t * sp * 0.7 + ph) * 0.2
    }
    pos.needsUpdate = true
    material.opacity = 0.15 + density * 0.3
    material.color.setRGB(
      0.85 + timeline.lightingProfile.warmth * 0.1,
      0.75 + timeline.lightingProfile.warmth * 0.05,
      0.55
    )
  })

  return <points ref={ref} geometry={geometry} material={material} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Steam Wisps — rising semi-transparent plumes
// ─────────────────────────────────────────────────────────────────────────────

const MAX_STEAM = 60

function SteamSystem() {
  const { timeline } = useTimeline()
  const ref = useRef<THREE.Points>(null)
  const origins = useRef(new Float32Array(MAX_STEAM * 3))
  const lifetimes = useRef(new Float32Array(MAX_STEAM))
  const maxLife = useRef(new Float32Array(MAX_STEAM))

  useMemo(() => {
    // Steam rises from floor level at random x positions
    for (let i = 0; i < MAX_STEAM; i++) {
      origins.current[i * 3 + 0] = (Math.random() - 0.5) * 16
      origins.current[i * 3 + 1] = -4 + Math.random() * 2
      origins.current[i * 3 + 2] = (Math.random() - 0.5) * 6
      lifetimes.current[i] = Math.random() * 3
      maxLife.current[i] = 2 + Math.random() * 2
    }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(MAX_STEAM * 3)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: new THREE.Color(0.8, 0.8, 0.85),
        size: 0.3,
        transparent: true,
        opacity: 0.12,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    []
  )

  useFrame((_, delta) => {
    const pts = ref.current
    if (!pts) return
    const density = timeline.particleProfile.steamDensity
    if (density < 0.02) { pts.visible = false; return }
    pts.visible = true

    const count = Math.floor(density * MAX_STEAM)
    pts.geometry.setDrawRange(0, count)
    const pos = pts.geometry.attributes['position'] as THREE.BufferAttribute

    for (let i = 0; i < count; i++) {
      lifetimes.current[i] = at(lifetimes.current, i) + delta
      const ml = at(maxLife.current, i)
      if (at(lifetimes.current, i) > ml) {
        lifetimes.current[i] = 0
        origins.current[i * 3 + 0] = (Math.random() - 0.5) * 16
      }

      const t = at(lifetimes.current, i) / ml
      const drift = Math.sin(t * Math.PI * 2 + i) * 0.3
      pos.array[i * 3 + 0] = at(origins.current, i * 3 + 0) + drift
      pos.array[i * 3 + 1] = at(origins.current, i * 3 + 1) + t * 3
      pos.array[i * 3 + 2] = at(origins.current, i * 3 + 2)
    }
    pos.needsUpdate = true
    material.opacity = (0.06 + density * 0.1) * (1 - 0)
  })

  return <points ref={ref} geometry={geometry} material={material} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Fireflies — Act V only, warm golden points
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FIREFLIES = 80
const FIREFLY_COLOR = new THREE.Color(0.9, 0.95, 0.5)

function FireflySystem() {
  const { timeline } = useTimeline()
  const ref = useRef<THREE.Points>(null)
  const positions = useRef(new Float32Array(MAX_FIREFLIES * 3))
  const phases = useRef(new Float32Array(MAX_FIREFLIES))

  useMemo(() => {
    for (let i = 0; i < MAX_FIREFLIES; i++) {
      positions.current[i * 3 + 0] = (Math.random() - 0.5) * 24
      positions.current[i * 3 + 1] = -3 + Math.random() * 8
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 10
      phases.current[i] = Math.random() * Math.PI * 2
    }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions.current.slice(), 3))
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: FIREFLY_COLOR,
        size: 0.08,
        transparent: true,
        opacity: 0,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    []
  )

  useFrame((state) => {
    const pts = ref.current
    if (!pts) return
    const density = timeline.particleProfile.fireflyDensity
    if (density < 0.01) { pts.visible = false; return }
    pts.visible = true

    const t = state.clock.elapsedTime
    const count = Math.floor(density * MAX_FIREFLIES)
    pts.geometry.setDrawRange(0, count)
    const pos = pts.geometry.attributes['position'] as THREE.BufferAttribute

    for (let i = 0; i < count; i++) {
      const ph = at(phases.current, i)
      pos.array[i * 3 + 0] = at(positions.current, i * 3 + 0) + Math.sin(t * 0.4 + ph) * 1.2
      pos.array[i * 3 + 1] = at(positions.current, i * 3 + 1) + Math.sin(t * 0.25 + ph * 1.3) * 0.6
      pos.array[i * 3 + 2] = at(positions.current, i * 3 + 2)
    }
    pos.needsUpdate = true
    // Firefly pulse
    material.opacity = density * (0.4 + Math.sin(t * 1.5) * 0.2)
  })

  return <points ref={ref} geometry={geometry} material={material} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined export
// ─────────────────────────────────────────────────────────────────────────────

export function ParticleSystem() {
  return (
    <>
      <DustSystem />
      <SteamSystem />
      <FireflySystem />
    </>
  )
}
