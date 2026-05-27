<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'game_id' => ['sometimes', 'nullable', 'integer', 'exists:games,id'],
            'platform_id' => ['sometimes', 'nullable', 'integer', 'exists:platforms,id'],
            'library_id' => ['sometimes', 'nullable', 'integer', 'exists:game_libraries,id'],
            'source' => ['sometimes', 'required', Rule::in(['steam', 'epic', 'xbox', 'manual', 'mock'])],
            'install_path' => ['sometimes', 'required', 'string', 'max:2048'],
            'executable_path' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'launch_command' => ['sometimes', 'nullable', 'string', 'max:2048', 'not_regex:/[;&|<>`]/'],
            'is_favorite' => ['sometimes', 'boolean'],
            'last_played_at' => ['sometimes', 'nullable', 'date'],
            'total_playtime_seconds' => ['sometimes', 'integer', 'min:0'],
            'external_id' => ['sometimes', 'nullable', 'string', 'max:120'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
