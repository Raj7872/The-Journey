'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'

/** Safe read from a Float32Array — avoids non-null assertions */
function at(arr: Float32Array, i: number): number {
  return arr[i] ?? 0
}

const MAX_DROPS = 800
const FIELD_WIDTH = 30
const FIELD_HEIGHT = 20
const FIELD_DEPTH = 10

export function RainSystem() {
  const { timeline } = useTimeline()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const velocities = useRef<Float32Array>(new Float32Array(MAX_DROPS * 3))
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Geometry: thin elongated plane = rain drop (instancedMesh requires
  // triangle-based geometry, not line segments)
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.015, 0.18), [])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.62, 0.72, 0.9),
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  )

  // Initialise drop positions
  useMemo(() => {
    const vel = velocities.current
    for (let i = 0; i < MAX_DROPS; i++) {
      vel[i * 3 + 0] = (Math.random() - 0.5) * FIELD_WIDTH
      vel[i * 3 + 1] = (Math.random() - 0.5) * FIELD_HEIGHT
      vel[i * 3 + 2] = (Math.random() - 0.5) * FIELD_DEPTH
    }
  }, [])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const intensity = timeline.weatherState.rainIntensity
    const wind = timeline.weatherState.windStrength
    const activeDrops = Math.floor(intensity * MAX_DROPS)

    // Hide unused drops
    mesh.count = activeDrops

    const vel = velocities.current
    const speed = 12 + intensity * 8
    const slant = wind * 0.8 // horizontal drift from wind

    for (let i = 0; i < activeDrops; i++) {
      // Advance position
      vel[i * 3 + 0] = at(vel, i * 3 + 0) + slant * delta
      vel[i * 3 + 1] = at(vel, i * 3 + 1) - speed * delta

      // Wrap when drop exits bottom
      if (at(vel, i * 3 + 1) < -FIELD_HEIGHT / 2) {
        vel[i * 3 + 1] = FIELD_HEIGHT / 2
        vel[i * 3 + 0] = (Math.random() - 0.5) * FIELD_WIDTH
        vel[i * 3 + 2] = (Math.random() - 0.5) * FIELD_DEPTH
      }

      dummy.position.set(at(vel, i * 3), at(vel, i * 3 + 1), at(vel, i * 3 + 2))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true

    // Adjust opacity with intensity
    ;(mesh.material as THREE.MeshBasicMaterial).opacity = 0.1 + intensity * 0.3
  })

  if (timeline.weatherState.rainIntensity < 0.02) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_DROPS]}
      frustumCulled={false}
    />
  )
}
