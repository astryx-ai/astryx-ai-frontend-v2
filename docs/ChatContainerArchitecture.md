# ChatContainer Architecture Documentation

## Overview

The ChatContainer is the core component that handles real-time chat functionality with AI responses. It manages both new chat creation and existing chat interactions with optimized state management.

## 📁 File Structure

```
src/
├── components/chat/
│   ├── ChatContainer.tsx           # Main UI component (presentational)
│   └── chatContainerReducer.ts     # State management logic
├── hooks/
│   ├── useChatContainer.ts         # Business logic hook
│   └── useChat.ts                  # API hooks
├── types/
│   └── chatContainerTypes.ts       # TypeScript definitions
└── store/
    └── chatStore.ts                # Global chat state (Zustand)
```

## 🎯 Architecture Pattern

### **Separation of Concerns**

- **`ChatContainer.tsx`**: Pure UI rendering, no business logic
- **`useChatContainer.ts`**: All business logic, API calls, state transitions
- **`chatContainerReducer.ts`**: Local state management with useReducer
- **`chatStore.ts`**: Global state management with Zustand

## 📋 Component Breakdown

### **1. ChatContainer.tsx** (88 lines)

```typescript
// Purpose: Clean presentational component
const ChatContainer = ({ onChatCreated }) => {
  const {
    localState,
    currentMessages,
    showInitialState,
    isThinking,
    isLoadingChatMessages,
    handlePromptSubmit,
  } = useChatContainer(onChatCreated, messagesEndRef);

  return (
    // UI rendering only
  );
};
```

**Responsibilities:**

- ✅ Render messages and UI components
- ✅ Handle animations and transitions
- ✅ Display loading states
- ❌ No API calls or business logic

### **2. useChatContainer.ts** (Hook)

```typescript
// Purpose: Centralized business logic
export const useChatContainer = (onChatCreated, messagesEndRef) => {
  const [localState, dispatch] = useReducer(localStateReducer, initialState);

  // All business logic here
  return {
    localState,
    currentMessages,
    showInitialState,
    isThinking,
    isLoadingChatMessages,
    handlePromptSubmit,
  };
};
```

**Responsibilities:**

- ✅ API calls coordination
- ✅ Message handling logic
- ✅ Chat state transitions
- ✅ Auto-scroll management
- ✅ Error handling

### **3. chatContainerReducer.ts** (State Management)

```typescript
// Purpose: Predictable state transitions
type LocalState = {
  chatState: ChatState;
  pendingChatCreation: boolean;
  pendingMessageResponse: boolean;
  pendingUserMessage: string | null;
  newlyCreatedChatIds: Set<string>;
};

type LocalAction =
  | { type: "SET_CHAT_STATE"; payload: ChatState }
  | { type: "START_CHAT_CREATION"; payload: string }
  | { type: "COMPLETE_CHAT_CREATION"; payload: string }
  | { type: "START_MESSAGE_RESPONSE" }
  | { type: "COMPLETE_MESSAGE_RESPONSE" }
  | { type: "RESET_TO_INITIAL" };
```

**State Transitions:**

- `INITIAL` → `THINKING` (user submits message)
- `THINKING` → `CHATTING` (AI responds)
- `CHATTING` → `THINKING` (user sends another message)

### **4. chatStore.ts** (Global State)

```typescript
// Purpose: Persistent chat data across components
interface ChatStore {
  currentChatId: string | null;
  chatMessages: Record<string, Message[]>; // chatId -> messages
  chatTitle: string | null;
  // Methods for updating state
}
```

**Data Structure:**

```typescript
chatMessages = {
  "chat-123": [
    { id: "msg-1", content: "Hello", isAi: false },
    { id: "msg-2", content: "Hi there!", isAi: true, isNewMessage: true }
  ],
  "chat-456": [...]
}
```

## 🔄 State Flow

### **New Chat Creation**

1. User submits message
2. `START_CHAT_CREATION` → `chatState: THINKING`
3. API creates chat → returns `chatId`
4. `COMPLETE_CHAT_CREATION` → store `chatId` in `newlyCreatedChatIds`
5. Add user message → call AI API
6. `START_MESSAGE_RESPONSE` → wait for AI
7. `COMPLETE_MESSAGE_RESPONSE` → `chatState: CHATTING`

### **Existing Chat**

1. User selects chat → `setCurrentChatId(chatId)`
2. Load messages from API (skip if newly created)
3. `SET_CHAT_STATE` → `CHATTING`
4. User submits → `START_MESSAGE_RESPONSE`
5. AI responds → `COMPLETE_MESSAGE_RESPONSE`

## 🎨 Animation System

### **TypeWriter Animation**

- **New messages**: `isNewMessage: true` → typewriter effect
- **Existing messages**: `isNewMessage: false` → instant display
- **Component-level tracking**: Each `TypeWriterAiMsg` instance remembers if it animated

### **Smooth Transitions**

- Chat switching with `motion.div` animations
- Initial state fade-in/out
- Loading spinners for empty chats

## 🚀 Performance Optimizations

### **1. API Optimization**

- Skip `getChatMessages` for newly created chats
- Track `newlyCreatedChatIds` to avoid unnecessary API calls

### **2. Re-render Prevention**

- `useCallback` for stable function references
- `useMemo` in TypeWriter component
- Efficient state updates with useReducer

### **3. Message Management**

- Messages stored by `chatId` for instant switching
- Auto-scroll with timeout for smooth UX
- Cleanup and memory management

## 🔧 Key Features

### **Chat State Management**

- ✅ Real-time message updates
- ✅ Persistent chat history
- ✅ Smooth chat switching
- ✅ Loading states and error handling

### **User Experience**

- ✅ Typewriter animation for new messages
- ✅ No re-animation when switching chats
- ✅ Auto-scroll to latest messages
- ✅ Responsive design with proper spacing

### **Developer Experience**

- ✅ Clean separation of concerns
- ✅ Type-safe with TypeScript
- ✅ Testable architecture
- ✅ Easy to extend and maintain
