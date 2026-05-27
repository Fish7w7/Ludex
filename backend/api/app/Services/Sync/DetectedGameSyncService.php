<?php

namespace App\Services\Sync;

use App\Models\Game;
use App\Models\GameLibrary;
use App\Models\Platform;
use App\Models\User;
use App\Models\UserGame;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DetectedGameSyncService
{
    public function sync(User $user, array $payload): array
    {
        return DB::transaction(function () use ($user, $payload): array {
            $items = collect($payload['games'])
                ->map(fn (array $detectedGame): UserGame => $this->syncGame($user, $payload['source'], $detectedGame));

            return [
                'synced' => $items->count(),
                'user_games' => $items,
            ];
        });
    }

    private function syncGame(User $user, string $source, array $detectedGame): UserGame
    {
        $platformKey = $detectedGame['platform'] ?? $source;
        $platform = Platform::query()
            ->where('scanner_key', $platformKey)
            ->orWhere('slug', $platformKey)
            ->firstOrFail();

        $game = $this->findOrCreateGame($platform, $detectedGame);
        $library = $this->findOrCreateLibrary($user, $platform, $source, $detectedGame);

        $identity = [
            'user_id' => $user->id,
            'platform_id' => $platform->id,
        ];

        if (! empty($detectedGame['external_id'])) {
            $identity['external_id'] = $detectedGame['external_id'];
        } elseif (! empty($detectedGame['executable_path'])) {
            $identity = [
                'user_id' => $user->id,
                'executable_path' => $detectedGame['executable_path'],
            ];
        } else {
            $identity['install_path'] = $detectedGame['install_path'];
        }

        return UserGame::query()->updateOrCreate($identity, [
            'game_id' => $game->id,
            'platform_id' => $platform->id,
            'library_id' => $library?->id,
            'source' => $source,
            'install_path' => $detectedGame['install_path'],
            'executable_path' => $detectedGame['executable_path'] ?? null,
            'external_id' => $detectedGame['external_id'] ?? null,
            'metadata' => $detectedGame['metadata'] ?? null,
        ])->load(['game', 'platform', 'library']);
    }

    private function findOrCreateGame(Platform $platform, array $detectedGame): Game
    {
        $slug = Str::slug($detectedGame['name']);
        $externalId = $detectedGame['external_id'] ?? null;

        $game = null;

        if ($externalId) {
            $game = Game::query()
                ->where('platform_id', $platform->id)
                ->where('external_id', $externalId)
                ->first();
        }

        $game ??= Game::query()
            ->where('platform_id', $platform->id)
            ->where('slug', $slug)
            ->first();

        if ($game) {
            $game->fill([
                'name' => $detectedGame['name'],
                'external_id' => $game->external_id ?: $externalId,
                'metadata' => array_filter([
                    'last_sync_metadata' => $detectedGame['metadata'] ?? null,
                ]),
            ])->save();

            return $game;
        }

        return Game::create([
            'platform_id' => $platform->id,
            'external_id' => $externalId,
            'name' => $detectedGame['name'],
            'slug' => $slug,
            'metadata' => array_filter([
                'last_sync_metadata' => $detectedGame['metadata'] ?? null,
            ]),
        ]);
    }

    private function findOrCreateLibrary(User $user, Platform $platform, string $source, array $detectedGame): ?GameLibrary
    {
        $libraryPath = data_get($detectedGame, 'metadata.library_path');

        if (! is_string($libraryPath) || trim($libraryPath) === '') {
            return null;
        }

        return GameLibrary::query()->updateOrCreate([
            'user_id' => $user->id,
            'platform_id' => $platform->id,
            'path' => $libraryPath,
        ], [
            'drive_letter' => $this->driveLetter($libraryPath),
            'label' => $platform->name,
            'source' => $source,
            'is_active' => true,
            'last_scanned_at' => now(),
        ]);
    }

    private function driveLetter(string $path): ?string
    {
        preg_match('/^([A-Za-z]:)/', $path, $matches);

        return isset($matches[1]) ? strtoupper($matches[1]) : null;
    }
}
