<?php

use App\Models\Game;
use App\Models\GameLibrary;
use App\Models\Platform;
use App\Models\User;
use App\Models\UserGame;
use Database\Seeders\PlatformSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function steamPayload(): array
{
    return [
        'source' => 'steam',
        'games' => [
            [
                'name' => 'Counter-Strike 2',
                'platform' => 'steam',
                'install_path' => 'D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive',
                'executable_path' => 'D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\bin\\win64\\cs2.exe',
                'external_id' => '730',
                'metadata' => [
                    'library_path' => 'D:\\SteamLibrary',
                ],
            ],
        ],
    ];
}

it('syncs detected user games and creates related game and library records', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/user-games/sync', steamPayload())
        ->assertOk()
        ->assertJsonPath('synced', 1)
        ->assertJsonPath('data.0.external_id', '730')
        ->assertJsonPath('data.0.game.name', 'Counter-Strike 2')
        ->assertJsonPath('data.0.library.drive_letter', 'D:');

    expect(Game::query()->where('name', 'Counter-Strike 2')->count())->toBe(1);
    expect(GameLibrary::query()->where('path', 'D:\\SteamLibrary')->count())->toBe(1);
    expect(UserGame::query()->where('external_id', '730')->count())->toBe(1);
});

it('does not duplicate user games when syncing the same external id twice', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();

    $this->actingAs($user)->postJson('/api/user-games/sync', steamPayload())->assertOk();
    $this->actingAs($user)->postJson('/api/user-games/sync', steamPayload())->assertOk();

    $steam = Platform::query()->where('scanner_key', 'steam')->firstOrFail();

    expect(UserGame::query()
        ->where('user_id', $user->id)
        ->where('platform_id', $steam->id)
        ->where('external_id', '730')
        ->count())->toBe(1);
});

it('does not duplicate user games without external id when executable path matches', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();
    $payload = steamPayload();
    unset($payload['games'][0]['external_id']);

    $this->actingAs($user)->postJson('/api/user-games/sync', $payload)->assertOk();
    $this->actingAs($user)->postJson('/api/user-games/sync', $payload)->assertOk();

    expect(UserGame::query()
        ->where('user_id', $user->id)
        ->where('executable_path', $payload['games'][0]['executable_path'])
        ->count())->toBe(1);
});

it('rejects launch commands in sync payloads', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();
    $payload = steamPayload();
    $payload['games'][0]['launch_command'] = 'cmd.exe /c calc.exe';

    $this->actingAs($user)
        ->postJson('/api/user-games/sync', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('games.0.launch_command');
});

it('accepts platform slugs when syncing detected games', function () {
    $this->seed(PlatformSeeder::class);
    $user = User::factory()->create();
    $payload = steamPayload();
    $payload['source'] = 'epic';
    $payload['games'][0]['platform'] = 'epic';
    $payload['games'][0]['external_id'] = 'catalog-123';

    $this->actingAs($user)
        ->postJson('/api/user-games/sync', $payload)
        ->assertOk()
        ->assertJsonPath('data.0.platform.slug', 'epic');
});
