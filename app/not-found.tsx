import Link from 'next/link'

/**
 * 404 — styled to match the experience atmosphere
 */
export default function NotFound() {
  return (
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
        fontFamily: 'Georgia, serif',
        color: 'rgba(242,232,213,0.5)',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(212,132,58,0.4)',
          marginBottom: '8px',
        }}
      >
        Platform 11:59
      </div>
      <div
        style={{
          fontSize: '22px',
          fontStyle: 'italic',
          color: 'rgba(242,232,213,0.6)',
        }}
      >
        This platform doesn&apos;t exist.
      </div>
      <div
        style={{
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'rgba(242,232,213,0.3)',
          marginTop: '4px',
        }}
      >
        But the station is still waiting.
      </div>
      <Link
        href="/"
        style={{
          marginTop: '32px',
          padding: '10px 28px',
          border: '1px solid rgba(212,132,58,0.25)',
          color: 'rgba(212,132,58,0.6)',
          fontFamily: 'Georgia, serif',
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        Return to the station
      </Link>
    </div>
  )
}
