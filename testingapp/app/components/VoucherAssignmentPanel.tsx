"use client";

import { useActionState, useState } from "react";
import { createAssignment } from "@/app/actions";
import { AIRCRAFT_TYPES, getAircraftById, getSeatCount } from "@/lib/aircraft";
import { initialAssignmentState } from "@/lib/assignment-state";
import { SeatMap } from "./SeatMap";

function todayISODate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

type FormValues = {
  flightNumber: string;
  flightDate: string;
  aircraftType: string;
  crewName: string;
  crewId: string;
};

function emptyValues(): FormValues {
  return {
    flightNumber: "",
    flightDate: todayISODate(),
    aircraftType: AIRCRAFT_TYPES[0].id,
    crewName: "",
    crewId: "",
  };
}

export function VoucherAssignmentPanel() {
  const [state, formAction, pending] = useActionState(createAssignment, initialAssignmentState);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [formKey, setFormKey] = useState(0);
  const [copied, setCopied] = useState(false);

  // React's form actions reset the underlying DOM fields to their defaults as soon as a
  // submission starts (regardless of the outcome), which desyncs the DOM from our state.
  // Re-mounting the form after every submission (via `formKey`) keeps `values` as the single
  // source of truth: cleared on success, preserved on error so the user can fix and resubmit.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setFormKey((key) => key + 1);
    if (state.result) {
      setValues((current) => ({
        ...current,
        aircraftType: state.result!.aircraftId,
        ...(state.status === "success"
          ? { flightNumber: "", crewName: "", crewId: "" }
          : null),
      }));
    }
  }

  const aircraft = getAircraftById(values.aircraftType) ?? AIRCRAFT_TYPES[0];
  const highlightSeats = state.result?.seats ?? [];
  const fieldErrors = state.fieldErrors ?? {};

  async function handleCopy() {
    if (!state.result) return;
    await navigator.clipboard.writeText(state.result.seats.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body flex-col gap-6 lg:flex-row lg:items-start">
        <form
          key={formKey}
          action={formAction}
          className="flex w-full flex-col gap-3 lg:w-[340px] lg:shrink-0"
        >
          <div>
            <h2 className="card-title">New voucher assignment</h2>
            <p className="text-sm text-base-content/60">
              Enter the flight and crew details to generate 3 random, non-repeating seats.
            </p>
          </div>

          {state.status !== "idle" && state.message ? (
            <div
              role="alert"
              className={`alert py-2 text-sm ${
                state.status === "success" ? "alert-success" : "alert-error"
              }`}
            >
              <span>{state.message}</span>
            </div>
          ) : null}

          <div className="fieldset">
            <span className="fieldset-legend">Flight number</span>
            <input
              type="text"
              name="flightNumber"
              placeholder="e.g. GA400"
              className="input w-full uppercase"
              maxLength={10}
              defaultValue={values.flightNumber}
              onChange={(event) =>
                setValues((current) => ({ ...current, flightNumber: event.target.value }))
              }
              required
            />
            {fieldErrors.flightNumber ? (
              <span className="text-xs text-error">{fieldErrors.flightNumber[0]}</span>
            ) : null}
          </div>

          <div className="fieldset">
            <span className="fieldset-legend">Flight date</span>
            <input
              type="date"
              name="flightDate"
              className="input w-full"
              defaultValue={values.flightDate}
              onChange={(event) =>
                setValues((current) => ({ ...current, flightDate: event.target.value }))
              }
              required
            />
            {fieldErrors.flightDate ? (
              <span className="text-xs text-error">{fieldErrors.flightDate[0]}</span>
            ) : null}
          </div>

          <div className="fieldset">
            <span className="fieldset-legend">Aircraft type</span>
            <select
              name="aircraftType"
              className="select w-full"
              defaultValue={values.aircraftType}
              onChange={(event) =>
                setValues((current) => ({ ...current, aircraftType: event.target.value }))
              }
            >
              {AIRCRAFT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-base-content/50">
              {aircraft.category} · {getSeatCount(aircraft)} seats
            </span>
          </div>

          <div className="fieldset">
            <span className="fieldset-legend">Crew member name</span>
            <input
              type="text"
              name="crewName"
              placeholder="e.g. Siti Rahma"
              className="input w-full"
              maxLength={80}
              defaultValue={values.crewName}
              onChange={(event) =>
                setValues((current) => ({ ...current, crewName: event.target.value }))
              }
              required
            />
            {fieldErrors.crewName ? (
              <span className="text-xs text-error">{fieldErrors.crewName[0]}</span>
            ) : null}
          </div>

          <div className="fieldset">
            <span className="fieldset-legend">
              Crew ID <span className="font-normal text-base-content/40">(optional)</span>
            </span>
            <input
              type="text"
              name="crewId"
              placeholder="e.g. CC-1042"
              className="input w-full"
              maxLength={20}
              defaultValue={values.crewId}
              onChange={(event) =>
                setValues((current) => ({ ...current, crewId: event.target.value }))
              }
            />
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={pending}>
            {pending ? <span className="loading loading-spinner loading-sm" /> : null}
            Generate 3 voucher seats
          </button>
        </form>

        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{aircraft.name}</h3>
              <p className="text-xs text-base-content/50">{aircraft.category}</p>
            </div>
            {state.result ? (
              <button type="button" onClick={handleCopy} className="btn btn-ghost btn-xs">
                {copied ? "Copied!" : "Copy seats"}
              </button>
            ) : null}
          </div>

          {state.result ? (
            <div className="flex flex-wrap items-center gap-2">
              {state.result.seats.map((seat, index) => (
                <div key={seat} className="badge badge-primary badge-lg gap-1.5 font-semibold">
                  <span className="opacity-60">#{index + 1}</span>
                  {seat}
                </div>
              ))}
              {state.result.duplicate ? (
                <span className="badge badge-warning badge-outline badge-sm">
                  already assigned
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-base-content/50">
              Pick an aircraft to preview its seat map, then generate seats.
            </p>
          )}

          <SeatMap aircraft={aircraft} highlightSeats={highlightSeats} />
        </div>
      </div>
    </div>
  );
}
