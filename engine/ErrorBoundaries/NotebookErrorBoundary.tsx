'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class NotebookErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[NotebookErrorBoundary]', error, info)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: '#f0e8d0',
            padding: '40px',
            fontFamily: 'Georgia, serif',
            color: '#2d1f0e',
            fontStyle: 'italic',
          }}
          role="alert"
        >
          This page is still being written.
        </div>
      )
    }

    return this.props.children
  }
}
