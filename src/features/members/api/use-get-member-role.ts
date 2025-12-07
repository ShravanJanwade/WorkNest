"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { MemberRole } from "@/features/members/types";

interface UseGetMemberRoleProps {
  workspaceId: string;
}

export const useGetMemberRole = ({ workspaceId }: UseGetMemberRoleProps) => {
  const query = useQuery({
    queryKey: ["member-role", workspaceId],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      
      // The current user's member document will have their role
      // We need to match with current user - for now return first member's role
      // In real implementation, we'd identify current user from members list
      return data.documents.length > 0 ? data.documents[0].role : null;
    },
    enabled: !!workspaceId,
  });

  return query;
};

/**
 * Hook to check if current user has a specific role in workspace
 */
export const useHasRole = (workspaceId: string, allowedRoles: MemberRole[]) => {
  const { data: role, isLoading } = useGetMemberRole({ workspaceId });
  
  return {
    hasRole: role ? allowedRoles.includes(role as MemberRole) : false,
    isLoading,
    role,
  };
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = (workspaceId: string) => {
  return useHasRole(workspaceId, [MemberRole.ADMIN]);
};

/**
 * Hook to check if user is manager or above
 */
export const useIsManagerOrAbove = (workspaceId: string) => {
  return useHasRole(workspaceId, [MemberRole.ADMIN, MemberRole.MANAGER]);
};
