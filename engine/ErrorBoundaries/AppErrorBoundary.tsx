'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Application-level error boundary.
 * Catches any unhandled error in the entire experience tree.
 * Renders a minimal, styled fallback — never a browser error page.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[AppErrorBoundary] Uncaught error:', error, info)
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: '#0a0b0f',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: 'rgba(242,232,213,0.6)',
              fontFamily: 'Georgia, serif',
            }}
          >
            <div style={{ fontSize: '14px', letterSpacing: '3px', opacity: 0.4 }}>
              PLATFORM 11:59
            </div>
            <div style={{ fontSize: '22px', fontStyle: 'italic' }}>
              The station encountered an unexpected moment.
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '24px',
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid rgba(212,132,58,0.3)',
                color: 'rgba(212,132,58,0.7)',
                fontFamily: 'Georgia, serif',
                fontSize: '12px',
                letterSpacing: '2px',
                cursor: 'pointer',
              }}
            >
              Return to the station
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
