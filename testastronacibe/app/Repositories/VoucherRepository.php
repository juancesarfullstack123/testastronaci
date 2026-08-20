<?php

namespace App\Repositories;

use App\Models\Voucher;
use App\Repositories\Contracts\VoucherRepositoryInterface;

class VoucherRepository implements VoucherRepositoryInterface
{
    public function existsForFlightAndDate(string $flightNumber, string $date): bool
    {
        return Voucher::query()
            ->where('flight_number', $flightNumber)
            ->where('flight_date', $date)
            ->exists();
    }

    public function create(array $data): Voucher
    {
        return Voucher::create($data);
    }
}
