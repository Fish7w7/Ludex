# Ludex

Ludex is a Windows-first desktop launcher for installed PC games. It will detect games from local launchers and manual `.exe` entries, display them in one library, launch local executables, track play sessions, and sync with a Laravel API.

Signature: `ピコ~`

## Phase 1 Scope

- Monorepo structure with `apps/desktop` and `backend/api`.
- Desktop shell foundation with React + TypeScript + TailwindCSS.
- Laravel API skeleton prepared for Sanctum, PostgreSQL, Redis, queues, and REST routes.
- Docker Compose for backend development/deploy only.
- Scanner contracts and mock/stub strategy only. Real Steam/Epic/Xbox scanning stays out of Phase 1.
- Technical documentation, including decision records.

## Phase 2 Scope

- Sanctum auth endpoints.
- Platforms endpoint and seed data.
- Games CRUD.
- User game libraries for real local folders across multiple drives.
- User games sync with deduplication.
- Favorites.
- Play sessions and playtime totals.
- User tags.
- Scan logs.
- Feature tests for the main API flows.

## Phase 3 Scope

- Desktop API client using `VITE_API_URL`.
- Login, register, logout, and current-user loading from Laravel Sanctum tokens.
- Library dashboard backed by `/api/platforms` and `/api/user-games`.
- Game details, favorites, mock sync, and manual play-session testing.
- Real scanners, executable launching, and offline storage remain out of scope.

## Phase 4 Scope

- ManualScanner flow in the desktop app.
- User-confirmed `.exe` selection through the desktop native layer.
- Manual games synced through `/api/user-games/sync` with `source: manual`.
- Safe local launch using the saved `executable_path`.
- Manual play-session finish remains user-controlled.
- Steam, Epic, Xbox scanners and automatic process detection remain out of scope.

## Phase 5 Scope

- Real Windows SteamScanner in the Electron desktop.
- Steam installation discovery through safe Windows registry/common-path candidates.
- `libraryfolders.vdf` parsing for multiple Steam libraries across drives.
- `appmanifest_*.acf` parsing for installed Steam games.
- Steam sync through `/api/user-games/sync` with `external_id` set to the Steam `appid`.
- Steam scans do not execute games and do not guess a main executable aggressively.
- Epic, Xbox, secure token storage, offline mode, and automatic process detection remain out of scope.

## Electron Migration Scope

- Replaced Tauri/Rust native commands with Electron main/preload IPC.
- Preserved the current React UI, API client, auth state, sync mock, ManualScanner, SteamScanner, favorites, details, and play sessions.
- Moved native desktop code to `apps/desktop/electron`.
- Laravel API and Docker backend remain unchanged.

Docker is never a requirement for the final Ludex desktop user. It is only for backend development and deployment.

## Requirements

Development expects these tools locally when running everything outside Docker:

- Node.js 22+
- npm
- PHP 8.3+ and Composer for Laravel work outside Docker
- Docker Desktop for backend development services

Required PHP extensions for local backend work:

- `openssl`
- `curl`
- `mbstring`
- `fileinfo`
- `pdo_pgsql`
- `pdo_sqlite`
- `zip`

If `php --ini` reports no loaded `php.ini`, create one from your PHP distribution's `php.ini-development` or `php.ini-production`, set `extension_dir` to the PHP `ext` directory, and enable the extensions above.

## Common Commands

```bash
npm install
npm run desktop:dev
npm run desktop:test
npm run desktop:build
npm run desktop:dist
npm run backend:up
npm run backend:down
```

`desktop:dist` builds the Windows NSIS installer with electron-builder. Generated installer artifacts are written to `apps/desktop/release`; Vite renderer assets stay in `apps/desktop/dist`.

Desktop API URL:

```bash
VITE_API_URL=http://127.0.0.1:8000/api
```

For PowerShell:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

Run the Electron desktop shell when testing local file dialogs, Steam scan, or launching:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

Backend commands inside Docker:

```bash
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed
docker compose exec api php artisan test
```

Backend commands locally:

```bash
cd backend/api
composer install
php artisan migrate:fresh --seed
php artisan test
```

Health check:

```bash
curl http://127.0.0.1:8000/api/health
```

## Phase 3 Manual Test Flow

1. Start the backend:

```bash
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed
```

2. Start the desktop web shell:

```bash
VITE_API_URL=http://127.0.0.1:8000/api npm run desktop:dev
```

For PowerShell, set `$env:VITE_API_URL` before running the command.

3. Register or log in from the Ludex desktop.
4. Click `Sync mock` or `Importar jogos mockados`.
5. Confirm the library shows Counter-Strike 2, Hades, and Epic Seven.
6. Open details, favorite/unfavorite a game, then start and finish a play session.

## Phase 4 Manual Scanner Test Flow

1. Start the backend and seed platforms:

```bash
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed
```

2. Start Electron:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

3. Register or log in.
4. Click `Adicionar jogo manual`.
5. Click `Selecionar .exe` and choose a local Windows `.exe`.
6. Confirm or edit the game name, then click `Adicionar à biblioteca`.
7. Open the game details and use `Jogar` to launch it.
8. Use `Finalizar` to close the manual play session in Ludex.
9. Use `Abrir pasta` to open the saved install folder.

## Phase 5 Steam Scanner Test Flow

1. Start the backend and seed platforms:

```bash
docker compose up -d --build
docker compose exec api composer install
docker compose exec api php artisan migrate:fresh --seed
```

2. Start Electron with the local API URL:

```powershell
$env:VITE_API_URL="http://127.0.0.1:8000/api"
npm run desktop:dev
```

3. Register or log in.
4. Open `Scanners`.
5. Click `Escanear Steam`.
6. Review the detected Steam libraries and games.
7. Select the games to import and click `Importar selecionados`.
8. Return to the library and confirm the imported games appear.

The SteamScanner reads Steam metadata files only. It does not launch Steam games during scanning.

## Project Layout

```txt
apps/desktop    Electron + React desktop application
backend/api     Laravel REST API
docs            Architecture, scanner, security, API and decision docs
docker          Backend development/deploy container files
```
