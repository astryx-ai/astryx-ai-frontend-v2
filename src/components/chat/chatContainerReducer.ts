import { ChatState } from "@/enums";
import type { LocalState, LocalAction } from "@/types/chatContainerTypes";

export const initialState: LocalState = {
  chatState: ChatState.INITIAL,
  pendingChatCreation: false,
  pendingMessageResponse: false,
  pendingUserMessage: null,
  newlyCreatedChatIds: new Set(),
  secondaryPanelContent: {
    code: null,
    chart: null,
  },
  isSecondaryPanelOpen: false,
};

export function localStateReducer(state: LocalState, action: LocalAction): LocalState {
  switch (action.type) {
    case "SET_CHAT_STATE":
      return { ...state, chatState: action.payload };
    case "START_CHAT_CREATION":
      return {
        ...state,
        chatState: ChatState.THINKING,
        pendingChatCreation: true,
        pendingUserMessage: action.payload,
      };
    case "COMPLETE_CHAT_CREATION":
      return {
        ...state,
        pendingChatCreation: false,
        pendingUserMessage: null,
        newlyCreatedChatIds: new Set([...state.newlyCreatedChatIds, action.payload]),
      };
    case "START_MESSAGE_RESPONSE":
      return {
        ...state,
        chatState: ChatState.THINKING,
        pendingMessageResponse: true,
      };
    case "COMPLETE_MESSAGE_RESPONSE":
      return {
        ...state,
        chatState: ChatState.CHATTING,
        pendingMessageResponse: false,
      };
    case "SET_SECONDARY_PANEL_CONTENT":
      return {
        ...state,
        secondaryPanelContent: {
          ...state.secondaryPanelContent,
          ...action.payload,
        },
        isSecondaryPanelOpen: true,
      };
    case "TOGGLE_SECONDARY_PANEL":
      return {
        ...state,
        isSecondaryPanelOpen:
          action.payload !== undefined ? action.payload : !state.isSecondaryPanelOpen,
      };
    case "RESET_TO_INITIAL":
      return initialState;
    default:
      return state;
  }
}
