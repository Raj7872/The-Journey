'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  sceneName?: string
}

interface State {
  hasError: boolean
}

/**
 * Scene-level error boundary.
 * If one scene fails, the others remain functional.
 * Renders an atmospheric placeholder rather than breaking the experience.
 */
export class SceneErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(
      `[SceneErrorBoundary] Scene "${this.props.sceneName ?? 'unknown'}" failed:`,
      error,
      info
    )
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#0a0b0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Scene loading error"
        >
          <div
            style={{
              color: 'rgba(212,132,58,0.2)',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: '16px',
            }}
          >
            The station is quiet here.
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
