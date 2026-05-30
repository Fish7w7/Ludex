# Ludex `ピコ~`

> Windows-first desktop launcher for PC games — one library, every platform.

Ludex detects installed games from local launchers and manual `.exe` entries, displays them in a unified library, tracks play sessions, and syncs with a Laravel REST API.

---

## Table of Contents

- [Project Layout](#project-layout)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Common Commands](#common-commands)
- [Phases](#phases)
- [Manual Test Flows](#manual-test-flows)
- [Design Preview Mode](#design-preview-mode)

---

## Project Layout

```
apps/desktop    Electron + React desktop application
backend/api     Laravel REST API
docs            Architecture, scanner, security, API, and decision docs
docker          Backend development/deploy container files
```

---

## Requirements

### Desktop

| Tool | Version |
|---|---|
| Node.js | 22+ |
| npm | bundled with Node |

### Backend (outside Docker)

| Tool | Notes |
|---|---|
| PHP | 8.3+ |
| Composer | latest stable |
| Docker Desktop | for backend services |

**Required PHP extensions:** `openssl`, `curl`, `mbstring`, `fileinfo`, `pdo_pgsql`, `pdo_sqlite`, `zip`

> If `php --ini` reports no loaded `php.ini`, copy your PHP distribution's `php.ini-development` or `php.ini-production`, set `extension_dir` to the PHP `ext` directory, and enable the extensions above.

Docker is **never** a requirement for end users. It is only used for backend development and deployment.

---

## Quick Start

```bash
# Install all dependencies
npm install

# Set the API URL (bash)
export VITE_API_URL=http://127.0.0.1:8000/api

# Set the API URL (PowerShell)
$env:VITE_API_URL="http://127.0.0.1:8000/api"

# Start the desktop shell
npm run desktop:dev
```

Spin up the backend with Docker:

```bash
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed
```

Health check:

```bash
curl http://127.0.0.1:8000/api/health
```

---

## Common Commands

| Command | Description |
|---|---|
| `npm install` | Install all workspace dependencies |
| `npm run desktop:dev` | Start the Electron + Vite dev server |
| `npm run desktop:test` | Run desktop tests |
| `npm run desktop:build` | Build the renderer |
| `npm run desktop:dist` | Package the Windows NSIS installer |
| `npm run backend:up` | Start backend Docker services |
| `npm run backend:down` | Stop backend Docker services |

`desktop:dist` produces the Windows installer under `apps/desktop/dist/release`. Vite renderer assets are written to `apps/desktop/dist`.

---

## Phases

### Phase 1 — Foundation
Monorepo scaffold (`apps/desktop` / `backend/api`), React + TypeScript + TailwindCSS shell, Laravel API skeleton with Sanctum/PostgreSQL/Redis/queues, Docker Compose for the backend, scanner contracts and stubs only.

### Phase 2 — Core API
Sanctum auth, platforms endpoint + seed data, Games CRUD, user game libraries (multi-drive), sync with deduplication, favorites, play sessions, playtime totals, user tags, scan logs, and feature tests.

### Phase 3 — Desktop API Client
Login/register/logout, current-user loading via Sanctum tokens, library dashboard backed by `/api/platforms` and `/api/user-games`, game details, favorites, mock sync, and manual play-session testing.

### Phase 4 — Manual Scanner
`.exe` selection through Electron's native file dialog, sync through `/api/user-games/sync` with `source: manual`, local launch from the saved `executable_path`, user-controlled play-session finish.

### Phase 5 — Steam Scanner
Windows registry + common-path Steam discovery, `libraryfolders.vdf` parsing across drives, `appmanifest_*.acf` parsing for installed games, sync with `source: steam` and `external_id` set to the Steam `appid`. No game execution during scanning.

### Phase 6 — Epic Scanner
Manifest discovery under `C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests`, `.item` JSON parsing, install paths from `InstallLocation` (any drive), safe `LaunchExecutable` normalization only when inside `InstallLocation`, sync with `source: epic`. No game execution and no free-form launch commands during scanning.

### UX/UI Polish
Removed default Electron app menu, window title set to `Ludex`, React UI reorganized into focused layout/auth/library/scanner/settings/modal/primitive components. Dark neon identity applied to all screens. No new backend features or scanners added.

### Electron Migration
Replaced Tauri/Rust native commands with Electron main/preload IPC. Laravel API and Docker backend unchanged.

---

## Manual Test Flows

### Real End-to-End Flow

Use this flow when you want to test Ludex with real API data and real local game paths. Do **not** enable `VITE_DESIGN_PREVIEW`.

```powershell
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed

$env:VITE_API_URL="http://127.0.0.1:8000/api"
Remove-Item Env:\VITE_DESIGN_PREVIEW -ErrorAction SilentlyContinue
npm run desktop:dev
```

1. Register or log in.
2. Add a real local `.exe` with **Adicionar jogo**.
3. Open **Scanner** and run **Escanear Steam** if Steam is installed.
4. Open **Scanner** and run **Escanear Epic Games** if Epic Games Launcher is installed.
5. Import selected games.
6. Confirm the games appear in **Library** from `/api/user-games`.
7. Open details, favorite/unfavorite, use **Abrir pasta**, and use **Jogar** only when `executable_path` points to a valid local `.exe`.

Seeded platform keys expected by sync are `steam`, `epic`, `manual`, and `xbox`.

### Phase 3 — Mock Library

This is a development helper only. The real library uses API data from `/api/user-games`.

```bash
# 1. Start the backend
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed

# 2. Start the desktop
export VITE_API_URL=http://127.0.0.1:8000/api
npm run desktop:dev
```

1. Register or log in.
2. Click **Dev sync mock**.
3. Confirm the library shows Counter-Strike 2, Hades, and Epic Seven.
4. Open a game, favorite/unfavorite it, then start and finish a play session.

---

### Phase 4 — Manual Scanner

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

1. Register or log in.
2. Click **Adicionar jogo** or **Adicionar primeiro jogo**.
3. Click **Selecionar .exe** and choose a local Windows `.exe`.
4. Confirm or edit the game name, then click **Adicionar à biblioteca**.
5. Open the game and use **Jogar** to launch it.
6. Use **Finalizar** to close the play session.
7. Use **Abrir pasta** to open the saved install folder.

---

### Phase 5 — Steam Scanner

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

1. Register or log in.
2. Open **Scanners** → **Escanear Steam**.
3. Review the detected Steam libraries and games.
4. Select games to import and click **Importar selecionados**.
5. Return to the library and confirm the imported games appear.

> The SteamScanner reads Steam metadata files only — it does not launch Steam games during scanning.

---

### Phase 6 — Epic Scanner

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

1. Register or log in.
2. Open **Scanner** → **Escanear Epic Games**.
3. Review the detected Epic manifests and games.
4. Select games to import and click **Importar Epic**.
5. Return to the library and confirm the imported games appear.

> The EpicScanner reads local `.item` manifests only — it does not execute games and does not use `LaunchCommand` as a trusted command.

---

## Design Preview Mode

Validate the Ludex UI with a filled library without touching the backend database.

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
$env:VITE_DESIGN_PREVIEW="true"
npm run desktop:dev
```

Renders visual-only entries for Counter-Strike 2, Hades, Fortnite, Epic Seven, Need for Speed Heat, Hollow Knight, Genshin Impact, and Sekiro. No sync calls, no PostgreSQL writes, and launch/favorite actions give local visual feedback only.
