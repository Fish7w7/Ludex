<?php

use App\Models\ScanLog;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('manages tags scoped to the authenticated user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $tag = $this->actingAs($user)
        ->postJson('/api/tags', [
            'name' => 'Backlog',
            'color' => '#28f4ff',
        ])
        ->assertCreated()
        ->json('data');

    $this->actingAs($user)
        ->putJson("/api/tags/{$tag['id']}", [
            'name' => 'Favorites',
            'color' => '#ff4fd8',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Favorites');

    $this->actingAs($other)
        ->getJson("/api/tags/{$tag['id']}")
        ->assertNotFound();

    expect(Tag::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('stores and lists scan logs scoped to the authenticated user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/scans', [
            'platform' => 'steam',
            'status' => 'completed',
            'games_found' => 3,
            'message' => 'Mock scan completed.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.games_found', 3);

    ScanLog::create([
        'user_id' => $other->id,
        'platform' => 'steam',
        'status' => 'completed',
        'games_found' => 99,
    ]);

    $this->actingAs($user)
        ->getJson('/api/scans')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});
