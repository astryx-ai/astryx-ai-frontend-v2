import { useRef } from "react";
import type { ChatContainerProps } from "@/types/chatContainerTypes";
import { useChatContainer } from "@/hooks/useChatContainer";
import ChatLayout from "./ChatLayout";

const ChatContainer = ({ onChatCreated }: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use custom hook for all business logic
  const {
    localState,
    currentMessages,
    showInitialState,
    isThinking,
    isLoadingChatMessages,
    handlePromptSubmit,
    setSecondaryPanelContent,
    toggleSecondaryPanel,
  } = useChatContainer(onChatCreated, messagesEndRef);

  return (
    <ChatLayout
      chatState={localState.chatState}
      currentMessages={currentMessages}
      showInitialState={showInitialState}
      isThinking={isThinking}
      handlePromptSubmit={handlePromptSubmit}
      isLoadingChatMessages={isLoadingChatMessages}
      setSecondaryPanelContent={setSecondaryPanelContent}
      toggleSecondaryPanel={toggleSecondaryPanel}
      secondaryPanelContent={localState.secondaryPanelContent}
      isSecondaryPanelOpen={localState.isSecondaryPanelOpen}
    />
  );
};

export default ChatContainer;
