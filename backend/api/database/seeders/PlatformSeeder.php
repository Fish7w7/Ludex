<?php

namespace Database\Seeders;

use App\Models\Platform;
use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['name' => 'Steam', 'slug' => 'steam', 'scanner_key' => 'steam', 'enabled' => true],
            ['name' => 'Epic Games', 'slug' => 'epic-games', 'scanner_key' => 'epic', 'enabled' => false],
            ['name' => 'Xbox / Game Pass', 'slug' => 'xbox-game-pass', 'scanner_key' => 'xbox', 'enabled' => false],
            ['name' => 'Manual', 'slug' => 'manual', 'scanner_key' => 'manual', 'enabled' => true],
        ])->each(fn (array $platform) => Platform::updateOrCreate(
            ['slug' => $platform['slug']],
            $platform
        ));
    }
}

