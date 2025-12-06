import { Models } from "node-appwrite";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export enum TaskPriority {
  HIGHEST = "HIGHEST",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  LOWEST = "LOWEST",
}

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  priority?: TaskPriority;
  workspaceId: string;
  assigneeId: string;
  projectId: string;
  sprintId?: string;
  position: number;
  dueDate: string;
  description?: string;
  estimatedHours?: number;
  labels?: string[];
  parentId?: string;
  epicId?: string;
  storyPoints?: number;
};
