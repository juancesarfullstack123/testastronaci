export type AircraftType = {
  id: string;
  name: string;
  category: string;
  columns: string[][];
  rowStart: number;
  rowEnd: number;
  skipRows?: number[];
};

export const AIRCRAFT_TYPES: AircraftType[] = [
  {
    id: "a320",
    name: "Airbus A320",
    category: "Narrow-body · 3–3 layout",
    columns: [
      ["A", "B", "C"],
      ["D", "E", "F"],
    ],
    rowStart: 1,
    rowEnd: 30,
    skipRows: [13],
  },
  {
    id: "b738",
    name: "Boeing 737-800",
    category: "Narrow-body · 3–3 layout",
    columns: [
      ["A", "B", "C"],
      ["D", "E", "F"],
    ],
    rowStart: 1,
    rowEnd: 32,
    skipRows: [13],
  },
  {
    id: "atr72",
    name: "ATR 72-600",
    category: "Regional turboprop · 2–2 layout",
    columns: [
      ["A", "B"],
      ["C", "D"],
    ],
    rowStart: 1,
    rowEnd: 18,
    skipRows: [13],
  },
  {
    id: "b77w",
    name: "Boeing 777-300ER",
    category: "Wide-body economy · 3–4–3 layout",
    columns: [
      ["A", "B", "C"],
      ["D", "E", "F", "G"],
      ["H", "J", "K"],
    ],
    rowStart: 10,
    rowEnd: 45,
    skipRows: [13],
  },
];

export function getAircraftById(id: string): AircraftType | undefined {
  return AIRCRAFT_TYPES.find((aircraft) => aircraft.id === id);
}

export function getSeatMap(aircraft: AircraftType): string[] {
  const seats: string[] = [];
  for (let row = aircraft.rowStart; row <= aircraft.rowEnd; row++) {
    if (aircraft.skipRows?.includes(row)) continue;
    for (const group of aircraft.columns) {
      for (const letter of group) {
        seats.push(`${row}${letter}`);
      }
    }
  }
  return seats;
}

export function getSeatCount(aircraft: AircraftType): number {
  const rows = aircraft.rowEnd - aircraft.rowStart + 1 - (aircraft.skipRows?.length ?? 0);
  const perRow = aircraft.columns.reduce((sum, group) => sum + group.length, 0);
  return rows * perRow;
}

function parseSeat(seat: string): { row: number; letter: string } {
  const match = /^(\d+)([A-Z]+)$/.exec(seat);
  if (!match) return { row: 0, letter: seat };
  return { row: Number(match[1]), letter: match[2] };
}

export function compareSeats(a: string, b: string): number {
  const seatA = parseSeat(a);
  const seatB = parseSeat(b);
  if (seatA.row !== seatB.row) return seatA.row - seatB.row;
  return seatA.letter.localeCompare(seatB.letter);
}
