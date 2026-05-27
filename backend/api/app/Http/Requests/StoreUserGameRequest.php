<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'game_id' => ['nullable', 'integer', 'exists:games,id'],
            'platform_id' => ['nullable', 'integer', 'exists:platforms,id'],
            'library_id' => ['nullable', 'integer', 'exists:game_libraries,id'],
            'source' => ['required', Rule::in(['steam', 'epic', 'xbox', 'manual', 'mock'])],
            'install_path' => ['required', 'string', 'max:2048'],
            'executable_path' => ['nullable', 'string', 'max:2048'],
            'launch_command' => ['nullable', 'string', 'max:2048', 'not_regex:/[;&|<>`]/'],
            'is_favorite' => ['sometimes', 'boolean'],
            'last_played_at' => ['nullable', 'date'],
            'total_playtime_seconds' => ['sometimes', 'integer', 'min:0'],
            'external_id' => ['nullable', 'string', 'max:120'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
