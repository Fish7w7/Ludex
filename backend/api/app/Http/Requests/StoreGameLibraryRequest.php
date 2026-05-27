<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGameLibraryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'platform_id' => ['nullable', 'integer', 'exists:platforms,id'],
            'path' => ['required', 'string', 'max:2048'],
            'drive_letter' => ['nullable', 'string', 'max:8', 'regex:/^[A-Za-z]:$/'],
            'label' => ['nullable', 'string', 'max:120'],
            'source' => ['required', Rule::in(['steam', 'epic', 'xbox', 'manual', 'mock'])],
            'is_active' => ['sometimes', 'boolean'],
            'last_scanned_at' => ['nullable', 'date'],
        ];
    }
}
