<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    /**
     * Valid row range and seat letters per aircraft type.
     */
    public const SEAT_MAPS = [
        'ATR' => [
            'rows' => [1, 18],
            'letters' => ['A', 'C', 'D', 'F'],
        ],
        'Airbus 320' => [
            'rows' => [1, 32],
            'letters' => ['A', 'B', 'C', 'D', 'E', 'F'],
        ],
        'Boeing 737 Max' => [
            'rows' => [1, 32],
            'letters' => ['A', 'B', 'C', 'D', 'E', 'F'],
        ],
    ];

    /**
     * Pick 3 unique random valid seats for the given aircraft type.
     *
     * @return array{0: string, 1: string, 2: string}
     */
    public static function randomSeats(string $aircraftType): array
    {
        [$minRow, $maxRow] = self::SEAT_MAPS[$aircraftType]['rows'];
        $letters = self::SEAT_MAPS[$aircraftType]['letters'];

        $allSeats = [];
        for ($row = $minRow; $row <= $maxRow; $row++) {
            foreach ($letters as $letter) {
                $allSeats[] = "{$row}{$letter}";
            }
        }

        shuffle($allSeats);

        return array_slice($allSeats, 0, 3);
    }

    protected $fillable = [
        'crew_name',
        'crew_id',
        'flight_number',
        'flight_date',
        'aircraft_type',
        'seat1',
        'seat2',
        'seat3',
    ];
}
