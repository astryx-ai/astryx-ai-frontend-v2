import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/hooks/api";

export type SupportEmailPayload = {
  username: string;
  useremail: string;
  issue: string;
};

export const useSendSupportEmail = () => {
  return useMutation({
    mutationKey: ["sendSupportEmail"],
    mutationFn: async (payload: SupportEmailPayload) => {
      const response = await apiClient.post("/third-party/send-email", payload);
      return response.data;
    },
  });
};
