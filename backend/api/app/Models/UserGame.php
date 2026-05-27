<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserGame extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
        'platform_id',
        'library_id',
        'source',
        'install_path',
        'executable_path',
        'launch_command',
        'is_favorite',
        'last_played_at',
        'total_playtime_seconds',
        'external_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'is_favorite' => 'boolean',
            'last_played_at' => 'datetime',
            'total_playtime_seconds' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    public function library(): BelongsTo
    {
        return $this->belongsTo(GameLibrary::class, 'library_id');
    }

    public function playSessions(): HasMany
    {
        return $this->hasMany(PlaySession::class);
    }
}
