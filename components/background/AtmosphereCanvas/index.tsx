'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'

import { WebGLErrorBoundary } from '@/engine/ErrorBoundaries/WebGLErrorBoundary'
import { RainSystem } from '../RainSystem'
import { FogSystem } from '../FogSystem'
import { ParticleSystem } from '../ParticleSystem'

/**
 * AtmosphereCanvas
 *
 * Fixed behind the entire experience (z-0). Pointer-events disabled — it is
 * purely visual. WebGL failure silently returns null; the experience continues
 * without atmospheric effects.
 *
 * Camera: orthographic-style perspective, far enough back to frame the scene.
 * Axes: X right, Y up, Z toward viewer. Scene width ~30 units = screen width.
 */
export function AtmosphereCanvas() {
  return (
    <WebGLErrorBoundary>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <Canvas
          camera={{
            fov: 50,
            near: 0.1,
            far: 100,
            position: [0, 0, 18],
          }}
          gl={{
            antialias: false,       // Performance — atmosphere doesn't need AA
            alpha: true,            // Transparent background — HTML shows through
            powerPreference: 'low-power',
            stencil: false,
            depth: false,
          }}
          style={{ background: 'transparent' }}
          frameloop="always"
          dpr={[1, 1.5]}            // Cap at 1.5 — atmosphere doesn't need retina
        >
          <RainSystem />
          <FogSystem />
          <ParticleSystem />
          <Preload all />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  )
}
