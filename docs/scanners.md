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

## Phase 4 ManualScanner

ManualScanner is implemented as an explicit desktop flow:

- The user clicks `Adicionar jogo manual`.
- The user selects or confirms a local Windows `.exe`.
- Electron validates the path exists, is a file, is local, and ends in `.exe`.
- The desktop syncs the game through `/api/user-games/sync` with `source: manual`.
- The backend deduplicates manual games by `user_id + executable_path` when no `external_id` exists.

ManualScanner does not scan the PC, enumerate folders, or auto-add executables.

## Phase 5 SteamScanner

SteamScanner is implemented in the Electron main process for Windows.

It:

- Detects candidate Steam roots from the Windows registry and common install paths.
- Reads `steamapps\libraryfolders.vdf` from the Steam root.
- Discovers multiple Steam libraries without assuming fixed drive letters.
- Ignores missing or disconnected libraries.
- Reads `steamapps\appmanifest_*.acf` for each valid library.
- Extracts `appid`, `name`, `installdir`, and `StateFlags` when available.
- Normalizes each game with `platform: steam`, `source: steam`, and `external_id` set to the Steam `appid`.

Steam install paths are built as:

```txt
{library_path}\steamapps\common\{installdir}
```

Phase 5 does not try to guess the primary executable. Steam games may include a metadata-only launch hint in the format `steam://rungameid/{appid}`, but the desktop does not execute this during scan and does not send it as a trusted top-level command to the API.

The scanner returns friendly errors when Steam is missing, `libraryfolders.vdf` is missing or unreadable, no libraries are valid, or no installed manifests are found.

## Electron IPC Mapping

- `select_manual_executable`: `dialog.showOpenDialog` with an `.exe` filter.
- `validate_executable_path`: `fs.stat`/`path` validation in the main process.
- `launch_game`: `child_process.spawn` with `shell: false` after executable validation.
- `reveal_game_in_folder`: `shell.showItemInFolder` for files or `shell.openPath` for folders.
- `scan_steam_games`: TypeScript SteamScanner in the main process.
- `scan_epic_games`: TypeScript EpicScanner in the main process.

All path-taking IPC handlers validate argument type in the main process before calling scanner or launcher services.

## Phase 6 EpicScanner

EpicScanner is implemented in the Electron main process for Windows.

It:

- Looks for Epic manifests under `C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests`.
- Reads `.item` JSON manifest files.
- Ignores corrupt manifests.
- Ignores manifests without a valid existing `InstallLocation`.
- Uses `InstallLocation` from the manifest instead of assuming games are on `C:`.
- Normalizes each game with `platform: epic`, `source: epic`, and `external_id` set to `CatalogItemId` when available, otherwise `AppName`.

Epic executable paths are only kept when `LaunchExecutable` can be safely resolved:

- relative to `InstallLocation`, or absolute but still inside `InstallLocation`;
- not a URL or UNC path;
- `.exe` extension;
- existing file.

The scanner does not execute anything, does not trust `LaunchCommand`, and does not scan arbitrary drives. If `LaunchExecutable` is absent or unsafe, `executable_path` stays `null` and the game can still be imported for library tracking.

## Future Xbox Scanner

The Xbox scanner needs additional Windows-specific research because Game Pass installations can use protected app/package locations.
