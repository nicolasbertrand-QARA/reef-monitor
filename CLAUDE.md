# Reef Monitor — Claude Code Instructions

## CRITICAL RULE

**Every change to this codebase MUST be reflected in this documentation.** If you add a screen, parameter, component, dependency, or i18n key — update this file before completing the task. If you remove something, remove it from this file too. Stale documentation is worse than no documentation.

---

## What This App Is

Reef Monitor is a mobile app for tracking nano reef aquarium water parameters. It targets reef keepers who use Salifert test kits to manually measure Ca, Alk, Mg, NO3, PO4, and other water chemistry values.

**Core value proposition:** Fast, wet-hands-friendly data entry with trend visualization and drift alerts. All data stays local on the device.

**Published on the Apple App Store** as "Reef Monitor" under bundle ID `com.nicolasbertrand.reefmonitor`, Apple Developer Team ID `MS3V6TWCPK`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 + React Native |
| Language | TypeScript (strict mode) |
| Routing | Expo Router (file-based, tab navigation) |
| Storage | SQLite via `expo-sqlite` (local only, no backend) |
| i18n | `i18n-js` + `expo-localization` (15 languages) |
| Date formatting | `date-fns` with per-locale imports |
| Slider | `@react-native-community/slider` |
| Haptics | `expo-haptics` |
| Ratings | `expo-store-review` — pre-prompt sheet then system prompt (`src/utils/reviewPrompt.ts`) |
| File sharing | `expo-sharing` + `expo-file-system` |
| File picking | `expo-document-picker` (CSV import) |
| Icons | `@expo/vector-icons` (FontAwesome) |
| Icon generation | `sharp` (devDependency, scripts only) |
| Tests | `jest` + `jest-expo` — unit tests for chemistry math, CSV, parsing (`npm test`) |

**No backend. No auth. No network calls. No state management library** (React context + hooks only).

---

## Project Structure

```
reef-monitor/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout: DB provider, splash, StatusBar
│   ├── +not-found.tsx            # 404 screen
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar config (4 tabs)
│   │   ├── index.tsx             # Dashboard: param cards, tap to log
│   │   ├── trends.tsx            # Charts, history list, dosing overlay
│   │   ├── dosing.tsx            # Dosing log: add/view doses
│   │   └── settings.tsx          # Thresholds, CSV export/import
├── src/
│   ├── components/
│   │   ├── ParamCard.tsx         # Dashboard card (value, status color, time-ago)
│   │   ├── ParamInput.tsx        # Log entry modal: timers first (physical test order), last-reading + target context, live status preview (value recolors past thresholds), stepper clamped to ParameterDef.min/max, status-graded save haptic (success/warning/error)
│   │   ├── RatioIndicator.tsx    # Alert banner for ratio/ionic balance issues
│   │   ├── StatusBadge.tsx       # Colored dot (ok/warning/critical)
│   │   ├── TestTimer.tsx         # Countdown timer for Salifert kits
│   │   ├── TimeRangeSelector.tsx # 7d/30d/90d/All toggle chips (labels i18n: trends.rangeDays/rangeAll)
│   │   ├── TrendChartHybrid.tsx  # Trends chart: mono (narrative + chart + stats) / multi (stacked sparklines, tap to focus)
│   │   ├── MiniSparkline.tsx     # Mini sparkline for dashboard cards (SVG)
│   │   └── TankSwitcher.tsx      # Header dropdown to switch active tank
│   ├── constants/
│   │   ├── colors.ts             # Theme colors + status colors
│   │   ├── dosingMap.ts          # Product → parameter mapping for chart overlay
│   │   └── parameters.ts        # Parameter definitions (units, steps, thresholds)
│   ├── db/
│   │   ├── database.ts           # SQLite init, table creation, seeding
│   │   └── queries.ts            # All SQL queries as typed async functions
│   ├── hooks/
│   │   ├── useDatabase.ts        # React context for SQLite connection
│   │   ├── useParameters.ts      # Hooks for latest readings + history (tank-scoped)
│   │   ├── useTank.ts            # TankContext provider + useTank hook
│   │   └── useVisibility.ts      # Hook for parameter visibility (tank-scoped)
│   ├── i18n/
│   │   ├── index.ts              # i18n setup, locale detection, date-fns locale map
│   │   └── locales/              # 15 locale files (en, fr, es, pt, de, it, nl, ru, ja, ko, zh, ar, hi, tr, pl)
│   ├── models/
│   │   └── types.ts              # TypeScript interfaces (Reading, Thresholds, DosingEntry, etc.)
│   └── utils/
│       ├── consumption.ts        # Alkalinity consumption rate (linear regression)
│       ├── csv.ts                # Backup CSV v2: RFC-4180 build/parse, v1-compatible
│       ├── number.ts             # parseLocaleFloat — comma-decimal-safe input parsing
│       ├── ratios.ts             # NO3:PO4 ratio, Ca/Alk/Mg balance, Alk swing detection
│       ├── thresholds.ts         # Status evaluation (ok/warning/critical)
│       └── __tests__/            # Unit tests (also src/constants/__tests__/)
├── scripts/
│   ├── generate-icon.mjs         # SVG → PNG icon generation (uses sharp)
│   └── generate-screenshots.mjs  # App Store screenshot generation (uses sharp)
├── appstore/                     # App Store assets (screenshots, descriptions)
├── docs/
│   └── index.html                # Privacy policy (hosted via GitHub Pages)
├── assets/
│   └── images/                   # icon.png, adaptive-icon.png, favicon.png, splash-icon.png
├── ios/                          # Native iOS project (generated by Expo prebuild)
├── app.json                      # Expo config
├── tsconfig.json                 # TypeScript config (strict, @/* path alias)
├── privacy-policy.html           # Privacy policy source
└── .impeccable.md                # Design context for the /impeccable skill
```

---

## Database Schema

SQLite database `reef-monitor.db`. Schema version tracked via `PRAGMA user_version` (currently v5).

**All data tables are tank-scoped** via `tank_id` foreign key.

Migrations + default seeding run inside a single `BEGIN IMMEDIATE` transaction (`initDatabase`): a kill mid-migration rolls back instead of leaving the schema half-rebuilt. Per-tank seeding (`seedDefaultsForAllTanks`, also called by `createTank`) respects `HIDDEN_BY_DEFAULT` so new tanks get the same curated 8 visible parameters as fresh installs.

### `tanks`
```sql
CREATE TABLE tanks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### `readings`
```sql
CREATE TABLE readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parameter TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  tank_id INTEGER NOT NULL,
  notes TEXT
);
CREATE INDEX idx_readings_tank_param_date ON readings(tank_id, parameter, recorded_at DESC);
```

### `thresholds`
```sql
CREATE TABLE thresholds (
  parameter TEXT NOT NULL,
  tank_id INTEGER NOT NULL,
  warning_low REAL, warning_high REAL,
  critical_low REAL, critical_high REAL,
  PRIMARY KEY (parameter, tank_id)
);
```

### `dosing_log`
```sql
CREATE TABLE dosing_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product TEXT NOT NULL,
  amount REAL NOT NULL,
  unit TEXT NOT NULL,
  dosed_at TEXT NOT NULL,
  tank_id INTEGER NOT NULL,
  notes TEXT
);
```

### `water_changes`
```sql
CREATE TABLE water_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  percentage REAL NOT NULL,
  salt_brand TEXT,
  dilution_gpl REAL,
  changed_at TEXT NOT NULL,
  tank_id INTEGER NOT NULL
);
```

### `parameter_visibility`
```sql
CREATE TABLE parameter_visibility (
  parameter TEXT NOT NULL,
  tank_id INTEGER NOT NULL,
  visible INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (parameter, tank_id)
);
```

### `app_settings`
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Stores active_tank_id
```

### `reminder_schedules`
```sql
CREATE TABLE reminder_schedules (
  parameter TEXT PRIMARY KEY,
  interval_hours INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_notified_at TEXT
);
```

---

## The 15 Monitored Parameters

8 visible by default:

| Key | Label (en) | Unit | Step | Default | Thresholds (warn/crit) |
|-----|-----------|------|------|---------|----------------------|
| temperature | Temperature | °C | 0.1 | 25.5 | 24–27.5 / 22–29 |
| salinity | Salinity | (density) | 0.001 | 1.025 | 1.023–1.027 / 1.020–1.030 |
| ph | pH | — | 0.05 | 8.2 | 7.8–8.5 / 7.6–8.6 |
| alkalinity | Alkalinity | dKH | 0.1 | 8.0 | 6.5–11 / 5.5–12.5 |
| calcium | Calcium | ppm | 5 | 420 | 380–480 / 350–500 |
| magnesium | Magnesium | ppm | 10 | 1350 | 1200–1450 / 1100–1500 |
| nitrate | Nitrate | ppm | 0.1 | 5 | 0.5–20 / 0–40 |
| phosphate | Phosphate | ppm | 0.01 | 0.05 | 0.01–0.15 / 0–0.25 |

7 hidden by default (`HIDDEN_BY_DEFAULT` in `src/db/database.ts`, applies to fresh installs AND newly created tanks), enabled per tank in Settings:

| Key | Label (en) | Unit | Step | Default | Thresholds (warn/crit) |
|-----|-----------|------|------|---------|----------------------|
| ammonia | Ammonia | ppm | 0.05 | 0 | high only 0.1 / 0.25 |
| nitrite | Nitrite | ppm | 0.05 | 0 | high only 0.1 / 0.25 |
| potassium | Potassium | ppm | 5 | 400 | 380–450 / 350–480 |
| strontium | Strontium | ppm | 0.5 | 9 | 7–12 / 5–14 |
| iodine | Iodine | ppm | 0.01 | 0.06 | 0.02–0.1 / 0.01–0.15 |
| boron | Boron | ppm | 0.5 | 5 | 3–7 / 2–9 |
| silicate | Silicate | ppm | 0.1 | 0 | high only 0.5 / 2 |

Parameters are defined in `src/constants/parameters.ts` (runtime key list: `PARAMETER_KEYS` in `src/models/types.ts`). Labels come from i18n.

---

## App Screens (4 tabs)

### Dashboard (`app/(tabs)/index.tsx`)
- 2-column grid of ParamCard components, grouped: "Water Chemistry" (6) + "Nutrients" (2)
- Each card shows: label, last value, status dot (green/amber/red), time-ago
- Alert banners at top for NO3:PO4 ratio, Ca/Alk/Mg ionic balance, and alkalinity swing (>1 dKH within 24h = warning, >1.5 = critical, via `detectAlkSwing`)
- Ratio/ionic banners only fire when the paired readings were taken within 72h of each other (stale pairings are noise)
- "Latest" reading = most recent `recorded_at` (NOT max id — imported backups can insert older rows with higher ids)
- First-run hint (`log.subtitle`) renders until the tank has at least one reading; empty cards show a plus-circle affordance
- Deep link `reefmonitor:///?log=<parameterKey>` opens the log sheet directly (Shortcuts/widgets later; screenshot pipeline today)
- Rating pre-prompt (`maybePromptReview`) fires only after an in-range save, 3+ distinct logging days, 120-day prompt cooldown, 60-day decline cooldown; state in `app_settings` (`review_last_prompt_at`, `review_declined_at`)
- **Tapping a card opens the ParamInput modal** to log a new reading (the card's threshold is passed in for live feedback)
- After saving, dashboard refreshes automatically

### Trends (`app/(tabs)/trends.tsx`)
- Horizontal parameter selector chips (tap to add/remove; multiselect enters compare mode)
- Time range toggle (7d / 30d / 90d / All)
- **TrendChartHybrid** (`src/components/TrendChartHybrid.tsx`):
  - **Mono mode** (1 param): narrative card (delta + status sentence + observed range; alk gets consumption rate folded into the narrative inline — fitted on the last 14 days only, signed: falling = consumption, rising = "check dosing" via `trends.consumptionInlineRising`) + chart (painted status zones, dashed warning thresholds, polyline with no intermediate dots, current-value marker, vertical dashed lines + colored dots at top for water changes / doses, 3 X-axis date labels) + stats row (current / min / avg / max)
  - **Multi mode** (2+ params): compare banner (count + Clear action) + status synthesis line (e.g. "2 on target, 1 at threshold") + stacked mini-cards per param (status dot, current value, full-width sparkline with own scale and target band, water-change vertical hairlines, delta over the range, "Detail ›" affordance — tap whole card to switch to mono for that param)
- History list (single param only): all readings reverse-chronological with inline edit (pencil) and delete (trash)
- KeyboardAvoidingView for inline editing

### Corrections (`app/(tabs)/dosing.tsx`)
- Two buttons: "Add Dose" and "Water Change"
- Add dose: product quick-pick chips + free text, amount, unit (ml/g/gouttes), notes. Amount must parse to > 0 (comma decimals accepted via `parseLocaleFloat`).
- Water change: percentage slider (0–100%, step 5; 0% not saveable), salt brand (free text), dilution (g/L). All fields retain last entered values.
- Merged chronological list of doses and water changes, sorted by date; each row has a trash icon with a confirm alert (`deleteDose` / `deleteWaterChange`)
- Water changes appear as blue markers on ALL trend charts; doses appear as amber markers on relevant charts only

### Settings (`app/(tabs)/settings.tsx`)
- **Tank management** (top section): list tanks with rename/delete, add new tank button. Delete alert offers "Export CSV first"; deleting the active tank re-points `active_tank_id` to the first remaining tank.
- **Parameter toggles + thresholds**: expandable per-parameter editor with visibility toggle. Threshold fields parse via `parseLocaleFloat` (comma decimals safe).
- **Unit picker**: when a parameter has multiple unit options, chips show in the expanded row to switch display unit
- Threshold editor displays/edits in chosen display unit; values are converted to canonical for storage
- Export as CSV (via `expo-sharing`) — full backup v2 of the active tank (see CSV Backup Format below), filename `reef-monitor-<tank-slug>-<yyyyMMdd>.csv`
- Import CSV backup (via `expo-document-picker`) — shows a preview alert (counts + target tank), then imports into the active tank with dedupe inside a transaction

---

## Unit System (Display vs Canonical)

Each parameter has a **canonical unit** (used for SQLite storage) and may have **multiple display units** the user can choose. All conversion happens at render and at save:

- **Storage**: always canonical (e.g. °C, SG, dKH, ppm NO3)
- **Display**: per-user choice, stored as `app_settings.unit_<paramKey>` (global, not per-tank)
- **Convert**: `getDisplayUnit(paramDef, prefs)` returns a `UnitOption` with `toCanonical` / `fromCanonical` functions, `step`, `decimals`, and `unit` label
- **`useUnitPrefs` hook**: load/refresh/set unit preferences; pass `prefs` to display components

Parameters with multiple units:
| Parameter | Canonical | Alternatives |
|-----------|-----------|--------------|
| temperature | °C | °F |
| salinity | SG (e.g. 1.025) | ppt (e.g. 35) |
| alkalinity | dKH | meq/L, ppm CaCO₃ |
| nitrate | ppm NO3 | ppm NO₃-N |
| phosphate | ppm | ppb |

CSV exports always use canonical units to remain importable across unit preference changes.

## CSV Backup Format (v2)

Built/parsed by `src/utils/csv.ts` (pure, fully unit-tested). RFC-4180 quoting throughout (commas, quotes, newlines in notes/salt brands survive round-trips). Numbers always use dot decimals in files.

```
# Reef Monitor backup v2
# tank: <name>            # exported_at: <ISO>
[readings]       parameter,value,unit,recorded_at,notes
[dosing]         product,amount,unit,dosed_at,notes
[water_changes]  percentage,salt_brand,dilution_gpl,changed_at
[thresholds]     parameter,warning_low,warning_high,critical_low,critical_high
```

- `parseBackupCsv` also accepts legacy v1 files (plain readings CSV, no section markers); columns are matched by header name, not position. Invalid rows are counted, not imported.
- `importBackup` (`src/db/queries.ts`) runs in a transaction, dedupes readings on (parameter, recorded_at, value), doses on (product, dosed_at, amount), water changes on (changed_at, percentage) — re-importing the same file is a no-op. Unknown parameter names are skipped. Thresholds are replaced, not counted as imported.

## Number Input Convention

**Never call `parseFloat` directly on a `TextInput` value.** Use `parseLocaleFloat` (`src/utils/number.ts`): most European locales show a comma on the iOS decimal pad, and `parseFloat("8,2")` silently returns 8. Applies to dose amounts, dilution, threshold fields, inline history edit, and any future numeric input.

## Multi-Tank Architecture

All data is scoped to the active tank via `tank_id`. A `TankContext` provider wraps the app and provides `activeTank`, `tanks`, `switchTank()`, and `refreshTanks()`.

- **TankSwitcher** component appears in the header of all tabs (only shown when 2+ tanks exist)
- Tapping it shows a dropdown to switch active tank
- Settings screen has a "Tanks" section at the top to add/rename/delete tanks
- When a new tank is created, default thresholds and visibility are seeded automatically
- Deleting a tank removes all its data (readings, doses, water changes, thresholds, visibility)
- The active tank ID is persisted in `app_settings` table

---

## Internationalization (i18n)

15 languages: `en`, `fr`, `es`, `pt`, `de`, `it`, `nl`, `ru`, `ja`, `ko`, `zh`, `ar`, `hi`, `tr`, `pl`.

- Setup: `src/i18n/index.ts` — auto-detects device language via `expo-localization`, falls back to `en`
- Locale files: `src/i18n/locales/{code}.ts` — flat object with nested keys
- Date formatting: `getDateLocale()` helper returns the matching `date-fns` locale
- Parameter labels: dynamically resolved via `i18n.t('params.{key}')` in `src/constants/parameters.ts`

### Adding a new i18n key
1. Add key + English value to `src/i18n/locales/en.ts`
2. Add translated value to ALL 14 other locale files
3. Use via `i18n.t('section.key')` or `i18n.t('section.key', { variable })` for interpolation

Conventions: the `a11y` section holds VoiceOver labels. Ratio/alert messages always pair the observation with a recommended action, and never use em dashes. `log.step` values include their locale-appropriate trailing colon ("Step:", "Pas :", "步进：").

### Adding a new language
1. Create `src/i18n/locales/{code}.ts` copying structure from `en.ts`
2. Import and register in `src/i18n/index.ts`
3. Add `date-fns` locale mapping in the `getDateLocale()` switch

---

## Dosing → Parameter Mapping

Defined in `src/constants/dosingMap.ts`. Maps product names (substring match) to the parameters they affect, so dosing markers appear on the right trend charts.

| Product contains | Shows on |
|-----------------|----------|
| kalkwasser | alkalinity, calcium, ph |
| all-for-reef | alkalinity, calcium, magnesium |
| ca, calcium | calcium |
| alk, kh | alkalinity |
| mg, magnes | magnesium |
| amino | nitrate |
| nourriture, coral food | nitrate, phosphate |
| (unknown product) | all charts |

---

## Salifert Test Timers

Built into `ParamInput.tsx`, shown at the bottom of the log entry modal:
- **Nitrate**: 30-sec shake timer + 3-min wait timer
- **Phosphate**: 30-sec shake timer

Timer component: `src/components/TestTimer.tsx` — countdown with progress bar and haptic feedback on completion. Remaining time is derived from a wall-clock deadline (`Date.now()` vs end time), never decremented: JS timers suspend while the app is backgrounded, and the timer resyncs instantly on foreground via an AppState listener.

---

## Design System

Defined in `src/constants/colors.ts`. Light theme with warm sand/driftwood tones.

| Token | Hex | Usage |
|-------|-----|-------|
| background | #f5f2ed | Screen backgrounds |
| surface | #ece8e1 | Section backgrounds, inactive chips |
| surfaceElevated | #ffffff | Cards, stats rows |
| text | #2d2a26 | Primary text |
| textSecondary | #6e685c | Labels, hints, time-ago (4.95:1 on background, WCAG AA) |
| accent | #47736f | Buttons, active chips, data lines (5.32:1 with white text, WCAG AA) |
| waterChange | #5a8fb8 | Water-change markers and log entries, everywhere |
| border | #ddd8d0 | Dividers |

Status colors come in two sets:
- `STATUS_COLORS` (ok `#6b9e7a` sage, warning `#c4943e` amber, critical `#c4644a` coral) for **dots, chart lines, fills**
- `STATUS_TEXT_COLORS` (ok `#3f7354`, warning `#8a6520`, critical `#9c4630`) for **text** — the base set fails WCAG AA as text on the tinted backgrounds; the text set passes ≥4.5:1 on tint, surface, and white. Never put STATUS_COLORS on text.

Cards use background tint for status (no border-left stripes). See `.impeccable.md` for full design context.

### Accessibility conventions
- Every interactive element has `accessibilityRole` (+ `accessibilityState` for selectable chips/options, `accessibilityLabel` for icon-only buttons).
- ParamCard composes a full VoiceOver label (param, value, status word from `a11y.status*`, time-ago) and shows a visible low/high word next to the status dot when out of range (non-color channel).
- Sub-44pt chips get `hitSlop={{ top: 8, bottom: 8 }}`.

---

## Building & Deploying

### Development (Expo Go)
```bash
npx expo start
```

### Build for iPhone (requires Xcode + device connected)
```bash
npx expo run:ios --device "NickPhone" --configuration Release
```

**Important:** The Xcode project has `ENABLE_USER_SCRIPT_SANDBOXING = NO` in `ios/reefmonitor.xcodeproj/project.pbxproj`. This is required for the React Native bundle script to work during build.

### App Store submission
1. In Xcode: Product → Archive → Distribute App
2. App Store Connect: appstoreconnect.apple.com
3. Privacy policy: https://nicolasbertrand-qara.github.io/reef-monitor/

### Regenerate app icon
```bash
node scripts/generate-icon.mjs
cp assets/images/icon.png ios/reefmonitor/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png
```

### Regenerate App Store screenshots (real captures)
```bash
node scripts/seed-demo-db.mjs /tmp/reef-monitor.db     # 90-day demo dataset
# Build for a simulator, copy the DB into the app container, then per screen:
#   xcrun simctl spawn <udid> defaults write com.nicolasbertrand.reefmonitor screenshotRoute /trends
#   xcrun simctl launch <udid> com.nicolasbertrand.reefmonitor -AppleLanguages "(fr)" -AppleLocale fr_FR
#   xcrun simctl io <udid> screenshot trends.png
node scripts/compose-screenshots.mjs /tmp/caps-en en   # → appstore/screenshots/v1.5/en/{6.7,6.5}/
node scripts/compose-screenshots.mjs /tmp/caps-fr fr
```
The app reads the `screenshotRoute` NSUserDefaults key on launch (root layout) and navigates there: this avoids the `simctl openurl` confirmation dialog. The old synthetic SVG pipeline is retired (it depicted nonexistent UI, a Guideline 2.3.3 risk).

---

## How To: Common Tasks

### Add a new parameter
1. Add key to `ParameterKey` union in `src/models/types.ts`
2. Add definition in `src/constants/parameters.ts` (unit, step, decimals, defaultValue, thresholds, group)
3. Add `params.{key}` translation to all 15 locale files
4. Default thresholds and reminder schedule are auto-seeded on first DB init
5. The parameter automatically appears on Dashboard, Trends, and Settings

### Add a Salifert timer to a parameter
1. In `src/components/ParamInput.tsx`, add a condition like `const isMyParam = paramDef.key === 'myParam'`
2. Add a timer block in the JSX (see nitrate/phosphate examples)
3. Add i18n keys for timer labels if needed

### Modify alert thresholds defaults
1. Edit `defaultThresholds` in `src/constants/parameters.ts`
2. Note: existing installations keep their DB values. Only new installs get the new defaults.

### Add a dosing product mapping
1. Add entry to `DOSING_PARAMETER_MAP` in `src/constants/dosingMap.ts`
2. Use lowercase substring matching

### Run the tests
```bash
npm test
```
Unit tests cover: unit conversions, NO3:PO4 / ionic balance / alk swing logic, consumption regression, status thresholds, CSV v1/v2 parsing and round-trips, locale-safe number parsing. Tests that import modules touching i18n must `jest.mock('@/src/i18n', ...)`.

### Bump version
1. Update `version` in `app.json`
2. Rebuild and archive

---

## Constraints & Decisions

- **No ORM**: Direct SQL via `expo-sqlite` async API. ~15 queries total, not worth the abstraction.
- **No charting library**: TrendChartHybrid renders zones, polylines, and markers with `react-native-svg` primitives. Simple, no extra native dependency. If complex charts are needed later, consider `victory-native`.
- **Flat readings table**: One table with a `parameter` column, not one table per param. Simpler queries, single index handles everything.
- **ISO 8601 strings for dates**: SQLite has no date type. ISO strings sort lexicographically.
- **Parameters are functions, not constants**: `getParameterList()` re-evaluates i18n labels on each call so language changes are reflected without app restart.
- **Salinity as specific gravity** (e.g., 1.025), not ppt. Matches what reef keepers read on refractometers.
