import { randomInt } from "node:crypto";
import { compareSeats, getAircraftById, getSeatMap } from "./aircraft";

export function pickRandomSeats(aircraftId: string, count = 3): string[] {
  const aircraft = getAircraftById(aircraftId);
  if (!aircraft) {
    throw new Error(`Unknown aircraft type: ${aircraftId}`);
  }

  const available = getSeatMap(aircraft);
  const picked: string[] = [];

  for (let i = 0; i < count && available.length > 0; i++) {
    const index = randomInt(available.length);
    picked.push(available[index]);
    available.splice(index, 1);
  }

  return picked.sort(compareSeats);
}
