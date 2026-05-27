<?php

it('returns the Ludex health payload', function () {
    $this->getJson('/api/health')
        ->assertOk()
        ->assertJson([
            'status' => 'ok',
            'name' => 'Ludex',
            'signature' => 'ピコ~',
        ]);
});
