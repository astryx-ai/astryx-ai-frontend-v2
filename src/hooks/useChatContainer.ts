import { v4 as uuidv4 } from "uuid";
import { useReducer, useEffect, useCallback, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { scrollToBottom } from "@/helper";
import { ChatState } from "@/enums";
import { useNewChat, useGetPreviousChatMessages, useStreamChat } from "./useChat";
import type { Message, NewChatType, AiChartData, SourceLinkPreview } from "@/types/chatType";
import type { ChartPayload } from "@/types/chartType";
import { localStateReducer, initialState } from "@/components/chat/chatContainerReducer";

export const useChatContainer = (
  onChatCreated: (newChat: NewChatType) => void,
  messagesEndRef: React.RefObject<HTMLDivElement | null>
) => {
  const [localState, dispatch] = useReducer(localStateReducer, initialState);

  // Chat store
  const {
    currentChatId,
    chatMessages,
    addMessageToChat: addMessageToStore,
    appendToMessageContent,
    updateMessageById,
    setChatMessages,
    setCurrentChatId,
    setChatTitle,
    initializeChat,
  } = useChatStore();

  // API hooks
  const { createNewChat, data: newChatData } = useNewChat();
  const { streamChat } = useStreamChat();
  const { getChatMessages, isLoading: isLoadingChatMessages } = useGetPreviousChatMessages(
    currentChatId || "",
    localState.newlyCreatedChatIds.has(currentChatId || "")
  );

  // Computed values
  const currentMessages = currentChatId ? chatMessages[currentChatId] || [] : [];
  const isNewChat = !currentChatId;
  const showInitialState = isNewChat && localState.chatState === ChatState.INITIAL;
  const isThinking = localState.pendingChatCreation || localState.pendingMessageResponse;

  // Auto-scroll helper
  const autoScrollToBottom = useCallback(() => {
    setTimeout(() => scrollToBottom(messagesEndRef), 100);
  }, [messagesEndRef]);

  // Streaming management
  const currentStreamControllerRef = useRef<AbortController | null>(null);
  const responseStartTimeRef = useRef<number | null>(null);

  const startStreamingResponse = useCallback(
    (chatId: string, prompt: string) => {
      // Abort any existing stream
      if (currentStreamControllerRef.current) {
        currentStreamControllerRef.current.abort();
      }

      // Create placeholder AI message
      const aiMessageId = `ai-${uuidv4()}`;
      const aiMessage: Message = {
        id: aiMessageId,
        content: "",
        isAi: true,
        timestamp: new Date().toISOString(),
        isNewMessage: true,
      };
      addMessageToStore(chatId, aiMessage);

      const controller = new AbortController();
      currentStreamControllerRef.current = controller;
      responseStartTimeRef.current = performance.now();

      streamChat({
        chatId,
        content: prompt,
        signal: controller.signal,
        onChunk: delta => {
          appendToMessageContent(chatId, aiMessageId, delta);
        },
        onDone: () => {
          const end = performance.now();
          const responseTime = Math.round(end - (responseStartTimeRef.current || end));
          updateMessageById(chatId, aiMessageId, {
            isNewMessage: false,
            responseTime,
          });
          dispatch({ type: "COMPLETE_MESSAGE_RESPONSE" });
          autoScrollToBottom();
          currentStreamControllerRef.current = null;
          responseStartTimeRef.current = null;
        },
        onError: error => {
          console.error("Streaming error:", error);
          // Mark completion to clear thinking state
          dispatch({ type: "COMPLETE_MESSAGE_RESPONSE" });
          currentStreamControllerRef.current = null;
          responseStartTimeRef.current = null;
        },
      });
    },
    [appendToMessageContent, updateMessageById, addMessageToStore, streamChat, autoScrollToBottom]
  );

  // Abort any ongoing stream when switching chats or unmounting
  useEffect(() => {
    return () => {
      if (currentStreamControllerRef.current) {
        currentStreamControllerRef.current.abort();
        currentStreamControllerRef.current = null;
      }
    };
  }, [currentChatId]);

  // Handle prompt submit - simplified flow
  const handlePromptSubmit = useCallback(
    (message: string) => {
      const userMessage: Message = {
        id: `user-${uuidv4()}`,
        content: message,
        isAi: false,
        timestamp: new Date().toISOString(),
      };

      if (isNewChat) {
        // Start new chat creation
        dispatch({ type: "START_CHAT_CREATION", payload: message });
        createNewChat(message.substring(0, 50));
      } else if (currentChatId) {
        // Add to existing chat
        addMessageToStore(currentChatId, userMessage);
        dispatch({ type: "START_MESSAGE_RESPONSE" });
        startStreamingResponse(currentChatId, message);
        autoScrollToBottom();
      }
    },
    [
      isNewChat,
      currentChatId,
      addMessageToStore,
      startStreamingResponse,
      createNewChat,
      autoScrollToBottom,
    ]
  );

  // Handle chat state changes when switching chats
  useEffect(() => {
    if (isNewChat) {
      dispatch({ type: "RESET_TO_INITIAL" });
    } else if (currentChatId) {
      // Clear secondary panel content when switching chats
      dispatch({ type: "CLEAR_SECONDARY_PANEL_CONTENT" });

      if (currentMessages.length > 0) {
        dispatch({ type: "SET_CHAT_STATE", payload: ChatState.CHATTING });
      } else {
        initializeChat(currentChatId);
      }
    }
  }, [currentChatId, isNewChat, currentMessages.length, initializeChat]);

  // Handle loading existing chat messages
  useEffect(() => {
    if (currentChatId && getChatMessages?.data && Array.isArray(getChatMessages.data)) {
      const transformedMessages: Message[] = getChatMessages.data.map(
        (msg: {
          id?: string;
          content: string;
          isAi?: boolean;
          createdAt?: string;
          aiChartData?: AiChartData[] | null;
          aiResponseSources?: SourceLinkPreview[] | null;
        }) => ({
          id: msg.id || `msg-${uuidv4()}`,
          content: msg.content,
          isAi: msg.isAi || false,
          timestamp: msg.createdAt || new Date().toISOString(),
          aiChartData: msg.aiChartData,
          aiResponseSources: msg.aiResponseSources || null,
        })
      );

      // Reverse the messages array to show newest first
      const reversedMessages = transformedMessages.reverse();

      setChatMessages(currentChatId, reversedMessages);

      if (reversedMessages.length > 0) {
        dispatch({ type: "SET_CHAT_STATE", payload: ChatState.CHATTING });
        autoScrollToBottom();
      }
    }
  }, [currentChatId, getChatMessages?.data, setChatMessages, autoScrollToBottom]);

  // Handle new chat creation completion
  useEffect(() => {
    if (newChatData?.data?.id && localState.pendingChatCreation) {
      const newChatId = newChatData.data.id;

      // Initialize the new chat
      initializeChat(newChatId);
      setCurrentChatId(newChatId);
      setChatTitle(newChatData.data.title);

      // Add the pending user message
      if (localState.pendingUserMessage) {
        const userMessage: Message = {
          id: `user-${uuidv4()}`,
          content: localState.pendingUserMessage,
          isAi: false,
          timestamp: new Date().toISOString(),
        };

        addMessageToStore(newChatId, userMessage);
        dispatch({ type: "START_MESSAGE_RESPONSE" });
        startStreamingResponse(newChatId, localState.pendingUserMessage);
      }

      // Notify parent and complete chat creation
      const newChat: NewChatType = {
        id: newChatId,
        title: newChatData.data.title,
        createdAt: new Date().toISOString(),
        userId: newChatData.data.userId,
      };
      onChatCreated(newChat);
      dispatch({ type: "COMPLETE_CHAT_CREATION", payload: newChatId });
      autoScrollToBottom();
    }
  }, [
    newChatData,
    localState.pendingChatCreation,
    localState.pendingUserMessage,
    initializeChat,
    setCurrentChatId,
    setChatTitle,
    addMessageToStore,
    startStreamingResponse,
    onChatCreated,
    autoScrollToBottom,
  ]);

  // Secondary panel actions
  const setSecondaryPanelContent = useCallback(
    (content: {
      code?: string | string[] | null;
      chart?: ChartPayload | ChartPayload[] | null;
    }) => {
      dispatch({ type: "SET_SECONDARY_PANEL_CONTENT", payload: content });
    },
    []
  );

  const toggleSecondaryPanel = useCallback((isOpen?: boolean) => {
    dispatch({ type: "TOGGLE_SECONDARY_PANEL", payload: isOpen });
  }, []);

  // Note: AI message responses are handled via streaming above

  return {
    localState,
    currentMessages,
    showInitialState,
    isThinking,
    isLoadingChatMessages,
    handlePromptSubmit,
    setSecondaryPanelContent,
    toggleSecondaryPanel,
  };
};
