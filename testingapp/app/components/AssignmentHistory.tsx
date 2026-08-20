import type { AssignmentRecord } from "@/lib/db";
import { getAircraftById } from "@/lib/aircraft";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type AssignmentHistoryProps = {
  assignments: AssignmentRecord[];
};

export function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  if (assignments.length === 0) {
    return (
      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body items-center py-12 text-center">
          <p className="font-medium">No voucher assignments yet</p>
          <p className="text-sm text-base-content/50">
            Assignments you create above will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <h2 className="card-title">Assignment history</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Date</th>
                <th>Aircraft</th>
                <th>Crew</th>
                <th>Voucher seats</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((record) => {
                const seats = JSON.parse(record.seats) as string[];
                const aircraft = getAircraftById(record.aircraft_type);
                return (
                  <tr key={record.id}>
                    <td className="font-semibold">{record.flight_number}</td>
                    <td className="whitespace-nowrap">
                      {dateFormatter.format(new Date(`${record.flight_date}T00:00:00`))}
                    </td>
                    <td>{aircraft?.name ?? record.aircraft_type}</td>
                    <td>
                      <div>{record.crew_name}</div>
                      {record.crew_id ? (
                        <div className="text-xs text-base-content/40">{record.crew_id}</div>
                      ) : null}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {seats.map((seat) => (
                          <span key={seat} className="badge badge-primary badge-soft badge-sm">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-xs text-base-content/50">
                      {timeFormatter.format(new Date(record.created_at))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
