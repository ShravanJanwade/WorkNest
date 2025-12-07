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
      if ((data as any).requireMfa) {
        toast.info("MFA Verification Required");
        const params = new URLSearchParams({
          userId: (data as any).userId,
          email: (data as any).email,
        });

        localStorage.setItem("mfa_temp_email", (data as any).email);
        sessionStorage.setItem("mfa_temp_pass", variables.json.password);

        router.push(`/mfa-verify?userId=${(data as any).userId}`);
        return;
      }

      localStorage.removeItem("mfa_temp_email");
      sessionStorage.removeItem("mfa_temp_pass");

      toast.success("Logged in.");

      try {
        const res = await client.api.auth.current.$get();
        if (res.ok) {
          const result = await res.json();
          const userData = result.data;

          if (userData && (userData as any).prefs?.isSuperAdmin) {
            router.push("/superadmin");
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch {
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
