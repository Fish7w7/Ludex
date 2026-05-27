<?php

use App\Models\Game;
use App\Models\Platform;
use App\Models\User;
use App\Models\UserGame;
use Database\Seeders\PlatformSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createInstalledGameFor(User $user): UserGame
{
    $platform = Platform::query()->where('scanner_key', 'steam')->firstOrFail();
    $game = Game::create([
        'platform_id' => $platform->id,
        'external_id' => '730',
        'name' => 'Counter-Strike 2',
        'slug' => 'counter-strike-2',
    ]);

    return UserGame::create([
        'user_id' => $user->id,
        'game_id' => $game->id,
        'platform_id' => $platform->id,
        'source' => 'steam',
        'install_path' => 'D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive',
        'executable_path' => 'D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe',
        'external_id' => '730',
    ]);
}

it('favorites and unfavorites a user game', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();
    $userGame = createInstalledGameFor($user);

    $this->actingAs($user)
        ->postJson("/api/user-games/{$userGame->id}/favorite")
        ->assertOk()
        ->assertJsonPath('data.is_favorite', true);

    $this->actingAs($user)
        ->deleteJson("/api/user-games/{$userGame->id}/favorite")
        ->assertOk()
        ->assertJsonPath('data.is_favorite', false);
});

it('starts and finishes a play session while updating playtime', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();
    $userGame = createInstalledGameFor($user);

    $start = $this->actingAs($user)
        ->postJson("/api/user-games/{$userGame->id}/play-sessions/start", [
            'started_at' => '2026-05-27T10:00:00Z',
        ])
        ->assertCreated();

    $this->actingAs($user)
        ->postJson("/api/user-games/{$userGame->id}/play-sessions/finish", [
            'play_session_id' => $start->json('data.id'),
            'ended_at' => '2026-05-27T10:02:00Z',
        ])
        ->assertOk()
        ->assertJsonPath('data.duration_seconds', 120)
        ->assertJsonPath('user_game.total_playtime_seconds', 120);
});

it('prevents users from accessing another users game', function () {
    $this->seed(PlatformSeeder::class);
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $userGame = createInstalledGameFor($owner);

    $this->actingAs($other)
        ->getJson("/api/user-games/{$userGame->id}")
        ->assertNotFound();

    $this->actingAs($other)
        ->postJson("/api/user-games/{$userGame->id}/favorite")
        ->assertNotFound();
});
