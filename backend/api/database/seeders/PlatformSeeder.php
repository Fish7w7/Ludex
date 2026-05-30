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
            ['name' => 'Epic Games', 'slug' => 'epic', 'scanner_key' => 'epic', 'enabled' => true],
            ['name' => 'Xbox / Game Pass', 'slug' => 'xbox', 'scanner_key' => 'xbox', 'enabled' => false],
            ['name' => 'Manual', 'slug' => 'manual', 'scanner_key' => 'manual', 'enabled' => true],
        ])->each(fn (array $platform) => Platform::query()
            ->updateOrCreate(['scanner_key' => $platform['scanner_key']], $platform));
    }
}
