import { useEffect } from "react";
import { useSavedChatStore } from "@/store/savedChatStore";
import { useChatStore } from "@/store/chatStore";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Clock, MessageSquare, Trash2, Database, X } from "lucide-react";
import { toast } from "sonner";
import { useDeleteChat } from "@/hooks/useChat";

const SavedChats = () => {
  const { session } = useAuthStore();
  const { savedChats, loadSavedChats, removeSavedChat, isLoading } = useSavedChatStore();
  const { setCurrentChatId, setChatTitle } = useChatStore();
  const { deleteChat } = useDeleteChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.id) {
      loadSavedChats(session.user.id);
    }
  }, [session?.user?.id, loadSavedChats]);

  const handleChatClick = (chatId: string, title: string) => {
    setCurrentChatId(chatId);
    setChatTitle(title);
    navigate("/");
  };

  const handleRemoveFromSaved = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent chat selection
    try {
      await removeSavedChat(chatId);
      toast.success("Chat removed from saved");
    } catch (error) {
      console.error("Error removing saved chat:", error);
      toast.error("Failed to remove saved chat");
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent chat selection
    try {
      // Delete from API
      deleteChat({ chatId });

      // Remove from saved chats
      await removeSavedChat(chatId);

      toast.success("Chat deleted permanently");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-astryx mx-auto"></div>
          <p className="mt-4 text-black-60 dark:text-white-60">Loading saved chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black-100 dark:text-white-100 mb-2">
            Saved Chats
          </h1>
          <p className="text-black-60 dark:text-white-60 mb-3">
            {savedChats.length} saved conversation{savedChats.length !== 1 ? "s" : ""}
          </p>

          {/* Cloud Storage Notice */}
          <div className="flex items-center gap-2 text-sm text-black-50 dark:text-white-50 bg-black-05 dark:bg-white-05 border border-black-10 dark:border-white-20 rounded-lg p-3">
            <Database className="w-4 h-4 flex-shrink-0" />
            <span>
              These chats are stored locally on your device and are not synced to the cloud
            </span>
          </div>
        </div>

        {savedChats.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-black-05 dark:bg-white-05 rounded-xl border border-black-10 dark:border-white-20 p-8 max-w-md mx-auto">
              <MessageSquare className="w-16 h-16 text-black-30 dark:text-white-30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-black-70 dark:text-white-70 mb-2">
                No saved chats yet
              </h2>
              <p className="text-black-50 dark:text-white-50 mb-6">
                Click the star icon in any chat to save it for later
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-astryx hover:bg-blue-astryx/80 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Start a new chat
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {savedChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.chatId, chat.title)}
                className="bg-black-05 dark:bg-white-05 border border-black-10 dark:border-white-20 rounded-xl p-4 cursor-pointer hover:border-blue-astryx dark:hover:border-blue-astryx transition-all duration-200 group hover:bg-black-10 dark:hover:bg-white-10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-black-100 dark:text-white-100 mb-2 truncate">
                      {chat.title}
                    </h3>
                    <div className="flex items-center text-sm text-black-60 dark:text-white-60">
                      <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>Saved {formatDate(chat.savedAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleRemoveFromSaved(e, chat.chatId)}
                      className="p-2 text-black-50 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={e => handleDeleteChat(e, chat.chatId)}
                      className="p-2 text-black-50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete chat permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-blue-astryx hover:text-blue-astryx/80 transition-colors font-medium"
          >
            ← Back to chat
          </button>

          <div className="flex items-center gap-2 text-xs text-black-40 dark:text-white-40">
            <Database className="w-3 h-3" />
            <span>Local storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedChats;
