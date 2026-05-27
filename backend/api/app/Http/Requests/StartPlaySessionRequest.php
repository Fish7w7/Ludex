<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartPlaySessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'started_at' => ['nullable', 'date'],
        ];
    }
}
