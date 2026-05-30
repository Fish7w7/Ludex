<?php

namespace App\Http\Requests;

use App\Models\Platform;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncUserGamesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source' => ['required', Rule::in(['steam', 'epic', 'xbox', 'manual', 'mock'])],
            'games' => ['required', 'array', 'min:1', 'max:500'],
            'games.*.name' => ['required', 'string', 'max:255'],
            'games.*.platform' => [
                'nullable',
                'string',
                'max:80',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $platformKey = strtolower(trim((string) $value));

                    $exists = Platform::query()
                        ->where('scanner_key', $platformKey)
                        ->orWhere('slug', $platformKey)
                        ->exists();

                    if (! $exists) {
                        $fail('A plataforma informada não está cadastrada no Ludex.');
                    }
                },
            ],
            'games.*.install_path' => ['required', 'string', 'max:2048'],
            'games.*.executable_path' => ['nullable', 'string', 'max:2048'],
            'games.*.external_id' => ['nullable', 'string', 'max:120'],
            'games.*.metadata' => ['nullable', 'array'],
            'games.*.launch_command' => ['prohibited'],
        ];
    }
}
