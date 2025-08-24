import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import useAuthStore from "../store/authStore";
import { useSavedChatStore } from "../store/savedChatStore";
import ChatContainer from "../components/chat/ChatContainer";
import { useState, useEffect } from "react";
import type { NewChatType } from "@/types/chatType";
import { useQueryClient } from "@tanstack/react-query";

function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { session, signOut } = useAuthStore();
  const { loadSavedChats } = useSavedChatStore();
  const queryClient = useQueryClient();

  // Load saved chats when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      loadSavedChats(session.user.id);
    }
  }, [session?.user?.id, loadSavedChats]);

  const handleChatCreated = (newChat: NewChatType) => {
    console.log("New chat created:", newChat);
    // Invalidate and refetch the chats list to show the new chat in sidebar
    queryClient.invalidateQueries({ queryKey: ["get-all-chats"] });
  };

  return (
    <div className="min-h-[100dvh] h-full w-full bg-white hide-scrollbar flex">
      <Sidebar showSidebar={showSidebar} />
      <MobileSidebar isOpen={showMobileSidebar} onClose={() => setShowMobileSidebar(false)} />
      <div className="min-h-full w-full flex flex-col ">
        <Header
          user={session?.user}
          onSignOut={signOut}
          toggleSidebar={() => setShowSidebar(!showSidebar)}
          toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        />
        <div className="flex-grow">
          <ChatContainer onChatCreated={handleChatCreated} />
        </div>
      </div>
    </div>
  );
}

export default Home;
