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

## API Safety

The Laravel API should enforce:

- Sanctum authentication.
- Rate limiting.
- Form request validation.
- Ownership checks on user resources.
- No cross-user access to library, favorites, tags, sessions, or scan logs.

## Sync Safety

Sync payloads should be treated as untrusted input. Server-side IDs, ownership, timestamps, and conflict decisions must be validated on the API.

