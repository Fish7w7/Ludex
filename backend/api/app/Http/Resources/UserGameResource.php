<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserGameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'game_id' => $this->game_id,
            'platform_id' => $this->platform_id,
            'library_id' => $this->library_id,
            'install_path' => $this->install_path,
            'executable_path' => $this->executable_path,
            'launch_command' => $this->launch_command,
            'is_favorite' => $this->is_favorite,
            'last_played_at' => $this->last_played_at?->toISOString(),
            'total_playtime_seconds' => $this->total_playtime_seconds,
            'source' => $this->source,
            'external_id' => $this->external_id,
            'metadata' => $this->metadata,
            'game' => GameResource::make($this->whenLoaded('game')),
            'platform' => PlatformResource::make($this->whenLoaded('platform')),
            'library' => GameLibraryResource::make($this->whenLoaded('library')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
