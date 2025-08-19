# useChatContainer Hook

## Overview

Custom hook that manages all chat business logic for real chat containers with API integration.

## Hook Structure

```typescript
export const useChatContainer = (
  onChatCreated: (newChat: NewChatType) => void,
  messagesEndRef: React.RefObject<HTMLDivElement | null>
) => {
  // Returns chat state and handlers
};
```

## State Management

### Local State (useReducer)

```typescript
type LocalState = {
  chatState: ChatState; // INITIAL, THINKING, CHATTING
  pendingChatCreation: boolean; // Creating new chat
  pendingMessageResponse: boolean; // Waiting for AI response
  pendingUserMessage: string | null; // Temp storage during creation
  newlyCreatedChatIds: Set<string>; // Skip API calls for new chats
};
```

### Global State (Zustand)

- `currentChatId` - Active chat ID
- `chatMessages` - All chat messages by ID
- `chatTitle` - Current chat title

## API Integration

```typescript
// Chat management
const { createNewChat, data: newChatData } = useNewChat();

// Message handling
const { addMessageToChat: addMessageToAPI, data: messageData } = useAddMessageToChat();

// Load existing messages (optimized)
const { getChatMessages, isLoading } = useGetPreviousChatMessages(
  currentChatId,
  localState.newlyCreatedChatIds.has(currentChatId) // Skip if newly created
);
```

## Key Functions

### handlePromptSubmit

```typescript
// New chat: Create chat → Add message → Call AI API
// Existing chat: Add message → Call AI API
const handlePromptSubmit = useCallback((message: string) => {
  // Creates user message, manages state transitions
});
```

### autoScrollToBottom

```typescript
// Smooth scroll to latest message
const autoScrollToBottom = useCallback(() => {
  setTimeout(() => scrollToBottom(messagesEndRef), 100);
});
```

## State Transitions

1. **INITIAL** → Submit message → **THINKING** (new chat creation)
2. **THINKING** → AI responds → **CHATTING**
3. **CHATTING** → Submit message → **THINKING** → **CHATTING**

## Effects Management

| Effect         | Purpose             | Trigger                |
| -------------- | ------------------- | ---------------------- |
| Chat switching | Reset/set state     | `currentChatId` change |
| Load messages  | Transform API data  | `getChatMessages.data` |
| Chat creation  | Initialize new chat | `newChatData`          |
| AI responses   | Add AI messages     | `messageData`          |

## Return Values

```typescript
return {
  localState, // Current hook state
  currentMessages, // Messages for active chat
  showInitialState, // Show welcome screen
  isThinking, // Show loading state
  isLoadingChatMessages, // API loading state
  handlePromptSubmit, // Submit handler
};
```

## Usage Example

```typescript
const ChatContainer = ({ onChatCreated }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hookData = useChatContainer(onChatCreated, messagesEndRef);

  return <ChatLayout {...hookData} />;
};
```

## Key Optimizations

- **Skip API calls** for newly created chats
- **Auto-scroll** with smooth timing
- **State persistence** across chat switches
- **Error handling** for API failures
