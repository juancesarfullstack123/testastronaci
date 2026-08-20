<?php

namespace App\Http\Requests;

use App\Models\Voucher;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'id' => ['required', 'string', 'max:255'],
            'flightNumber' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date_format:Y-m-d'],
            'aircraft' => ['required', 'string', Rule::in(array_keys(Voucher::SEAT_MAPS))],
        ];
    }

    public function messages(): array
    {
        return [
            'aircraft.in' => 'The selected aircraft type is invalid.',
        ];
    }
}
