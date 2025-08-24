import { v4 as uuidv4 } from "uuid";
import { useReducer, useEffect, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { scrollToBottom } from "@/helper";
import { ChatState } from "@/enums";
import { useNewChat, useAddMessageToChat, useGetPreviousChatMessages } from "./useChat";
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
    setChatMessages,
    setCurrentChatId,
    setChatTitle,
    initializeChat,
  } = useChatStore();

  // API hooks
  const { createNewChat, data: newChatData } = useNewChat();
  const { addMessageToChat: addMessageToAPI, data: messageData } = useAddMessageToChat();
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
        addMessageToAPI({
          chatId: currentChatId,
          content: message,
          isAi: false,
        });
        autoScrollToBottom();
      }
    },
    [
      isNewChat,
      currentChatId,
      addMessageToStore,
      addMessageToAPI,
      createNewChat,
      autoScrollToBottom,
    ]
  );

  // Handle chat state changes when switching chats
  useEffect(() => {
    if (isNewChat) {
      dispatch({ type: "RESET_TO_INITIAL" });
    } else if (currentChatId) {
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
        addMessageToAPI({
          chatId: newChatId,
          content: localState.pendingUserMessage,
          isAi: false,
        });
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
    addMessageToAPI,
    onChatCreated,
    autoScrollToBottom,
  ]);

  // Secondary panel actions
  const setSecondaryPanelContent = useCallback(
    (content: { code?: string | null; chart?: ChartPayload | null }) => {
      dispatch({ type: "SET_SECONDARY_PANEL_CONTENT", payload: content });
    },
    []
  );

  const toggleSecondaryPanel = useCallback((isOpen?: boolean) => {
    dispatch({ type: "TOGGLE_SECONDARY_PANEL", payload: isOpen });
  }, []);

  // Handle AI message responses
  useEffect(() => {
    if (messageData?.data && localState.pendingMessageResponse) {
      const aiMessage: Message = {
        id: `ai-${uuidv4()}`,
        content: messageData.data.content || JSON.stringify(messageData.data),
        isAi: true,
        timestamp: new Date().toISOString(),
        isNewMessage: true,
        responseTime: messageData.responseTime || 0,
        aiChartData: messageData.data.aiChartData,
        aiResponseSources: messageData.data.aiResponseSources || null,
      };

      if (currentChatId) {
        addMessageToStore(currentChatId, aiMessage);

        // If chart data is present, automatically set it in the secondary panel
        if (messageData.data.aiChartData) {
          // Handle both single chart object and array of charts
          const aiChartData = messageData.data.aiChartData;
          const charts = Array.isArray(aiChartData) ? aiChartData : [aiChartData];
          
          if (charts.length > 0) {
            // Transform the first chart to ChartPayload format
            const aiChart = charts[0];
            const chartPayload: ChartPayload = {
              type: aiChart.type,
              title: aiChart.title,
              description: aiChart.description,
              data: aiChart.data.map(point => {
                // Preserve original keys; ensure the numeric dataKey exists
                if (point[aiChart.dataKey] !== undefined) return { ...point } as any;
                // Fallback: if a commonly renamed key exists (e.g. marketCap vs market_share), duplicate it
                if (aiChart.dataKey === "market_share" && point["marketCap"] !== undefined) {
                  return { ...point, [aiChart.dataKey]: point["marketCap"] } as any;
                }
                return { ...point } as any;
              }),
              dataKey: aiChart.dataKey,
              xAxisKey: aiChart.nameKey,
              nameKey: aiChart.nameKey,
            };
            setSecondaryPanelContent({ chart: chartPayload });
          }
        }

        dispatch({ type: "COMPLETE_MESSAGE_RESPONSE" });
        autoScrollToBottom();
      }
    }
  }, [
    messageData,
    localState.pendingMessageResponse,
    currentChatId,
    addMessageToStore,
    setSecondaryPanelContent,
    autoScrollToBottom,
  ]);

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
