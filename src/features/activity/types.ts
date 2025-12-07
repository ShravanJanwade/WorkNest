import { Models } from "node-appwrite";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "status_changed"
  | "priority_changed"
  | "assignee_changed"
  | "comment_added"
  | "time_logged"
  | "sprint_changed";

export type ActivityLog = Models.Document & {
  taskId: string;
  userId: string;
  action: ActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: string;
};

export type ActivityLogWithUser = ActivityLog & {
  user: {
    name: string;
    email: string;
    $id: string;
  };
};
