import { ChevronRight, EllipsisVertical, Star, Share, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSavedChatStore } from "@/store/savedChatStore";
import useAuthStore from "@/store/authStore";

interface ChatItemProps {
  chat: {
    id: number;
    name: string;
  };
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onSave?: (id: number) => void;
  onShare?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ChatItem = ({
  chat,
  index,
  isSelected,
  onSelect,
  onSave,
  onShare,
  onDelete,
}: ChatItemProps) => {
  const { saveChat, removeSavedChat, isChatSaved } = useSavedChatStore();
  const { session } = useAuthStore();

  const chatIsAlreadySaved = isChatSaved(chat.id.toString());

  const handleSave = async () => {
    if (!session?.user?.id) return;

    if (chatIsAlreadySaved) {
      await removeSavedChat(chat.id.toString());
    } else {
      await saveChat(chat.id.toString(), chat.name, session.user.id);
    }
    // Still call the original onSave if provided for backwards compatibility
    onSave?.(chat.id);
  };

  const handleShare = () => {
    onShare?.(chat.id);
  };

  const handleDelete = () => {
    onDelete?.(chat.id);
  };

  return (
    <motion.div
      key={chat.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.2 + index * 0.05 }}
      className={`flex items-center gap-1 p-2 rounded-xl cursor-pointer group transition-colors ${
        isSelected ? "bg-black-05 dark:bg-white-05 " : "hover:bg-black-03 dark:hover:bg-white-03"
      }`}
      onClick={() => onSelect(chat.id)}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-5 h-5 text-black-100 dark:text-white-100" />
          </motion.div>
        )}
      </AnimatePresence>

      <p
        className={`w-full whitespace-nowrap truncate ${
          isSelected ? "text-black-90 dark:text-white-90" : "text-white-40 dark:text-white-40"
        }`}
      >
        {chat.name}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className={`${
              isSelected ? "opacity-100" : "opacity-0"
            } group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-black-10 dark:hover:bg-white-10 rounded-md`}
          >
            <EllipsisVertical className="w-4 h-4 text-black-100 dark:text-white-100" />
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40 md:-mr-[160px] md:-mt-4">
          <DropdownMenuItem onClick={handleSave} className="flex items-center gap-2">
            <Star
              className={`w-4 h-4 ${chatIsAlreadySaved ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
            {chatIsAlreadySaved ? "Unsave" : "Save"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default ChatItem;
