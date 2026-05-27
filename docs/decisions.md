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

## 2026-05-27: Sync Identity Rules

User game sync deduplicates by `user_id + platform_id + external_id` when an external platform ID exists, then falls back to `user_id + executable_path`.

Rationale: Steam/Epic/Xbox IDs are better identities when present. Manual games may not have an external ID, so executable path is the next safest local identity.

## 2026-05-27: Launch Commands

The sync endpoint rejects `launch_command`.

Rationale: The desktop may store and validate local launch details later, but the backend must not blindly accept executable commands from scanner sync payloads.
