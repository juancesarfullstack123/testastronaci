export type AssignmentResult = {
  flightNumber: string;
  flightDate: string;
  aircraftId: string;
  aircraftName: string;
  crewName: string;
  seats: string[];
  createdAt: string;
  duplicate?: boolean;
};

export type AssignmentActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  result?: AssignmentResult;
};

export const initialAssignmentState: AssignmentActionState = { status: "idle" };
