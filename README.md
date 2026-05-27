# Ludex

Ludex is a Windows-first desktop launcher for installed PC games. It will detect games from local launchers and manual `.exe` entries, display them in one library, launch local executables, track play sessions, and sync with a Laravel API.

Signature: `ピコ~`

## Phase 1 Scope

- Monorepo structure with `apps/desktop` and `backend/api`.
- Tauri + React + TypeScript + TailwindCSS desktop shell.
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

Docker is never a requirement for the final Ludex desktop user. It is only for backend development and deployment.

## Requirements

Development expects these tools locally when running everything outside Docker:

- Node.js 22+
- npm
- Rust toolchain for Tauri builds
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
npm run desktop:tauri
npm run backend:up
npm run backend:down
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

## Project Layout

```txt
apps/desktop    Tauri + React desktop application
backend/api     Laravel REST API
docs            Architecture, scanner, security, API and decision docs
docker          Backend development/deploy container files
```
