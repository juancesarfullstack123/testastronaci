<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'flightNumber' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date_format:Y-m-d'],
        ];
    }
}
