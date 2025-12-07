import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login.$post({ json });
      return await response.json();
    },
    onSuccess: async () => {
      toast.success("Logged in.");
      
      // Fetch current user to check if Super Admin
      try {
        const res = await client.api.auth.current.$get();
        const userData = await res.json();
        
        if (userData && (userData as any).prefs?.isSuperAdmin) {
          // Super Admin goes to super admin panel
          router.push("/superadmin");
        } else {
          // Regular users go to dashboard
          router.push("/");
        }
      } catch {
        // Fallback to dashboard
        router.push("/");
      }
      
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Failed to log in.");
    },
  });

  return mutation;
};
