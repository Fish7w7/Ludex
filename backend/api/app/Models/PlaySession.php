<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaySession extends Model
{
    protected $fillable = ['user_id', 'user_game_id', 'started_at', 'ended_at', 'duration_seconds'];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function userGame(): BelongsTo
    {
        return $this->belongsTo(UserGame::class);
    }
}
