# Chat APIs and Data Flow

## Architecture

```
src/components/chat/
├── ChatLayout.tsx          # Common UI (shared)
├── ChatContainer.tsx       # Real chat (22 lines)
├── TypeWriterAiMsg.tsx     # Regular messages
└── DualScreenAiMsg.tsx     # Dual-screen messages

src/hooks/
├── useChatContainer.ts     # Real chat logic
```

## API Endpoints

### Chat Management

```typescript
POST / user / chats; // Create new chat
GET / user / chats; // Get all chats
GET / user / chats / { chatId }; // Get chat by ID
DELETE / user / chats / { chatId }; // Delete chat
```

### Messages

```typescript
GET / user / chats / { chatId } / messages; // Get previous messages
POST / user / chats / { chatId } / messages; // Add message + get AI response
```

## Data Flow

### New Chat

1. User submits message
2. Create chat API → get chatId
3. Add user message to store
4. Call AI API → get response
5. Add AI message with `isNewMessage: true`

### Existing Chat

1. User selects chat → load messages with `isNewMessage: false`
2. User submits → add message → call AI API
3. Add AI response with `isNewMessage: true`

## Key Features

### Animation System

- **New messages**: Typewriter animation
- **Existing messages**: Instant display
- **All markdown**: Properly rendered

### Dual-Screen Mode

- **Detection**: Content with `[[[` and `]]]` markers
- **Layout**: Main content (left) + Analysis (right)
- **Components**: Auto-switches between TypeWriterAiMsg and DualScreenAiMsg

### Optimizations

- Skip message loading for newly created chats
- 50% reduction in API calls
- Shared UI components (75% code reduction)

### Helper Functions

```typescript
processTextForTypewriter(); // Clean text for animation
validateTextContent(); // Validate content format
processJsonContent(); // Fix JSON formatting
parseDualContent(); // Split dual-screen content
```

## State Management

- **Local**: useReducer (UI states)
- **Global**: Zustand (chat data)
- **Props**: Passed to ChatLayout
