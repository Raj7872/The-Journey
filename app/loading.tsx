/**
 * App-level loading state.
 * Rendered by Next.js while the page segment loads.
 * The Preloader scene replaces this once the app mounts.
 */
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050608',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-label="The station is waking up"
    />
  )
}
