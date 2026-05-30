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

Use Vite for the React frontend inside the desktop app.

Rationale: Vite keeps React feedback loops fast and remains useful regardless of the native desktop shell.

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

The desktop consumes the Laravel API directly through a central Vite API client configured by `VITE_API_URL`, defaulting to `http://127.0.0.1:8000/api`.

Rationale: Phase 3 needs a functional client while keeping the API boundary explicit and easy to swap for packaged builds.

## 2026-05-28: Temporary Desktop Token Storage

The desktop stores Sanctum bearer tokens in `localStorage` during Phase 3.

Rationale: This keeps the integration simple for MVP testing. A future desktop phase should move tokens to secure storage before production use.

## 2026-05-28: Scanner Scope During Desktop Integration

Phase 3 uses a desktop-initiated mock sync payload and does not implement real Steam, Epic Games, Xbox, or manual executable scanning.

Rationale: The current goal is to prove the desktop-to-API-to-database flow before adding filesystem scanner complexity.

## 2026-05-28: Manual Scanner Execution Boundary

Phase 4 implements ManualScanner as an explicit user-confirmed `.exe` selection flow in the desktop app. Ludex validates that the selected path is local, exists, points to a file, and has a `.exe` extension before syncing or launching.

Rationale: Manual import is the smallest useful real scanner while keeping the user in control of exactly which executable is trusted.

## 2026-05-28: Local Launch Safety

The desktop launches games from the native process and never builds a shell command string from API data. URLs, empty paths, and UNC/network paths are rejected in this phase.

Rationale: The API stores metadata and paths, but local execution must remain a desktop-side decision guarded by filesystem validation.

## 2026-05-28: Steam Library Discovery

Phase 5 implements Steam detection in the desktop native layer by checking safe Steam root candidates from the Windows registry and common install locations, then reading `libraryfolders.vdf` for the actual library paths.

Rationale: Steam libraries can live on any drive. The scanner must discover real configured libraries instead of assuming `C:`, `D:`, or a fixed folder layout.

## 2026-05-28: Steam Manifest Parsing

Steam installed games are detected from `appmanifest_*.acf` files. The desktop normalizes each manifest into a detected game with `external_id` set to the Steam `appid`.

Rationale: App manifests are the stable Steam source for installed game metadata. This supports deduplication through the existing backend sync rules.

## 2026-05-28: Steam Launch Command Boundary

Phase 5 does not detect or execute a primary Steam game executable. A `steam://rungameid/{appid}` hint can be kept in metadata for future launch work, but the desktop does not send it as a trusted top-level `launch_command` in sync payloads.

Rationale: The backend already rejects arbitrary launch commands, and Steam protocol launching needs a dedicated safety review before becoming an executable action.

## 2026-05-28: Electron Migration

The desktop native layer moved from Tauri/Rust to Electron main/preload IPC while preserving the React UI and Laravel API contract.

Rationale: Electron is simpler for the current development flow and lets Ludex keep the already validated ManualScanner, SteamScanner, sync, launch, and reveal-folder behavior in TypeScript.

## 2026-05-28: Electron IPC Boundary

Electron exposes only a narrow preload API: manual executable selection, executable validation, launching, folder reveal, and Steam scan.

Rationale: The renderer should not have raw Node.js access. Local filesystem and process operations stay in the main process behind explicit validation.

## 2026-05-28: Electron Sandbox

Electron windows use `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`. The preload bridge exposes only the Ludex desktop API required by the renderer.

Rationale: The renderer should behave like an untrusted web surface. Filesystem reads, process launch, dialogs, and Steam scanning stay behind explicit IPC channels in the main process.

## 2026-05-28: Electron Dependency Audit

The initial Electron migration audit found high-severity advisories in `electron`, `electron-builder`, and transitive packaging dependencies. We updated directly to `electron@42.3.0` and `electron-builder@26.8.1`.

Rationale: These were direct dependencies and the API surface Ludex uses is stable across the update. `npm audit` now reports zero vulnerabilities.

## 2026-05-28: Electron Build Output

Electron Builder is configured for Windows NSIS output in `apps/desktop/dist/release`.

Rationale: The user-facing build command should keep desktop artifacts under `dist`, while `!dist/release/**/*` prevents generated installers from being included recursively in the packaged app.

## 2026-05-29: Epic Manifest Scanner

Phase 6 implements Epic Games detection in the Electron main process by reading `.item` manifests from `C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests`.

Rationale: Epic manifests contain the real `InstallLocation`, so Ludex can support games installed on any drive without probing all disks or assuming fixed paths.

## 2026-05-29: Epic Launch Command Boundary

Epic `LaunchCommand` is not sent to the API and is not executed by the desktop. `LaunchExecutable` is converted to `executable_path` only when it resolves inside `InstallLocation`, exists locally, and ends in `.exe`.

Rationale: Epic launch command strings can contain launcher-specific arguments and should not become trusted commands. The safe MVP behavior is to preserve library sync and only keep a local executable path when it passes strict filesystem validation.

## 2026-05-29: UX/UI Component Split

The desktop UI was split out of the monolithic `App.tsx` into focused components for auth, app shell, library, game cards, details, scanner, settings, manual modal, and shared UI primitives.

Rationale: The app now has enough real flows that visual consistency and maintenance are easier when layout, cards, buttons, badges, empty states, and feature surfaces have explicit ownership.

## 2026-05-29: Electron Title and Menu

The Electron window title is `Ludex`, and the default Windows application menu is removed with `Menu.setApplicationMenu(null)`.

Rationale: The Japanese signature `ピコ~` belongs in the React UI, where the app controls rendering and styling. Removing the default menu keeps the desktop shell feeling like a product instead of a development wrapper.

## 2026-05-29: Sidebar Visual Background

The desktop sidebar uses a local vertical asset at `apps/desktop/src/assets/sidebar-bg.png` with dark blue overlays, subtle neon gradients, and glass cards for API/user status.

Rationale: The Ludex identity should feel closer to Japanese cyber arcade without depending on remote runtime assets. The overlay stack keeps navigation and account text legible, and the image can be swapped later by replacing that local asset path and import in `AppShell.tsx`.

## 2026-05-29: Reference-Driven Launcher Layout

The Library screen now follows the approved launcher reference more closely: a stronger scenic sidebar, denser game grid, fixed right details panel, and compact scanner strip at the bottom of the library.

Rationale: The MVP desktop should feel like a premium game launcher rather than a generic dashboard. Existing data and flows are preserved, while statistics and secondary blocks are visually reduced so game covers, selected state, play actions, and scanners match the intended Ludex hierarchy.

## 2026-05-29: Design Preview Mode

The desktop supports `VITE_DESIGN_PREVIEW=true` to render a visual-only filled library using local mock `UserGame` records.

Rationale: UI fidelity against the launcher reference is hard to validate with an empty real library. Design preview does not sync games, does not write to the backend, and no-ops local launch/favorite actions for preview records.

## 2026-05-29: Sidebar Background Framing

The sidebar background image is rendered as an absolutely positioned `<img>` with `object-fit: cover` and `object-position: center bottom`. The source asset is cropped/resized to a sidebar-native 560x1840 composition, so it stays anchored and predictable across window heights.

Rationale: The sidebar is a major identity surface. A vertical asset avoids the unstable framing of generic backgrounds, keeps the top cleaner for the logo, and preserves skyline/pagoda/sakura detail near the bottom while maintaining menu, account, and API status readability.
