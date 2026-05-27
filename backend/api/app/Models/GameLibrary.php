<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameLibrary extends Model
{
    protected $fillable = [
        'user_id',
        'platform_id',
        'path',
        'drive_letter',
        'label',
        'source',
        'is_active',
        'last_scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_scanned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }

    public function userGames(): HasMany
    {
        return $this->hasMany(UserGame::class, 'library_id');
    }
}
