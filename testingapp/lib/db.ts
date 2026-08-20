import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export type AssignmentRecord = {
  id: number;
  flight_number: string;
  flight_date: string;
  aircraft_type: string;
  crew_name: string;
  crew_id: string | null;
  seats: string;
  created_at: string;
};

const globalForDb = globalThis as unknown as { __voucherDb?: DatabaseSync };

function openDatabase(): DatabaseSync {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const database = new DatabaseSync(path.join(dataDir, "voucher-assignments.db"));

  database.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flight_number TEXT NOT NULL,
      flight_date TEXT NOT NULL,
      aircraft_type TEXT NOT NULL,
      crew_name TEXT NOT NULL,
      crew_id TEXT,
      seats TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE (flight_number, flight_date)
    )
  `);

  return database;
}

const db = globalForDb.__voucherDb ?? openDatabase();
if (process.env.NODE_ENV !== "production") {
  globalForDb.__voucherDb = db;
}

export function findAssignment(
  flightNumber: string,
  flightDate: string,
): AssignmentRecord | undefined {
  const stmt = db.prepare(
    "SELECT * FROM assignments WHERE flight_number = ? AND flight_date = ?",
  );
  return stmt.get(flightNumber, flightDate) as AssignmentRecord | undefined;
}

export function insertAssignment(data: {
  flightNumber: string;
  flightDate: string;
  aircraftType: string;
  crewName: string;
  crewId: string | null;
  seats: string[];
  createdAt: string;
}): void {
  const stmt = db.prepare(
    `INSERT INTO assignments
      (flight_number, flight_date, aircraft_type, crew_name, crew_id, seats, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  stmt.run(
    data.flightNumber,
    data.flightDate,
    data.aircraftType,
    data.crewName,
    data.crewId,
    JSON.stringify(data.seats),
    data.createdAt,
  );
}

export function listAssignments(limit = 100): AssignmentRecord[] {
  const stmt = db.prepare("SELECT * FROM assignments ORDER BY id DESC LIMIT ?");
  return stmt.all(limit) as AssignmentRecord[];
}

export function countAssignments(): number {
  const stmt = db.prepare("SELECT COUNT(*) AS count FROM assignments");
  const row = stmt.get() as { count: number };
  return row.count;
}
