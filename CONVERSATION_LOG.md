# Reef Monitor — Development Conversation Log

**Date:** April 17–18, 2026
**Developer:** Nicolas Bertrand (with Claude Code)

---

## Session Summary

Built a complete nano reef aquarium water parameter monitoring app from scratch in a single session — from initial research through App Store submission.

---

## Chronological Log

### Phase 1: Research & Planning
- Researched reef water parameter monitoring best practices (sources: BRS, Reef2Reef, ATI, etc.)
- Gathered requirements: 30L nano tank, Salifert test kits, manual entry
- User chose: React Native (Expo), TypeScript, local SQLite storage, mobile app
- Created implementation plan covering 6 phases

### Phase 2: Initial Build
- Scaffolded Expo app with tabs template
- Installed core deps: expo-sqlite, date-fns, expo-haptics
- Built complete data layer: SQLite schema (readings, thresholds, dosing_log, reminder_schedules)
- Built all components: ParamCard, ParamInput (stepper), StatusBadge, TrendChart, QuickLogGrid, RatioIndicator, TimeRangeSelector
- Built 4 tab screens: Dashboard, Log, Trends, Settings
- Built dosing log modal
- Implemented: threshold evaluation, NO3:PO4 ratio, Ca/Alk/Mg ionic balance, Alk consumption rate (linear regression)

### Phase 3: Design Overhaul (/impeccable)
- Ran design context gathering — user wanted: calm, focused, natural feel
- Anti-references: no aquarium store clichés, no gaming/neon aesthetics
- Redesigned entire app: dark navy theme → warm light theme (sand/driftwood tones, muted teal accent)
- Removed border-left stripes on cards (AI design antipattern)
- Cards now use background tint for status (sage green OK, amber warning, coral critical)
- Fixed 2-column grid layout bug (flex:1 → width:47%)

### Phase 4: Localization
- Full fr-FR localization of all strings
- Removed ammonia and nitrite parameters (user request)
- Added Salifert test timers: 30sec + 3min on nitrate log screen
- Later: full i18n with 15 languages (en, fr, es, pt, de, it, nl, ru, ja, ko, zh, ar, hi, tr, pl)
- Used i18n-js + expo-localization for auto device language detection
- date-fns locale mapping for localized date formatting

### Phase 5: App Icon
- Generated SVG-based icon: teal water drop on warm sand background
- Iterative design with user feedback:
  - Added thermometer graduations → user didn't like overlay approach
  - Split drop: left half outlined with graduations, right half solid fill
  - User sketched a draft → matched it: full outline, graduations from left, solid right half
  - Refined: graduation thickness, half-graduations, positioning
  - Removed ripples, adjusted graduation length
- Final icon: clean drop with horizontal graduation marks, no alpha channel

### Phase 6: iPhone Deployment
- Installed Xcode, configured xcode-select
- Built with `npx expo run:ios --device`
- Fixed: developer trust on iPhone, Xcode signing
- Fixed: `ENABLE_USER_SCRIPT_SANDBOXING = NO` in pbxproj (critical for React Native bundle script)
- Fixed: icon alpha channel (App Store rejection) → `sharp.flatten()`

### Phase 7: App Store Submission
- Created GitHub repo: nicolasbertrand-QARA/reef-monitor
- Set up GitHub Pages for privacy policy
- Created Apple Developer Program account ($99/yr)
- Generated App Store screenshots (1284x2778, no alpha)
- Wrote FR and EN App Store descriptions
- Configured App Store Connect: copyright, privacy, pricing (free), content rights
- Uploaded build via Xcode Archive → Distribute App

### Phase 8: Feature Iterations

**Trends screen improvements:**
- Added reading history list below chart with inline edit/delete
- KeyboardAvoidingView for editing
- Dosing events overlaid on trend charts (amber markers)
- Product→parameter mapping (dosingMap.ts) for relevant chart overlay

**Dashboard/Log merge:**
- Removed separate Log tab
- Tapping a card on Dashboard now opens ParamInput directly
- 3 tabs → Dashboard, Trends, Settings

**Corrections tab (formerly Dosing):**
- Dosing log moved from Settings modal to its own tab
- Tab renamed "Corrections" (localized in 15 languages)
- Added Water Change feature:
  - Percentage slider (0-100%, step 5)
  - Salt brand (free text)
  - Dilution (g/L)
  - All fields retain last entered values
  - Water changes appear as blue markers on ALL trend charts
  - Merged chronological list with dosing entries
- New DB table: water_changes (schema v2→v3)

**Additional parameters:**
- Added 7 new params: Ammonia, Nitrite, Potassium, Strontium, Iodine, Boron, Silicate
- All toggled off by default
- Settings: parameter visibility toggles (inline with threshold editor)
- Dashboard and Trends filter by visibility
- New DB table: parameter_visibility (schema v3)
- Fixed seeding for upgrades (seedDefaults runs on every launch)

**Salinity unit change:**
- Changed from ppt to specific gravity (e.g., 1.025)
- Step: 0.001, decimals: 3
- DB migration v4: updated thresholds from ppt to SG values

**CSV Import:**
- Added CSV import in Settings for backup restore
- Uses expo-document-picker
- Validates CSV format before importing

**Phosphate timer:**
- Added 30-sec Salifert timer on phosphate log screen

**Sparklines on dashboard cards:**
- Mini trend curves on each parameter card
- Initially angular (View-based line segments) → switched to smooth SVG cubic bezier curves (react-native-svg)
- Color: mid-grey in range, gradual yellow→red interpolation when out of range
- Full card width, compact height
- Layout: value → time-ago → sparkline (stacked vertically)

**Multi-parameter trend overlay:**
- Trends screen supports multiple selected parameters
- Tap to add, tap again to remove (at least one stays selected)
- Multi-mode: normalized y-axes, colored legend, smooth SVG curves
- Single-mode: full stats, range band, dosing markers, history list
- Each param gets a distinct color from a palette
- Chips show their line color when in multi-mode

**Nitrate step adjustment:**
- Changed from 1 ppm to 0.1 ppm step

### Phase 9: Code Cleanup
- Removed 15 unused template files (EditScreenInfo, Themed, ExternalLink, etc.)
- Removed empty components/ and constants/ directories
- Removed unused @react-native-community/cli dependency
- Fixed +not-found.tsx to use app theme directly
- Removed temporary files (screenshots, QR code, drafts)

### Phase 10: Documentation
- Created CLAUDE.md — comprehensive developer reference optimized for no-context Claude Code sessions
- Created README.md — concise human overview
- Critical rule: every code change must be reflected in CLAUDE.md

---

## Final App State

**Version:** 1.1.0 (build 2)
**Bundle ID:** com.nicolasbertrand.reefmonitor
**Tabs:** Mesures | Tendances | Corrections | Réglages
**Parameters:** 15 total (8 on by default, 7 off)
**Languages:** 15
**DB Schema:** v4 (5 tables)
**GitHub:** nicolasbertrand-QARA/reef-monitor
**App Store:** Submitted for review

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| No ORM | ~15 queries, not worth the abstraction |
| No charting library | Custom SVG via react-native-svg, no native dependency overhead |
| Flat readings table | Single table with parameter column, simpler queries |
| ISO 8601 date strings | Sort lexicographically in SQLite |
| i18n-js over react-i18next | Lighter, sufficient for flat key structure |
| Proxy for PARAMETERS | Re-evaluates i18n labels on access without restart |
| ENABLE_USER_SCRIPT_SANDBOXING=NO | Required for RN bundle script in Xcode build |
| sharp for icons/screenshots | SVG→PNG generation without external tools |

---

## Build Commands

```bash
# Development
npx expo start

# Build for iPhone
npx expo run:ios --device "NickPhone" --configuration Release

# App Store archive
# In Xcode: Product → Archive → Distribute App

# Regenerate icon
node scripts/generate-icon.mjs
cp assets/images/icon.png ios/reefmonitor/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png

# Resize screenshots for App Store (1284x2778, no alpha)
node -e "const sharp = require('sharp'); sharp('input.png').resize(1284, 2778, {fit:'cover'}).flatten({background:'#f5f2ed'}).png().toFile('output.png')"
```
