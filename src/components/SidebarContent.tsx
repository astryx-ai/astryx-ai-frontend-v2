import ChatItem from "./ChatItem";
import useAuthStore from "@/store/authStore";
import ProfileDropdown from "./ProfileDropdown";
import SupportDialog from "./SupportDialog";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/useTheme";
import { useDeleteChat, useGetAllChats } from "@/hooks/useChat";
import { useChatStore } from "@/store/chatStore";
import { useSavedChatStore } from "@/store/savedChatStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Twitter, Hourglass, X, Star, XCircle } from "lucide-react";
import { type NewChatType } from "@/types/chatType";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SidebarContentProps {
  showSidebar: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const SidebarContent = ({ showSidebar, isMobile = false, onClose }: SidebarContentProps) => {
  const { theme } = useTheme();
  const { deleteChat } = useDeleteChat();
  const { session, signOut } = useAuthStore();
  const { setCurrentChatId, clearCurrentChat, currentChatId, setChatTitle } = useChatStore();
  const { removeSavedChat, saveChat: saveChatToStore } = useSavedChatStore();

  // Fetch chats directly in this component
  const [chats, setChats] = useState<NewChatType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { getAllChats, isLoading: isLoadingChats } = useGetAllChats();
  const [showSupportDialog, setShowSupportDialog] = useState(false);

  // Load all chats
  useEffect(() => {
    if (getAllChats?.data) {
      const fetchedChats: NewChatType[] = getAllChats.data.map(chat => ({
        id: chat.id,
        userId: chat.userId,
        title: chat.title,
        createdAt: chat.createdAt || new Date().toISOString(),
      }));
      setChats(fetchedChats);
    }
  }, [getAllChats]);

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSave = async (chatId: number) => {
    if (!session?.user?.id) {
      toast.error("Please log in to save chats");
      return;
    }

    const chat = chats.find(c => c.id === chatId.toString());
    if (!chat) {
      toast.error("Chat not found");
      return;
    }

    await saveChatToStore(chat.id, chat.title, session.user.id);
  };

  const handleChatShare = (chatId: number) => {
    console.log(`Sharing chat ${chatId}`);
    toast.info("Coming soon");
  };

  const handleChatDelete = async (chatId: string) => {
    try {
      // Delete from API
      deleteChat({ chatId });

      // Remove from local state
      setChats(chats.filter(chat => chat.id !== chatId));

      // Remove from saved chats if it exists
      await removeSavedChat(chatId);

      // Clear current chat if it's the one being deleted
      if (currentChatId === chatId) {
        clearCurrentChat();
        setChatTitle("");
      }

      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setChatTitle(chats.find(chat => chat.id === chatId)?.title || "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center justify-between h-10 mb-4">
        <AnimatePresence mode="wait">
          {showSidebar ? (
            <a href={"/"}>
              <motion.img
                key="full-logo"
                src={theme === "dark" ? "/logo/logo-white.svg" : "/logo/logo.svg"}
                alt="logo"
                className="w-auto h-10 cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              />
            </a>
          ) : (
            <a href={"/"}>
              <motion.img
                key="mini-logo"
                src={theme === "dark" ? "/logo/x-white.svg" : "/logo/x.svg"}
                alt="logo"
                className="w-auto h-10 p-2 cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            </a>
          )}
        </AnimatePresence>

        {/* Close button for mobile */}
        {isMobile && (
          <button onClick={onClose} className="p-2 rounded-md outline-none">
            <X className="w-5 h-5 text-black-100 dark:text-white-100 " />
          </button>
        )}
      </div>

      {/* Add Button for Collapsed State */}
      <AnimatePresence>
        {!showSidebar && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { delay: 0, duration: 0.1 } }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <Plus
              className="w-8 h-8 p-2 text-black-40 dark:text-white-70 bg-black-05 dark:bg-white-30 rounded-md flex items-center justify-center cursor-pointer hover:bg-black-10 dark:hover:bg-white-40 transition-colors"
              onClick={() => clearCurrentChat()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Content */}
      <AnimatePresence>
        {(showSidebar || isMobile) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="flex-1 mt-6 md:mt-10 flex flex-col min-h-0"
          >
            {/* Navigation Buttons */}
            <div className="mb-4 flex-shrink-0 space-y-2">
              <Link to={"/"}>
                <button
                  onClick={() => clearCurrentChat()}
                  className="w-full flex items-center gap-2 p-3 border border-black-10 dark:border-white-20 rounded-lg hover:bg-black-05 dark:hover:bg-white-05 transition-colors mb-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-black-100 dark:text-white-100">New Chat</span>
                </button>
              </Link>
              <Link to="/saved">
                <button className="w-full flex items-center gap-2 p-3 border border-black-10 dark:border-white-20 rounded-lg hover:bg-black-05 dark:hover:bg-white-05 transition-colors mb-1 cursor-pointer">
                  <Star className="w-4 h-4" />
                  <span className="text-black-100 dark:text-white-100">Saved Chats</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-between flex-shrink-0">
              <p className="text-black-50 dark:text-white-60 font-medium">Chats</p>
              <Plus
                className="w-4 h-4 cursor-pointer hover:text-black-60 dark:hover:text-white-60 transition-colors"
                onClick={() => clearCurrentChat()}
              />
            </div>

            <div className="flex items-center gap-2 bg-black-05 dark:bg-white-05 rounded-lg p-1 px-2 mt-4 flex-shrink-0">
              <Search className="w-5 h-5 text-black-30 dark:text-white-30" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-black-100 dark:text-white-100 placeholder:text-black-30 dark:placeholder:text-white-30 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-1 hover:bg-black-10 dark:hover:bg-white-10 rounded transition-colors"
                >
                  <XCircle className="w-4 h-4 text-black-40 dark:text-white-40" />
                </button>
              )}
            </div>

            <div className="mt-2 flex-1 min-h-0">
              {isLoadingChats ? (
                <p className="text-gray-500 dark:text-white-50 text-sm mt-4">Loading chats...</p>
              ) : chats.length === 0 ? (
                <p className="text-gray-500 dark:text-white-50 text-sm mt-4">
                  No chats yet. Start a conversation!
                </p>
              ) : filteredChats.length === 0 && searchTerm ? (
                <p className="text-gray-500 dark:text-white-50 text-sm mt-4">
                  No chats found for "{searchTerm}"
                </p>
              ) : (
                <Link
                  to={"/"}
                  className="flex flex-col gap-2 h-full overflow-y-auto hide-scrollbar"
                >
                  {filteredChats.map((chat, index) => (
                    <ChatItem
                      key={chat.id}
                      chat={{ id: parseInt(chat.id), name: chat.title }}
                      index={index}
                      isSelected={currentChatId === chat.id}
                      onSelect={() => handleChatSelect(chat.id)}
                      onSave={handleChatSave}
                      onShare={handleChatShare}
                      onDelete={() => handleChatDelete(chat.id)}
                    />
                  ))}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Section */}
      <motion.div
        className=" items-center justify-between p-4 pb-0 border-black-10 dark:border-white-30 border-t-0.5 mt-auto hidden md:flex"
        animate={{
          flexDirection: showSidebar || isMobile ? "row" : "column",
          gap: showSidebar || isMobile ? "0" : "16px",
        }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {(showSidebar || isMobile) && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10, transition: { delay: 0, duration: 0.2 } }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-black-100 dark:text-white-100 font-medium "
            >
              <button
                onClick={() => setShowSupportDialog(true)}
                className="flex items-center gap-2 text-black-100 dark:text-white-100 font-medium hover:scale-105 transition-all duration-200"
              >
                support
              </button>
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          className="flex items-center gap-4"
          animate={{
            flexDirection: showSidebar || isMobile ? "row" : "column",
            gap: showSidebar || isMobile ? "16px" : "12px",
          }}
          transition={{ duration: 0.3 }}
        >
          <Link to="https://x.com/astryx_ai" target="_blank" rel="noopener noreferrer">
            <Twitter className="w-4 h-4 text-black-40 dark:text-white-60 hover:text-black-60 dark:hover:text-white-80 transition-colors cursor-pointer" />
          </Link>
          <Link to="https://astryx.ai/" target="_blank" rel="noopener noreferrer">
            <Hourglass className="w-4 h-4 text-black-40 dark:text-white-60 hover:text-black-60 dark:hover:text-white-80 transition-colors cursor-pointer" />
          </Link>
        </motion.div>
      </motion.div>

      {isMobile && (
        <motion.div
          className="flex flex-col  pt-4 gap-2 border-black-10 dark:border-white-10 border-t-0.5 mt-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ProfileDropdown user={session?.user} onSignOut={signOut} />
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setShowSupportDialog(true)}
              className="flex items-center gap-2 text-black-100 dark:text-white-100 font-medium hover:text-blue-astryx dark:hover:text-blue-astryx transition-colors"
            >
              support
            </button>
            <div className="flex items-center gap-4">
              <Link to="https://x.com/astryx_ai" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-4 h-4 text-black-40 dark:text-white-60 hover:text-black-60 dark:hover:text-white-80 transition-colors cursor-pointer" />
              </Link>
              <Link to="https://astryx.ai/" target="_blank" rel="noopener noreferrer">
                <Hourglass className="w-4 h-4 text-black-40 dark:text-white-60 hover:text-black-60 dark:hover:text-white-80 transition-colors cursor-pointer" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <SupportDialog open={showSupportDialog} onOpenChange={setShowSupportDialog} />
    </div>
  );
};

export default SidebarContent;
