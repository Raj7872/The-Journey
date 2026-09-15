'use client'

interface PageBookmarkProps {
  color: string
  label: string
}

/** A small ribbon bookmark sticking out of the current page's edge. */
export function PageBookmark({ color, label }: PageBookmarkProps) {
  return (
    <div
      aria-hidden="true"
      title={label}
      style={{
        position: 'absolute',
        top: -6,
        right: 28,
        width: 22,
        height: 46,
        background: color,
        opacity: 0.85,
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
        boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
      }}
    />
  )
}
