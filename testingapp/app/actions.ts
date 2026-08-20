"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AIRCRAFT_TYPES, getAircraftById } from "@/lib/aircraft";
import type { AssignmentActionState } from "@/lib/assignment-state";
import { findAssignment, insertAssignment } from "@/lib/db";
import { pickRandomSeats } from "@/lib/seat-assignment";

const aircraftIds = AIRCRAFT_TYPES.map((aircraft) => aircraft.id) as [string, ...string[]];

const schema = z.object({
  flightNumber: z
    .string()
    .trim()
    .min(2, "Enter a valid flight number")
    .max(10, "Flight number is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters and numbers only"),
  flightDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a flight date"),
  aircraftType: z.enum(aircraftIds, { message: "Select an aircraft type" }),
  crewName: z.string().trim().min(2, "Enter the crew member's name").max(80),
  crewId: z.string().trim().max(20).optional(),
});

export async function createAssignment(
  _prevState: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const parsed = schema.safeParse({
    flightNumber: formData.get("flightNumber"),
    flightDate: formData.get("flightDate"),
    aircraftType: formData.get("aircraftType"),
    crewName: formData.get("crewName"),
    crewId: formData.get("crewId") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { flightNumber, flightDate, aircraftType, crewName, crewId } = parsed.data;
  const normalizedFlightNumber = flightNumber.toUpperCase();

  const aircraft = getAircraftById(aircraftType);
  if (!aircraft) {
    return { status: "error", message: "Unknown aircraft type." };
  }

  const existing = findAssignment(normalizedFlightNumber, flightDate);
  if (existing) {
    return {
      status: "error",
      message: `Flight ${normalizedFlightNumber} on ${flightDate} already has vouchers assigned.`,
      result: {
        flightNumber: normalizedFlightNumber,
        flightDate,
        aircraftId: existing.aircraft_type,
        aircraftName: getAircraftById(existing.aircraft_type)?.name ?? existing.aircraft_type,
        crewName: existing.crew_name,
        seats: JSON.parse(existing.seats) as string[],
        createdAt: existing.created_at,
        duplicate: true,
      },
    };
  }

  const seats = pickRandomSeats(aircraftType, 3);
  const createdAt = new Date().toISOString();

  try {
    insertAssignment({
      flightNumber: normalizedFlightNumber,
      flightDate,
      aircraftType,
      crewName,
      crewId: crewId && crewId.length > 0 ? crewId : null,
      seats,
      createdAt,
    });
  } catch {
    return {
      status: "error",
      message: `Flight ${normalizedFlightNumber} on ${flightDate} was just assigned by someone else. Refresh to see it.`,
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    message: `3 seats assigned for flight ${normalizedFlightNumber}.`,
    result: {
      flightNumber: normalizedFlightNumber,
      flightDate,
      aircraftId: aircraftType,
      aircraftName: aircraft.name,
      crewName,
      seats,
      createdAt,
    },
  };
}
