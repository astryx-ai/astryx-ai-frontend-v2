import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, STREAM_API_BASE_URL, getAuthToken, getUserId } from "./api";
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

// SSE/streaming utilities
type StreamChatOptions = {
  chatId: string;
  content: string;
  signal?: AbortSignal;
  onChunk?: (delta: string) => void;
  onDone?: (finalText: string) => void;
  onError?: (error: Error) => void;
};

const streamChat = async ({
  chatId,
  content,
  signal,
  onChunk,
  onDone,
  onError,
}: StreamChatOptions) => {
  try {
    const [token, userId] = await Promise.all([getAuthToken(), getUserId()]);

    const res = await fetch(STREAM_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query: content, user_id: userId || "anonymous", chat_id: chatId }),
      signal,
      keepalive: true,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Stream request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let carry = "";
    const newline = "\n";
    let eventLines: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      carry += chunk;

      // Process line-by-line, assembling events separated by blank lines
      let lineBreakIndex: number;
      while ((lineBreakIndex = carry.indexOf(newline)) !== -1) {
        const line = carry.slice(0, lineBreakIndex);
        carry = carry.slice(lineBreakIndex + 1);

        const raw = line.replace(/\r$/, "");
        if (raw.startsWith(":")) {
          // comment like :ok -> treat as event boundary
          if (eventLines.length) {
            eventLines = [];
          }
          continue;
        }

        if (raw.trim() === "") {
          // Blank line -> dispatch event
          if (eventLines.length) {
            const dataLines = eventLines
              .filter(l => l.startsWith("data:"))
              .map(l => l.slice(5).trim());
            const payload = dataLines.join("\n");
            if (payload) {
              try {
                const evt = JSON.parse(payload);
                const delta = typeof evt.text === "string" ? evt.text : "";
                if (delta) {
                  fullText += delta;
                  onChunk?.(delta);
                }
                if (evt.end) {
                  onDone?.(fullText);
                  return;
                }
              } catch {
                // ignore malformed event
              }
            }
            eventLines = [];
          }
          continue;
        }

        // Accumulate event lines
        eventLines.push(raw);
      }

      // Keep carry for partial line; defer processing until newline arrives
    }

    onDone?.(fullText);
  } catch (err: any) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
};

export const useStreamChat = () => ({ streamChat });
