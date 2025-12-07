import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

// Define Types manually since we can't infer completely from non-existent client generic yet without rebuild
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
      // @ts-ignore
      const response = await client.api.auth["verify-mfa"].$post({ 
          json: { userId, code, email, password } 
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Verification successful");
      router.push("/");
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error("Invalid code or expired");
    },
  });

  return mutation;
};
