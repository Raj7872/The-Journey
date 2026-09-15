'use client'

// Seam positions as % from the bottom (near) edge — spaced closer together
// toward the top (far) edge, the classic hand-drawn illustration trick for
// suggesting a floor receding into the distance without literal 3D rotation.
const SEAM_POSITIONS = [8, 30, 48, 62, 73, 82, 89, 94, 97]

interface PerspectiveFloorProps {
  /** Height of the visible floor band, e.g. '30%' */
  height: string
  /** Color at the near edge (bottom, closest to viewer) */
  colorNear: string
  /** Color the floor fades to at the far edge — should read as "receding into the room" */
  colorFar: string
  /** Seam line color — give it real contrast, faint lines won't read at all */
  lineColor: string
  style?: React.CSSProperties
}

/**
 * PerspectiveFloor
 *
 * Deliberately stays flat 2D rather than using real CSS 3D transforms —
 * every prop standing on this floor is flat illustrated artwork with no
 * matching perspective, so a truly 3D-tilted floor plane looked like a
 * different surface glued underneath them. Instead this fakes depth the
 * way illustrators always have: seam lines spaced progressively closer
 * together toward the horizon, a front sheen where light catches the
 * floor nearest the viewer, and a strong atmospheric fade toward the
 * back. All flat, all in the same visual language as the furniture.
 */
export function PerspectiveFloor({
  height,
  colorNear,
  colorFar,
  lineColor,
  style,
}: PerspectiveFloorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      <div style={{ position: 'absolute', inset: 0, background: colorNear }} />
      <svg viewBox="0 0 1000 400" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {[-1200, -700, -300, 0, 250, 500, 750, 1000, 1300, 1700, 2200].map(x => (
          <path key={x} d={`M 500 -35 L ${x} 400`} stroke={lineColor} strokeWidth="1" opacity="0.5" />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 5%, rgba(230,183,113,0.11), transparent 65%), linear-gradient(90deg, rgba(0,0,0,0.25), transparent 30%, transparent 70%, rgba(0,0,0,0.25))' }} />

      {/* Seams — denser toward the top, suggesting distance */}
      {SEAM_POSITIONS.map((pct, i) => (
        <div
          key={pct}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `${pct}%`,
            height: 1,
            background: lineColor,
            opacity: 1 - i * 0.08,
          }}
        />
      ))}

      {/* Front sheen — light catching the floor near the viewer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '45%',
          background: 'linear-gradient(0deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Atmospheric fade toward the back */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(0deg, transparent 0%, transparent 30%, ${colorFar} 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
