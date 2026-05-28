# Technical Decisions

This file records project decisions so Phase 1 stays clean and future work has context.

## 2026-05-27: Authentication

Use Laravel Sanctum for MVP authentication.

Rationale: Sanctum is lighter than Passport for first-party API auth and fits the current MVP. Passport is intentionally out of scope.

## 2026-05-27: Desktop Storage

Do not implement desktop local storage in Phase 1.

Rationale: The architecture should prepare for offline/sync, but Phase 1 prioritizes project foundation, documentation, and clean boundaries.

## 2026-05-27: Platform Focus

Focus the MVP on Windows first.

Rationale: The first scanner and executable-launching work depends heavily on Windows paths, launchers, and process behavior.

## 2026-05-27: Docker Scope

Docker is only for backend development and deployment.

Rationale: The final Ludex desktop user must not be required to install Docker.

## 2026-05-27: Scanner Scope

Phase 1 includes scanner interfaces, stubs, and mock data only. Real Steam, Epic Games, and Xbox scanning are not part of Phase 1.

Rationale: This keeps the foundation stable before adding launcher-specific filesystem parsing.

## 2026-05-27: Desktop Frontend

Use Vite for the React frontend inside Tauri.

Rationale: Vite is the default ergonomic path for React + Tauri development and keeps feedback loops fast.

## 2026-05-27: Backend User Data Ownership

Use explicit ownership checks in controllers for Phase 2 user-owned resources.

Rationale: Policies can still be introduced later, but explicit checks keep the current MVP small and make the security boundary easy to audit. Cross-user access returns `404` for user games, libraries, tags, scans, and play sessions.

User-owned API resources do not expose `user_id` in normal JSON resources because the authenticated token already identifies the owner.

## 2026-05-27: Sync Identity Rules

User game sync deduplicates by `user_id + platform_id + external_id` when an external platform ID exists, then falls back to `user_id + executable_path`.

Rationale: Steam/Epic/Xbox IDs are better identities when present. Manual games may not have an external ID, so executable path is the next safest local identity.

## 2026-05-27: Launch Commands

The sync endpoint rejects `launch_command`.

Rationale: The desktop may store and validate local launch details later, but the backend must not blindly accept executable commands from scanner sync payloads.

## 2026-05-28: Desktop API Integration

The desktop consumes the Laravel API directly through a central Vite API client configured by `VITE_API_URL`, defaulting to `http://localhost:8000/api`.

Rationale: Phase 3 needs a functional client while keeping the API boundary explicit and easy to swap for packaged builds.

## 2026-05-28: Temporary Desktop Token Storage

The desktop stores Sanctum bearer tokens in `localStorage` during Phase 3.

Rationale: This keeps the integration simple for MVP testing. A future Tauri phase should move tokens to secure storage before production use.

## 2026-05-28: Scanner Scope During Desktop Integration

Phase 3 uses a desktop-initiated mock sync payload and does not implement real Steam, Epic Games, Xbox, or manual executable scanning.

Rationale: The current goal is to prove the desktop-to-API-to-database flow before adding filesystem scanner complexity.

## 2026-05-28: Manual Scanner Execution Boundary

Phase 4 implements ManualScanner as an explicit user-confirmed `.exe` selection flow in the Tauri desktop. Ludex validates that the selected path is local, exists, points to a file, and has a `.exe` extension before syncing or launching.

Rationale: Manual import is the smallest useful real scanner while keeping the user in control of exactly which executable is trusted.

## 2026-05-28: Local Launch Safety

The desktop launches games with Rust `Command::new(executable_path)` and never builds a shell command string from API data. URLs, empty paths, and UNC/network paths are rejected in this phase.

Rationale: The API stores metadata and paths, but local execution must remain a desktop-side decision guarded by filesystem validation.

## 2026-05-28: Steam Library Discovery

Phase 5 implements Steam detection in the Tauri desktop by checking safe Steam root candidates from the Windows registry and common install locations, then reading `libraryfolders.vdf` for the actual library paths.

Rationale: Steam libraries can live on any drive. The scanner must discover real configured libraries instead of assuming `C:`, `D:`, or a fixed folder layout.

## 2026-05-28: Steam Manifest Parsing

Steam installed games are detected from `appmanifest_*.acf` files. The desktop normalizes each manifest into a detected game with `external_id` set to the Steam `appid`.

Rationale: App manifests are the stable Steam source for installed game metadata. This supports deduplication through the existing backend sync rules.

## 2026-05-28: Steam Launch Command Boundary

Phase 5 does not detect or execute a primary Steam game executable. A `steam://rungameid/{appid}` hint can be kept in metadata for future launch work, but the desktop does not send it as a trusted top-level `launch_command` in sync payloads.

Rationale: The backend already rejects arbitrary launch commands, and Steam protocol launching needs a dedicated safety review before becoming an executable action.
