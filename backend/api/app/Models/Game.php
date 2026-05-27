<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'platform_id',
        'external_id',
        'name',
        'slug',
        'cover_url',
        'description',
        'release_date',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'release_date' => 'date',
            'metadata' => 'array',
        ];
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    public function userGames(): HasMany
    {
        return $this->hasMany(UserGame::class);
    }
}
