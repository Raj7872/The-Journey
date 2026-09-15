// ─────────────────────────────────────────────────────────────────────────────
// Cursor Types
// The custom cursor is a tiny glowing lantern.
// It has distinct states for different interaction contexts.
// ─────────────────────────────────────────────────────────────────────────────

export type CursorState =
  | 'default'    // Standard navigation — lantern, dim
  | 'hover'      // Hovering interactive object — lantern, bright, slightly expanded
  | 'collect'    // Hovering collectible — sparkle around lantern
  | 'notebook'   // Notebook is open — pen cursor
  | 'read'       // Reading a letter/postcard — static, minimal
  | 'proposal'   // Proposal scene — very minimal, focused

export interface CursorPosition {
  x: number
  y: number
}

export interface CursorManagerState {
  state: CursorState
  position: CursorPosition
  isVisible: boolean
  isEnabled: boolean
}
