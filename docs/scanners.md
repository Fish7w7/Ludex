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

All path-taking IPC handlers validate argument type in the main process before calling scanner or launcher services.

## Future Epic Games Scanner

The Epic scanner should read manifests under ProgramData and extract install locations. This remains out of Phase 1.

## Future Xbox Scanner

The Xbox scanner needs additional Windows-specific research because Game Pass installations can use protected app/package locations.
