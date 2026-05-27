<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameLibraryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'platform_id' => $this->platform_id,
            'path' => $this->path,
            'drive_letter' => $this->drive_letter,
            'label' => $this->label,
            'source' => $this->source,
            'is_active' => $this->is_active,
            'last_scanned_at' => $this->last_scanned_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
