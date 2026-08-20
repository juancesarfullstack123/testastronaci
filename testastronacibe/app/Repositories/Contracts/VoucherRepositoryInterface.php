<?php

namespace App\Repositories\Contracts;

use App\Models\Voucher;

interface VoucherRepositoryInterface
{
    public function existsForFlightAndDate(string $flightNumber, string $date): bool;

    public function create(array $data): Voucher;
}
