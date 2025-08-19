# ChatStore

## What it is

`chatStore.ts` is a Zustand store that manages chat state in the application.

## Purpose

- Stores current chat ID and messages
- Manages chat titles
- Handles adding/updating messages per chat
- Initializes new chats

## Key Functions

- `setCurrentChatId()` - Set active chat
- `addMessageToChat()` - Add message to specific chat
- `setChatMessages()` - Replace all messages in a chat
- `initializeChat()` - Create new empty chat
- `clearCurrentChat()` - Reset current chat

## Data Structure

```typescript
{
  currentChatId: string | null,
  chatMessages: Record<string, Message[]>, // chatId -> messages
  chatTitle: string | null
}
```

## Usage

Used by chat components to manage conversation state across the app.
