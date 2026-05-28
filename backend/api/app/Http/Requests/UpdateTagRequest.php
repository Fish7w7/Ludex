<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:60',
                Rule::unique('tags', 'name')
                    ->where(fn ($query) => $query->where('user_id', $this->user()->id))
                    ->ignore($this->route('tag')),
            ],
            'color' => ['nullable', 'string', 'max:32'],
        ];
    }
}
