'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useTimeline } from '@/engine/TimelineDirector/TimelineContext'

// `lightingProfile.ambientColor` is always an `rgba(...)` string, but the fog
// shader only ever uses it as an RGB vec3 (opacity is handled separately via
// `uDensity`). Extracting the channels ourselves avoids feeding a string with
// alpha into `THREE.Color` every frame — its CSS parser logs a console
// warning any time alpha is present, since `THREE.Color` has no alpha channel.
function rgbToThreeColor(rgba: string): THREE.Color {
  const match = /(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/.exec(rgba)
  if (!match) return new THREE.Color(1, 1, 1)
  const [, r, g, b] = match
  return new THREE.Color(Number(r) / 255, Number(g) / 255, Number(b) / 255)
}

/**
 * Atmospheric fog — a fullscreen quad with a radial gradient shader.
 * Density and color are driven by TimelineDirector's lightingProfile.
 */
export function FogSystem() {
  const { timeline } = useTimeline()

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uDensity: { value: 0.5 },
          uColor: { value: new THREE.Color(0.04, 0.05, 0.08) },
          uWarmth: { value: 0.1 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uDensity;
          uniform vec3 uColor;
          uniform float uWarmth;
          varying vec2 vUv;

          void main() {
            // Radial fog — denser at edges, lighter at centre
            vec2 centered = vUv * 2.0 - 1.0;
            float dist = length(centered);
            float fog = smoothstep(0.2, 1.4, dist) * uDensity;

            // Warm fog tint from lighting
            vec3 warmTint = mix(uColor, vec3(0.18, 0.10, 0.04), uWarmth * 0.4);
            gl_FragColor = vec4(warmTint, fog * 0.65);
          }
        `,
        transparent: true,
        depthWrite: false,
      }),
    []
  )

  useFrame(() => {
    const { fogDensity } = timeline.weatherState
    const { warmth, ambientColor } = timeline.lightingProfile

    const densityUniform = material.uniforms['uDensity']
    const warmthUniform = material.uniforms['uWarmth']
    const colorUniform = material.uniforms['uColor']

    if (densityUniform) densityUniform.value = fogDensity
    if (warmthUniform) warmthUniform.value = warmth
    if (colorUniform) colorUniform.value = rgbToThreeColor(ambientColor)
  })

  if (timeline.weatherState.fogDensity < 0.02) return null

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
