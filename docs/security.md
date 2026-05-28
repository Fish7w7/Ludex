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

## Electron IPC Safety

The desktop uses Electron with `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and a small preload bridge exposed as `window.ludexDesktop`.

Only explicit IPC methods are exposed:

- select manual `.exe`;
- validate executable path;
- launch validated executable;
- reveal validated file/folder;
- scan Steam metadata.

The renderer does not receive Node.js filesystem or process access.

IPC path arguments are checked for type before they reach filesystem or process services. Non-string path arguments are rejected in the main process.

## Manual Launch Safety

Manual launch uses Electron main-process services to select, validate, reveal, and launch local paths. The launch service uses `child_process.spawn(executable_path, [], { shell: false })` with the executable folder as the working directory. Ludex does not execute `launch_command` from the API.

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

## NPM Audit

Post-migration audit initially reported high-severity issues in direct `electron` and `electron-builder` dependencies plus transitive build tooling (`tar`, `node-gyp`, `app-builder-lib`). These affected the Electron runtime and packaging toolchain.

The fix was a deliberate dependency update, not `npm audit fix`: `electron` is pinned to `42.3.0` and `electron-builder` is updated to `26.8.1`. After the update, `npm audit` reports zero vulnerabilities.
