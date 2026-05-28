# API

The Ludex API is a Laravel REST API backed by PostgreSQL and Redis. Authentication uses Laravel Sanctum bearer tokens.

## Health

```txt
GET /api/health
```

## Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/me
```

`/api/auth/logout` and `/api/me` require `auth:sanctum`.

## Platforms

```txt
GET /api/platforms
```

Seeded platforms:

- Steam
- Epic Games
- Xbox/Game Pass
- Manual

## Games

```txt
GET    /api/games
POST   /api/games
GET    /api/games/{game}
PUT    /api/games/{game}
PATCH  /api/games/{game}
DELETE /api/games/{game}
```

Main fields: `name`, `slug`, `cover_url`, `description`, `release_date`, `platform_id`, `external_id`, `metadata`.

## Game Libraries

Game libraries represent real local folders detected on a user's PC. They support multiple drives such as `C:`, `D:`, `E:`, `G:` and never assume fixed paths.

```txt
GET    /api/game-libraries
POST   /api/game-libraries
GET    /api/game-libraries/{gameLibrary}
PUT    /api/game-libraries/{gameLibrary}
PATCH  /api/game-libraries/{gameLibrary}
DELETE /api/game-libraries/{gameLibrary}
```

Main fields: `platform_id`, `path`, `drive_letter`, `label`, `source`, `is_active`, `last_scanned_at`.

`user_id` is server-managed from the authenticated token.

## User Games

```txt
GET    /api/user-games
POST   /api/user-games
POST   /api/user-games/sync
GET    /api/user-games/{userGame}
PUT    /api/user-games/{userGame}
PATCH  /api/user-games/{userGame}
DELETE /api/user-games/{userGame}
```

Main fields: `game_id`, `platform_id`, `library_id`, `install_path`, `executable_path`, `launch_command`, `is_favorite`, `last_played_at`, `total_playtime_seconds`, `source`, `external_id`, `metadata`.

`user_id` is server-managed from the authenticated token.

## Sync

```txt
POST /api/user-games/sync
```

Example:

```json
{
  "source": "steam",
  "games": [
    {
      "name": "Counter-Strike 2",
      "platform": "steam",
      "install_path": "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive",
      "executable_path": "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe",
      "external_id": "730",
      "metadata": {
        "library_path": "D:\\SteamLibrary"
      }
    }
  ]
}
```

Rules:

- Validates every detected game.
- Finds the platform by `scanner_key` or `slug`.
- Finds or creates the canonical `game`.
- Creates or updates the user's `user_game`.
- Avoids duplicates by `user_id + platform_id + external_id` when `external_id` exists.
- Falls back to `user_id + executable_path` when no `external_id` exists.
- Creates/updates `game_libraries` when `metadata.library_path` is provided.
- Rejects `launch_command` in sync payloads.

## Favorites

```txt
POST   /api/user-games/{userGame}/favorite
DELETE /api/user-games/{userGame}/favorite
```

## Play Sessions

```txt
POST /api/user-games/{userGame}/play-sessions/start
POST /api/user-games/{userGame}/play-sessions/finish
```

Finish calculates `duration_seconds`, updates `total_playtime_seconds`, and sets `last_played_at`.

## Tags

```txt
GET    /api/tags
POST   /api/tags
GET    /api/tags/{tag}
PUT    /api/tags/{tag}
PATCH  /api/tags/{tag}
DELETE /api/tags/{tag}
```

Tags are scoped to the authenticated user.

## Scan Logs

```txt
GET  /api/scans
POST /api/scans
```

Main fields: `platform`, `status`, `games_found`, `message`, `payload`.

## Security

All user-owned resources enforce ownership checks and return `404` for cross-user access.
