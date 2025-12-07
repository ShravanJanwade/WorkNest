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
    onSuccess: async (data, variables) => {
        // Check for MFA Requirement
        if ((data as any).requireMfa) {
            toast.info("MFA Verification Required");
            const params = new URLSearchParams({
                userId: (data as any).userId,
                email: (data as any).email,
            });
            
            // Storing temp credentials for re-auth
            localStorage.setItem("mfa_temp_email", (data as any).email);
            sessionStorage.setItem("mfa_temp_pass", variables.json.password);
            
            router.push(`/mfa-verify?userId=${(data as any).userId}`);
            return;
        }

      // Clear temp storage on success (if any existed from previous attempts)
      localStorage.removeItem("mfa_temp_email");
      sessionStorage.removeItem("mfa_temp_pass");
      
      toast.success("Logged in.");
      
      // Fetch current user to check if Super Admin
      try {
        const res = await client.api.auth.current.$get();
        if (res.ok) {
            const result = await res.json();
            const userData = result.data; // Appwrite returns { data: user }
            
            if (userData && (userData as any).prefs?.isSuperAdmin) {
                // Super Admin goes to super admin panel
                router.push("/superadmin");
            } else {
                // Regular users go to dashboard
                router.push("/");
            }
        } else {
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
