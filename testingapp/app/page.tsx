import { AIRCRAFT_TYPES } from "@/lib/aircraft";
import { countAssignments, listAssignments } from "@/lib/db";
import { AssignmentHistory } from "@/app/components/AssignmentHistory";
import { VoucherAssignmentPanel } from "@/app/components/VoucherAssignmentPanel";

function todayISODate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function Home() {
  const assignments = listAssignments();
  const totalAssignments = countAssignments();
  const todayCount = assignments.filter(
    (assignment) => assignment.flight_date === todayISODate(),
  ).length;

  return (
    <div className="min-h-screen">
      <header className="border-b border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-box bg-primary text-primary-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.8c-.5.5-.4 1.4.3 1.7L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 2.7 6.9c.3.7 1.2.8 1.7.3l.8-.7c.4-.3.6-.8.5-1.3Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Voucher Seat Assignment</h1>
            <p className="text-sm text-base-content/60">
              Random voucher seat draws for your airline promotional campaign
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="stats stats-vertical border border-base-300 bg-base-100 shadow-sm sm:stats-horizontal">
          <div className="stat">
            <div className="stat-title">Total assignments</div>
            <div className="stat-value text-primary">{totalAssignments}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Assigned today</div>
            <div className="stat-value text-secondary">{todayCount}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Aircraft types supported</div>
            <div className="stat-value">{AIRCRAFT_TYPES.length}</div>
          </div>
        </div>

        <VoucherAssignmentPanel />

        <AssignmentHistory assignments={assignments} />
      </main>
    </div>
  );
}
