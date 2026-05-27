<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinishPlaySessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'play_session_id' => ['nullable', 'integer', 'exists:play_sessions,id'],
            'ended_at' => ['nullable', 'date'],
        ];
    }
}
