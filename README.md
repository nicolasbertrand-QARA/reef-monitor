# Reef Monitor

Nano reef aquarium water parameter tracking app for iOS. Built with Expo + React Native + TypeScript.

## Features

- **15 parameters**: Temperature, Salinity, pH, Alkalinity, Calcium, Magnesium, Nitrate, Phosphate visible by default; Ammonia, Nitrite, Potassium, Strontium, Iodine, Boron, Silicate opt-in per tank
- **Quick logging** with stepper input designed for wet hands
- **Trend charts** with target range bands and dosing event overlay
- **Smart alerts**: configurable thresholds, NO3:PO4 ratio, Ca/Alk/Mg ionic balance, Alk consumption rate (signed, 14-day window), Alk swing within 24h
- **Dosing log** correlated with parameter trends (entries deletable with confirmation)
- **Salifert test timers** (30s / 3min for NO3, 30s for PO4) — wall-clock based, survive backgrounding
- **Full CSV backup**: readings, doses, water changes, thresholds; import preview + dedupe, legacy v1 files accepted
- **15 languages**, auto-detected from device; comma-decimal input safe in all locales
- **100% offline**, all data stored locally in SQLite
- **Unit-tested chemistry**: conversions, ratios, consumption regression, CSV round-trips (`npm test`)

## Quick Start

```bash
npm install
npx expo start
```

## Build for iPhone

```bash
npx expo run:ios --device --configuration Release
```

## App Store

Published as "Reef Monitor" — `com.nicolasbertrand.reefmonitor`

## Contributing

See `CLAUDE.md` for detailed architecture, file structure, and how-to guides. **Any code change must be reflected in CLAUDE.md.**

## License

MIT
