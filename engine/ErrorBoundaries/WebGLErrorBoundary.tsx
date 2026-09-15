'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

/**
 * WebGL/R3F error boundary.
 * If Three.js fails (hardware not supported, WebGL unavailable),
 * the experience continues without atmospheric effects.
 * HTML world always works.
 */
export class WebGLErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.warn(
      '[WebGLErrorBoundary] WebGL unavailable — experience continues without effects:',
      error.message,
      info
    )
  }

  override render() {
    // If WebGL fails, render nothing — experience continues without the canvas
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}
