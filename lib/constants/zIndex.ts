// ─────────────────────────────────────────────────────────────────────────────
// Z-Index Scale
// Every layer in the experience has a named constant.
// Never use a bare number for z-index in a component.
// ─────────────────────────────────────────────────────────────────────────────

export const Z_INDEX = {
  ATMOSPHERE: 0,       // R3F canvas — rain, fog, particles
  WORLD: 10,           // Station environment, scenes
  OBJECTS: 20,         // Interactive station objects
  OBJECT_HOVER: 21,    // Object when hovered/lifted
  AMBIENT_TEXT: 30,    // Subtle ambient captions
  SETTINGS: 60,        // Settings panel
  OVERLAY: 80,         // Modal panels, letter views
  NOTEBOOK: 85,        // Notebook overlay — once open, nothing but the scene
                       // transition fade and the cursor may sit above it
  TRANSITION: 90,      // Scene transition overlay
  CURSOR: 400,         // Custom cursor (always on top)
  TOAST: 200,          // Debug toasts (dev only)
  DEBUG_PANEL: 210,    // Debug panel (dev only, above everything including cursor)
} as const

export type ZIndexKey = keyof typeof Z_INDEX
