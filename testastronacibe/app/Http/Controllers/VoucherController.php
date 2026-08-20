<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckVoucherRequest;
use App\Http\Requests\GenerateVoucherRequest;
use App\Models\Voucher;
use App\Repositories\Contracts\VoucherRepositoryInterface;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;

class VoucherController extends Controller
{
    public function __construct(private readonly VoucherRepositoryInterface $vouchers)
    {
    }

    public function check(CheckVoucherRequest $request): JsonResponse
    {
        $exists = $this->vouchers->existsForFlightAndDate(
            $request->validated('flightNumber'),
            $request->validated('date'),
        );

        return response()->json(['exists' => $exists]);
    }

    public function generate(GenerateVoucherRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($this->vouchers->existsForFlightAndDate($data['flightNumber'], $data['date'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vouchers have already been generated for this flight and date.',
            ], 409);
        }

        $seats = Voucher::randomSeats($data['aircraft']);

        try {
            $this->vouchers->create([
                'crew_name' => $data['name'],
                'crew_id' => $data['id'],
                'flight_number' => $data['flightNumber'],
                'flight_date' => $data['date'],
                'aircraft_type' => $data['aircraft'],
                'seat1' => $seats[0],
                'seat2' => $seats[1],
                'seat3' => $seats[2],
            ]);
        } catch (QueryException) {
            // Unique constraint on (flight_number, flight_date) caught a race with a concurrent request.
            return response()->json([
                'success' => false,
                'message' => 'Vouchers have already been generated for this flight and date.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'seats' => $seats,
        ], 201);
    }
}
