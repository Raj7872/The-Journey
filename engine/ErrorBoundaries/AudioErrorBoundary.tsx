'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Audio error boundary.
 * If Howler.js fails or the browser blocks audio,
 * the experience continues silently.
 */
export class AudioErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.warn('[AudioErrorBoundary] Audio unavailable — continuing silently:', error.message, info)
  }

  override render() {
    // If audio fails, children still render — experience continues without sound
    if (this.state.hasError) {
      return this.props.children
    }

    return this.props.children
  }
}
