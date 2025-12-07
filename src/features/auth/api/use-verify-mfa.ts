import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type RequestType = {
  userId: string;
  code: string;
  email: string;
  password: string;
};

export const useVerifyMfa = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, RequestType>({
    mutationFn: async ({ userId, code, email, password }) => {
      const response = await client.api.auth["verify-mfa"].$post({
        json: { userId, code, email, password },
      });
      return await response.json();
    },
    onSuccess: async () => {
      toast.success("Verification successful");

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
      toast.error("Invalid code or expired");
    },
  });

  return mutation;
};

