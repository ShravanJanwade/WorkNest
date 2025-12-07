import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.auth.register)["$post"]
>;
type RequestType = InferRequestType<(typeof client.api.auth.register)["$post"]>;

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.register.$post({ json });
      return await response.json();
    },
    onSuccess: (data) => {
      // Check if verification is needed
      if ((data as any).requireVerification) {
          toast.success("Account created! Please check your email to verify.");
          // We can redirect to a "check email" bridge page or just let them login (which will block/ask for verification)
          // For now, redirect to dashboard but middleware might intercept?
          // Actually, we'll redirect to a verify-request page.
          router.push("/verify-email");
          return;
      }
      
      toast.success("Signed up.");
      router.push("/dashboard");
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Failed to sign up.");
    },
  });

  return mutation;
};
