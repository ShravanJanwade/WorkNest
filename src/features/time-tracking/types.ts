import { Models } from "node-appwrite";

export type TimeEntry = Models.Document & {
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  description?: string;
  billable?: boolean;
};

export type TimeEntryWithTask = TimeEntry & {
  task?: {
    name: string;
    projectId: string;
  };
  user?: {
    name: string;
    email: string;
  };
};

// For aggregated time data
export type TimeStats = {
  totalMinutes: number;
  billableMinutes: number;
  entriesCount: number;
};
