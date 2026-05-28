# Security Notes

## Local Execution

Ludex must only launch executables that were detected locally or selected by the user. The API must never send commands for the desktop to execute.

## Path Safety

The desktop should validate executable paths before launching:

- Path exists.
- Path points to a file.
- File has an executable extension on Windows.
- Path came from a trusted local scanner or manual user selection.
- No shell interpolation.
- URLs are rejected.
- UNC/network paths are rejected in the current MVP.

## Manual Launch Safety

Phase 4 uses Tauri commands to select, validate, reveal, and launch local paths. The launch command uses Rust process APIs directly with the executable path as the program and the executable folder as the working directory. Ludex does not execute `launch_command` from the API.

## Steam Scanner Safety

Phase 5 SteamScanner only reads known Steam metadata files:

- `libraryfolders.vdf`
- `appmanifest_*.acf`

It does not scan whole disks for executables, does not execute anything during scan, and ignores missing library paths. Steam `appid` values are used as external IDs for sync. Any `steam://rungameid/{appid}` value is treated as metadata/future launch context only, not as a trusted command from the API.

## API Safety

The Laravel API should enforce:

- Sanctum authentication.
- Rate limiting.
- Form request validation.
- Ownership checks on user resources.
- No cross-user access to library, favorites, tags, sessions, or scan logs.

## Sync Safety

Sync payloads should be treated as untrusted input. Server-side IDs, ownership, timestamps, and conflict decisions must be validated on the API.
