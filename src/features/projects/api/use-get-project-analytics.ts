import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

// This type is inferred globally, but we might need to manually extend it if Hono inference is tricky across files.
// For now, let's manually adding the missing properties so the client doesn't complain, 
// OR better, trust the inference if it works.
// Given strict TS, let's export a manual type if inference fails.
export type ProjectAnalyticsResponseType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["analytics"]["$get"],
  200
>;

export type ChartDataItem = {
  date: string;
  value: number;
};

export type ChartData = {
  totalRevenue: ChartDataItem[];
  totalExpenses: ChartDataItem[];
  remaining: ChartDataItem[];
};

export const useGetProjectAnalytics = ({
  projectId,
}: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      const response = await client.api.projects[":projectId"][
        "analytics"
      ].$get({
        param: { projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the project analytics.");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
