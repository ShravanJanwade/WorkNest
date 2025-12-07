import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

type ResponseType = {
  data: {
    url: string;
    fileId: string;
  };
};

export const useUploadImage = () => {
  const mutation = useMutation<ResponseType, Error, { image: File }>({
    mutationFn: async ({ image }) => {
      const response = await client.api.upload.$post({
        form: { image },
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return await response.json();
    },
  });

  return mutation;
};
