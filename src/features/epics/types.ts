import { Models } from "node-appwrite";

export type Epic = Models.Document & {
  name: string;
  description: string;
  workspaceId: string;
  projectId: string;
  startDate: string;
  endDate: string;
};
