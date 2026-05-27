<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreScanLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'platform' => ['required', 'string', 'max:40'],
            'status' => ['required', 'string', 'max:40'],
            'games_found' => ['sometimes', 'integer', 'min:0'],
            'message' => ['nullable', 'string', 'max:1000'],
            'payload' => ['nullable', 'array'],
        ];
    }
}
