# Scanner Strategy

Scanners use a strategy pattern so each platform can detect games independently while returning a normalized result.

## Contracts

- `GameScannerInterface`
- `ScannerManager`
- `SteamScanner`
- `EpicGamesScanner`
- `XboxScanner`
- `ManualScanner`

## Phase 1

Phase 1 uses mock/stub scanners only. No real launcher manifests are parsed.

## Future Steam Scanner

The Steam scanner should:

- Detect Steam installation/library roots without assuming fixed drives.
- Parse `libraryfolders.vdf`.
- Parse `appmanifest_*.acf`.
- Return real install directories and executable candidates when available.

## Future Epic Games Scanner

The Epic scanner should read manifests under ProgramData and extract install locations. This remains out of Phase 1.

## Future Xbox Scanner

The Xbox scanner needs additional Windows-specific research because Game Pass installations can use protected app/package locations.

