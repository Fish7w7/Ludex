<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'platform_id' => ['nullable', 'integer', 'exists:platforms,id'],
            'external_id' => ['nullable', 'string', 'max:120'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'cover_url' => ['nullable', 'url', 'max:2048'],
            'description' => ['nullable', 'string', 'max:5000'],
            'release_date' => ['nullable', 'date'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
