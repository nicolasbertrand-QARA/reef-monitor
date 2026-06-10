export const STATUS_COLORS = {
  ok: '#6b9e7a',       // sage green
  warning: '#c4943e',  // warm amber
  critical: '#c4644a', // soft coral
  unknown: '#b5ada3',  // warm grey
} as const;

// Darker variants for TEXT in status colors. The STATUS_COLORS above sit
// around 2.4-3.4:1 on their tinted backgrounds, fine for dots and chart
// lines but below WCAG AA for text. These pass >=4.5:1 on their own tint,
// on surface, and on white (verified computationally).
export const STATUS_TEXT_COLORS = {
  ok: '#3f7354',
  warning: '#8a6520',
  critical: '#9c4630',
  unknown: '#6e685c',
} as const;

export const THEME = {
  background: '#f5f2ed',        // warm off-white, like wet sand
  surface: '#ece8e1',           // warm stone
  surfaceElevated: '#ffffff',   // clean white for cards
  text: '#2d2a26',              // warm charcoal
  textSecondary: '#6e685c',     // driftwood grey (4.95:1 on background — WCAG AA)
  accent: '#47736f',            // muted teal (5.32:1 with white text — WCAG AA)
  accentSoft: '#e8f0ef',        // very light teal
  border: '#ddd8d0',            // warm border
  waterChange: '#5a8fb8',       // steel blue — water-change markers and entries, everywhere
  statusOkBg: '#edf5ef',        // sage tint
  statusWarnBg: '#f8f1e4',      // amber tint
  statusCritBg: '#f8ebe7',      // coral tint
} as const;
