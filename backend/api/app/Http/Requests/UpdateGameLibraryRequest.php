<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGameLibraryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'platform_id' => ['sometimes', 'nullable', 'integer', 'exists:platforms,id'],
            'path' => ['sometimes', 'required', 'string', 'max:2048'],
            'drive_letter' => ['sometimes', 'nullable', 'string', 'max:8', 'regex:/^[A-Za-z]:$/'],
            'label' => ['sometimes', 'nullable', 'string', 'max:120'],
            'source' => ['sometimes', 'required', Rule::in(['steam', 'epic', 'xbox', 'manual', 'mock'])],
            'is_active' => ['sometimes', 'boolean'],
            'last_scanned_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
