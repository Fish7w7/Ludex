# Ludex `ピコ~`

> Windows-first desktop game launcher — one library, multiple platforms.

Ludex is a desktop launcher for PC games. It detects installed games from local launchers, supports manual `.exe` entries, displays everything in a unified library, tracks play sessions, and syncs with a Laravel REST API.

The project currently focuses on a **Windows-first real-flow MVP** using Electron + React on the desktop and Laravel + PostgreSQL on the backend.

---

## Status

Ludex is currently in a **stable pause-ready MVP state**.

Implemented:

* Electron + React desktop app
* Laravel REST API
* PostgreSQL backend via Docker
* Login/register/logout with Laravel Sanctum
* Real API-backed library
* Manual `.exe` game import
* Steam scanner
* Epic Games scanner
* Favorites
* Game details panel
* Play sessions
* Open game folder
* Launch local `.exe` when available
* Design preview mode
* Electron NSIS build
* Test coverage for backend and desktop

Not implemented yet:

* Xbox/Game Pass scanner
* Secure token storage
* Offline/local cache
* Automatic game process tracking
* Real cover/metadata integration
* Final app icon/installer branding

---

## Table of Contents

* [Project Layout](#project-layout)
* [Stack](#stack)
* [Requirements](#requirements)
* [Quick Start](#quick-start)
* [Common Commands](#common-commands)
* [Environment Variables](#environment-variables)
* [Real End-to-End Test Flow](#real-end-to-end-test-flow)
* [Manual Scanner](#manual-scanner)
* [Steam Scanner](#steam-scanner)
* [Epic Scanner](#epic-scanner)
* [Design Preview Mode](#design-preview-mode)
* [Testing](#testing)
* [Build](#build)
* [Known Issues](#known-issues)
* [Roadmap](#roadmap)
* [Project History](#project-history)

---

## Project Layout

```txt
apps/desktop    Electron + React desktop application
backend/api     Laravel REST API
docs            Architecture, scanner, security, API, status, and decision docs
docker          Backend development/deploy container files
```

---

## Stack

### Desktop

* Electron
* React
* TypeScript
* Vite
* TailwindCSS
* Electron Builder
* Vitest

### Backend

* Laravel
* Laravel Sanctum
* PostgreSQL
* Redis
* Docker Compose
* PHPUnit/Pest-compatible Laravel tests

### Platform

* Windows-first
* Docker is used for backend development services only
* End users should not need Docker

---

## Requirements

### Desktop

| Tool    | Version           |
| ------- | ----------------- |
| Node.js | 22+               |
| npm     | bundled with Node |

### Backend outside Docker

| Tool           | Version / Notes                                    |
| -------------- | -------------------------------------------------- |
| PHP            | 8.3+                                               |
| Composer       | latest stable                                      |
| Docker Desktop | required for PostgreSQL/Redis development services |

Required PHP extensions:

```txt
openssl
curl
mbstring
fileinfo
pdo_pgsql
pdo_sqlite
zip
```

If `php --ini` reports no loaded `php.ini`, copy your PHP distribution's `php.ini-development` or `php.ini-production`, rename it to `php.ini`, set `extension_dir` to the PHP `ext` directory, and enable the extensions above.

Docker is **not** required for Ludex end users. It is only used for backend development/deployment.

---

## Quick Start

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed
```

Set the API URL.

PowerShell:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
```

Bash:

```bash
export VITE_API_URL=http://127.0.0.1:8000/api
```

Start the desktop app:

```bash
npm run desktop:dev
```

Health check:

```bash
curl http://127.0.0.1:8000/api/health
```

---

## Common Commands

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm install`           | Install workspace dependencies       |
| `npm run desktop:dev`   | Start Electron + Vite in development |
| `npm run desktop:test`  | Run desktop tests                    |
| `npm run desktop:build` | Build the desktop renderer           |
| `npm run desktop:dist`  | Package the Windows NSIS installer   |
| `npm run backend:up`    | Start backend Docker services        |
| `npm run backend:down`  | Stop backend Docker services         |

Electron output:

```txt
apps/desktop/dist
```

Windows installer output:

```txt
apps/desktop/dist/release
```

---

## Environment Variables

### Required for desktop API access

```txt
VITE_API_URL=http://127.0.0.1:8000/api
```

### Optional design preview mode

```txt
VITE_DESIGN_PREVIEW=true
```

Use `VITE_DESIGN_PREVIEW=true` only when you want to preview the UI with fake visual entries. It does not sync data and does not write to PostgreSQL.

---

## Real End-to-End Test Flow

Use this flow to test Ludex with real API data and real local game paths.

Do **not** enable `VITE_DESIGN_PREVIEW`.

PowerShell:

```powershell
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed

$env:VITE_API_URL="http://127.0.0.1:8000/api"
Remove-Item Env:\VITE_DESIGN_PREVIEW -ErrorAction SilentlyContinue

npm run desktop:dev
```

Then, inside the app:

1. Register or log in.
2. Add a real local `.exe` with **Adicionar jogo**.
3. Open **Scanner** and run **Escanear Steam** if Steam is installed.
4. Open **Scanner** and run **Escanear Epic Games** if Epic Games Launcher is installed.
5. Import selected games.
6. Confirm the games appear in **Library** from `/api/user-games`.
7. Open game details.
8. Favorite/unfavorite a game.
9. Use **Abrir pasta**.
10. Use **Jogar** only when `executable_path` points to a valid local `.exe`.

Expected platform slugs used by sync:

```txt
steam
epic
manual
xbox
```

---

## Manual Scanner

The Manual Scanner lets the user add a local Windows `.exe` manually.

Run:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

Flow:

1. Register or log in.
2. Click **Adicionar jogo** or **Adicionar primeiro jogo**.
3. Click **Selecionar .exe**.
4. Choose a local Windows `.exe`.
5. Confirm or edit the game name.
6. Click **Adicionar à biblioteca**.
7. Open the game details.
8. Use **Jogar** to launch it.
9. Use **Finalizar sessão** to close the manual play session.
10. Use **Abrir pasta** to open the saved install folder.

Security notes:

* Only local `.exe` files are accepted.
* The app does not execute arbitrary commands from the API.
* Manual execution is user-confirmed.

---

## Steam Scanner

The Steam Scanner detects installed Steam games by reading Steam metadata files.

It supports multiple Steam libraries across drives such as:

```txt
C:
D:
E:
G:
```

It reads:

```txt
libraryfolders.vdf
appmanifest_*.acf
```

Run:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

Flow:

1. Register or log in.
2. Open **Scanner**.
3. Click **Escanear Steam**.
4. Review detected Steam libraries and games.
5. Select games.
6. Click **Importar selecionados**.
7. Return to **Library** and confirm the imported games appear.

Security notes:

* SteamScanner only reads local Steam metadata files.
* It does not execute Steam games during scanning.
* Steam protocol launch commands are not treated as trusted commands.

---

## Epic Scanner

The Epic Scanner detects installed Epic Games by reading local `.item` manifest files.

Default manifest path:

```txt
C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests
```

It uses `InstallLocation` from the manifest, so games can be installed on any drive.

Run:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

Flow:

1. Register or log in.
2. Open **Scanner**.
3. Click **Escanear Epic Games**.
4. Review detected Epic manifests and games.
5. Select games.
6. Click **Importar Epic**.
7. Return to **Library** and confirm the imported games appear.

Security notes:

* EpicScanner only reads local `.item` manifests.
* `LaunchCommand` is not trusted or executed.
* `LaunchExecutable` is only normalized when it safely resolves inside `InstallLocation`.
* Only valid local `.exe` paths are accepted.

---

## Design Preview Mode

Design Preview Mode fills the UI with visual-only entries so the launcher layout can be reviewed without touching the backend database.

PowerShell:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
$env:VITE_DESIGN_PREVIEW="true"
npm run desktop:dev
```

Preview entries include:

* Counter-Strike 2
* Hades
* Fortnite
* Epic Seven
* Need for Speed Heat
* Hollow Knight
* Genshin Impact
* Sekiro

Design preview behavior:

* No sync calls
* No PostgreSQL writes
* No real game launch
* No backend mutation
* Visual feedback only

Disable preview:

```powershell
Remove-Item Env:\VITE_DESIGN_PREVIEW -ErrorAction SilentlyContinue
```

---

## Testing

Desktop tests:

```bash
npm run desktop:test
```

Desktop build:

```bash
npm run desktop:build
```

Desktop installer:

```bash
npm run desktop:dist
```

Backend tests locally:

```bash
cd backend/api
php artisan test
```

Backend tests in Docker:

```bash
docker compose exec -T api php artisan test
```

Recommended validation before pausing or committing:

```bash
npm run desktop:test
npm run desktop:build
docker compose exec -T api php artisan test
```

---

## Build

Build renderer:

```bash
npm run desktop:build
```

Generate Windows installer:

```bash
npm run desktop:dist
```

Output:

```txt
apps/desktop/dist/release
```

Known note:

If `desktop:dist` fails with an `EPERM` error related to `esbuild`, try closing any running Electron/Vite processes and rerun the command outside sandboxed environments.

---

## Known Issues

* Xbox/Game Pass scanner is not implemented yet.
* Secure token storage is still pending.
* Offline/local cache is still pending.
* Automatic game process closing detection is not implemented.
* External cover/metadata fetching is not implemented.
* Final app icon and installer branding are still placeholders.
* Steam and Epic scanning depend on local launcher metadata existing on the user's PC.
* Some games may not expose a reliable `.exe` path through launcher metadata.
* UI is functional but still subject to visual refinement.

---

## Roadmap

### High Priority

* Secure storage for auth token
* Automatic process tracking for launched games
* Test installer on a clean Windows machine
* Improve real-flow error handling
* Final app icon and installer metadata

### Medium Priority

* Local offline cache
* External metadata/covers
* Better game search/filter/sorting
* Better library empty states
* More polished installer flow

### Low Priority

* Xbox/Game Pass scanner
* Themes
* Extra animations
* Public profile/social features
* Cloud sync improvements

---

## Project History

### Phase 1 — Foundation

Monorepo scaffold with `apps/desktop` and `backend/api`, React + TypeScript + TailwindCSS shell, Laravel API skeleton, Sanctum/PostgreSQL/Redis backend foundation, Docker Compose, scanner contracts, and docs.

### Phase 2 — Core API

Sanctum auth, platform seed data, Games CRUD, user game libraries, sync with deduplication, favorites, play sessions, playtime totals, tags, scan logs, and feature tests.

### Phase 3 — Desktop API Client

Electron/React desktop connected to Laravel API with login/register/logout, current-user loading, library dashboard, game details, favorites, mock sync, and manual play-session testing.

### Phase 4 — Manual Scanner

Manual `.exe` selection through Electron native file dialog, sync through `/api/user-games/sync`, local launch from saved `executable_path`, and user-controlled play-session finish.

### Phase 5 — Steam Scanner

Steam discovery through registry/common paths, `libraryfolders.vdf` parsing, multi-drive library support, `appmanifest_*.acf` parsing, and sync with `source: steam`.

### Phase 6 — Epic Scanner

Epic manifest discovery under `C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests`, `.item` JSON parsing, install paths from `InstallLocation`, safe executable normalization, and sync with `source: epic`.

### Electron Migration

Replaced Tauri/Rust native commands with Electron main/preload IPC. Laravel API and Docker backend remained unchanged.

### UX/UI Polish

Removed default Electron menu, simplified titlebar to `Ludex`, reorganized React UI into focused layout/auth/library/scanner/settings/modal/primitive components, added dark neon identity, sidebar background, library grid, scanner cards, and detail panel.

### Real-Flow Stabilization

Reduced mock dependency, moved mock sync to development-only flow, fixed platform slug mismatch, normalized sync platforms, improved import refresh, and ensured the main library uses real API data unless `VITE_DESIGN_PREVIEW=true`.
