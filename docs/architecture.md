# Ludex Architecture

Ludex is split into a local desktop app and a Laravel API.

## Desktop

The desktop app owns local machine concerns:

- Detecting installed games.
- Validating local executable paths.
- Launching local executables.
- Measuring play sessions.
- Presenting the user's library.
- Preparing future offline-first behavior.

The desktop must never execute commands received from the API. API data can enrich metadata, but executable launches must come from local detection or explicit user-selected `.exe` files.

## Backend

The backend owns account and sync concerns:

- Authentication with Laravel Sanctum.
- Platforms.
- Games.
- User library records.
- Favorites.
- Tags.
- Play sessions.
- Scan logs.
- Sync endpoints.
- Queued metadata and cover jobs.

PostgreSQL is the persistence layer. Redis supports cache and queues.

## Sync Direction

Phase 1 only defines the boundary. Later phases will sync normalized local records from desktop to the API and pull account/library metadata back down.

The desktop remains the authority for local executable paths.

