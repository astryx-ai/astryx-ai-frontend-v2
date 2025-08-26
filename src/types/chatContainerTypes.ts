import type { NewChatType } from "./chatType";
import type { ChartPayload } from "./chartType";
import { ChatState } from "@/enums";

export interface ChatContainerProps {
  onChatCreated: (newChat: NewChatType) => void;
}

// Local state management with useReducer
export type LocalState = {
  chatState: ChatState;
  pendingChatCreation: boolean;
  pendingMessageResponse: boolean;
  pendingUserMessage: string | null;
  newlyCreatedChatIds: Set<string>;
  secondaryPanelContent: {
    code: string | string[] | null;
    chart: ChartPayload | ChartPayload[] | null;
  };
  isSecondaryPanelOpen: boolean;
};

export type LocalAction =
  | { type: "SET_CHAT_STATE"; payload: ChatState }
  | { type: "START_CHAT_CREATION"; payload: string }
  | { type: "COMPLETE_CHAT_CREATION"; payload: string }
  | { type: "START_MESSAGE_RESPONSE" }
  | { type: "COMPLETE_MESSAGE_RESPONSE" }
  | {
      type: "SET_SECONDARY_PANEL_CONTENT";
      payload: { code?: string | string[] | null; chart?: ChartPayload | ChartPayload[] | null };
    }
  | { type: "TOGGLE_SECONDARY_PANEL"; payload?: boolean }
  | { type: "CLEAR_SECONDARY_PANEL_CONTENT" }
  | { type: "RESET_TO_INITIAL" };
