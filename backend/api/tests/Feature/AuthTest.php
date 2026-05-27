<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('registers, logs in, returns me, and logs out', function () {
    $register = $this->postJson('/api/auth/register', [
        'name' => 'Aya Player',
        'email' => 'aya@example.com',
        'password' => 'super-secret',
    ])->assertCreated();

    $register->assertJsonPath('user.email', 'aya@example.com')
        ->assertJsonStructure(['token']);

    $login = $this->postJson('/api/auth/login', [
        'email' => 'aya@example.com',
        'password' => 'super-secret',
    ])->assertOk();

    $token = $login->json('token');

    $this->withToken($token)
        ->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'aya@example.com');

    $this->withToken($token)
        ->postJson('/api/auth/logout')
        ->assertOk();
});

it('protects private routes', function () {
    User::factory()->create();

    $this->getJson('/api/me')->assertUnauthorized();
});
