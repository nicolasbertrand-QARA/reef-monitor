# Reef Monitor

Nano reef aquarium water parameter tracking app for iOS. Built with Expo + React Native + TypeScript.

## Features

- **8 parameters**: Temperature, Salinity, pH, Alkalinity, Calcium, Magnesium, Nitrate, Phosphate
- **Quick logging** with stepper input designed for wet hands
- **Trend charts** with target range bands and dosing event overlay
- **Smart alerts**: configurable thresholds, NO3:PO4 ratio, Ca/Alk/Mg ionic balance, Alk consumption rate
- **Dosing log** correlated with parameter trends
- **Salifert test timers** (30s / 3min for NO3, 30s for PO4)
- **CSV export/import** for backup and analysis
- **15 languages**, auto-detected from device
- **100% offline**, all data stored locally in SQLite

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
