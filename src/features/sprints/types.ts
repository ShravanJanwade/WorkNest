import { Models } from "node-appwrite";

export type SprintStatus = "planned" | "active" | "completed";

export type Sprint = Models.Document & {
  workspaceId: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
};

export type SprintWithStats = Sprint & {
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    remainingTasks: number;
  };
};
