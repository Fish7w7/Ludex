<?php

use App\Models\User;
use Database\Seeders\PlatformSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists seeded platforms for authenticated users', function () {
    $this->seed(PlatformSeeder::class);

    $this->actingAs(User::factory()->create())
        ->getJson('/api/platforms')
        ->assertOk()
        ->assertJsonFragment(['slug' => 'steam'])
        ->assertJsonFragment(['slug' => 'epic-games'])
        ->assertJsonFragment(['slug' => 'xbox-game-pass'])
        ->assertJsonFragment(['slug' => 'manual']);
});
