import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "./api";
import type { NewChatType, AddNewMessageType } from "../types/chatType";
import type { ApiResponse } from "../types/apiType";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

const useNewChat = () => {
  const {
    mutate,
    data,
    isPending,
    error,
  }: UseMutationResult<ApiResponse<NewChatType>, Error, string> = useMutation<
    ApiResponse<NewChatType>,
    Error,
    string
  >({
    mutationKey: ["new-chat"],
    mutationFn: async (title: string) => {
      const response = await apiClient.post("/user/chats", { title });
      return response.data;
    },
  });

  return { createNewChat: mutate, data, isLoading: isPending, error };
};

const useAddMessageToChat = () => {
  const {
    mutate,
    data,
    isPending,
    error,
  }: UseMutationResult<
    ApiResponse<AddNewMessageType> & { responseTime?: number },
    Error,
    { chatId: string; content: string; isAi: boolean }
  > = useMutation<
    ApiResponse<AddNewMessageType> & { responseTime?: number },
    Error,
    { chatId: string; content: string; isAi: boolean }
  >({
    mutationKey: ["add-message-to-chat"],
    mutationFn: async ({ chatId, content, isAi }) => {
      const startTime = performance.now();
      const response = await apiClient.post(`/user/chats/${chatId}/messages`, { content, isAi });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        ...response.data,
        responseTime,
      };
    },
  });

  return { addMessageToChat: mutate, data, isLoading: isPending, error };
};

const useGetAllChats = () => {
  const {
    data,
    isLoading,
    error,
  }: UseQueryResult<ApiResponse<NewChatType[]>, Error> = useQuery({
    queryKey: ["get-all-chats"],
    queryFn: async () => {
      const response = await apiClient.get("/user/chats");
      return response.data;
    },
  });

  return { getAllChats: data, isLoading, error };
};

const useGetChatById = (chatId: string) => {
  const {
    data,
    isLoading,
    error,
  }: UseQueryResult<ApiResponse<NewChatType>, Error> = useQuery({
    queryKey: ["get-chat-by-id", chatId],
    queryFn: async () => {
      const response = await apiClient.get(`/user/chats/${chatId}`);
      return response.data;
    },
    enabled: !!chatId,
  });

  return { getChatById: data, isLoading, error };
};

const useGetPreviousChatMessages = (chatId: string, skipNewlyCreated: boolean = false) => {
  const {
    data,
    isLoading,
    error,
  }: UseQueryResult<ApiResponse<AddNewMessageType[]>, Error> = useQuery({
    queryKey: ["get-chat-messages", chatId],
    queryFn: async () => {
      const response = await apiClient.get(`/user/chats/${chatId}/messages`);
      return response.data;
    },
    enabled: !!chatId && !skipNewlyCreated,
  });

  return { getChatMessages: data, isLoading, error };
};

const useDeleteChat = () => {
  const {
    mutate,
    data,
    isPending,
    error,
  }: UseMutationResult<ApiResponse<NewChatType>, Error, { chatId: string }> = useMutation<
    ApiResponse<NewChatType>,
    Error,
    { chatId: string }
  >({
    mutationKey: ["delete-chat"],
    mutationFn: async ({ chatId }) => {
      const response = await apiClient.delete(`/user/chats/${chatId}`);
      return response.data;
    },
  });

  return { deleteChat: mutate, data, isLoading: isPending, error };
};

export {
  useNewChat,
  useAddMessageToChat,
  useGetAllChats,
  useGetChatById,
  useGetPreviousChatMessages,
  useDeleteChat,
};
