export const STATUS_COLORS = {
  ok: '#6b9e7a',       // sage green
  warning: '#c4943e',  // warm amber
  critical: '#c4644a', // soft coral
  unknown: '#b5ada3',  // warm grey
} as const;

export const THEME = {
  background: '#f5f2ed',        // warm off-white, like wet sand
  surface: '#ece8e1',           // warm stone
  surfaceElevated: '#ffffff',   // clean white for cards
  text: '#2d2a26',              // warm charcoal
  textSecondary: '#8a8478',     // driftwood grey
  accent: '#5a8f8b',            // muted teal
  accentSoft: '#e8f0ef',        // very light teal
  border: '#ddd8d0',            // warm border
  statusOkBg: '#edf5ef',        // sage tint
  statusWarnBg: '#f8f1e4',      // amber tint
  statusCritBg: '#f8ebe7',      // coral tint
} as const;
