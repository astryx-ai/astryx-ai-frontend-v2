import { PanelLeft, Star, Menu, AlarmClockCheck } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import type { User } from "@supabase/supabase-js";
import { useTheme } from "@/lib/useTheme";
import { toast } from "sonner";
import ThemeToggleIcon from "./ui/ThemeToggleIcon";
import { useChatStore } from "@/store/chatStore";
import { useSavedChatStore } from "@/store/savedChatStore";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import SchedulerReminder from "./SchedulerReminder";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface HeaderProps {
  toggleSidebar?: () => void;
  toggleMobileSidebar?: () => void;
  user: User | undefined;
  onSignOut: () => void;
}

const Header = ({ toggleSidebar, toggleMobileSidebar, user, onSignOut }: HeaderProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { chatTitle, currentChatId } = useChatStore();
  const { saveChat, isChatSaved, removeSavedChat } = useSavedChatStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSaveChat = async () => {
    if (!currentChatId || !chatTitle || !user?.id) {
      toast.error("No chat to save");
      return;
    }

    if (isCurrentChatSaved) {
      await removeSavedChat(currentChatId);
      toast.success("Chat removed from saved chats");
    } else {
      await saveChat(currentChatId, chatTitle, user.id);
      toast.success("Chat saved to saved chats");
    }
  };

  const isCurrentChatSaved = currentChatId ? isChatSaved(currentChatId) : false;

  const handleRefetchDataOverChange = () => {
    queryClient.invalidateQueries({ queryKey: ["get-all-tasks", 1, 10] });
    setIsPopoverOpen(true);
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden sticky top-0 z-10 bg-white dark:bg-black-85 md:flex items-center justify-between p-4 border-black-10 dark:border-white-30 border-b-0.5">
        <div className="flex items-center gap-4">
          <PanelLeft
            onClick={toggleSidebar}
            className="w-5 h-5 text-black-100 dark:text-white-100 cursor-pointer"
          />
          {chatTitle && (
            <Star
              onClick={handleSaveChat}
              className={`w-5 h-5 cursor-pointer transition-colors ${
                isCurrentChatSaved
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-black-100 dark:text-white-100 hover:text-yellow-500"
              }`}
            />
          )}
          <p className="text-black-40 dark:text-white-80 font-medium">{chatTitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggleIcon theme={theme} onToggle={handleThemeToggle} />
          <div className="relative">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild onClick={handleRefetchDataOverChange}>
                <div>
                  <button
                    className="p-1 text-black-100 dark:text-white-100 cursor-pointer focus-within:text-blue-600 dark:hover:text-white-100 transition-colors"
                    title="Task Scheduler"
                  >
                    <AlarmClockCheck className="w-5 h-5 " />
                  </button>
                  {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">3</span>
                  </div> */}
                </div>
              </PopoverTrigger>
              <PopoverContent className="bg-transparent shadow-none border-none p-0 !translate-x-[-110px] w-[380px]">
                <SchedulerReminder closePopover={() => setIsPopoverOpen(false)} />
              </PopoverContent>
            </Popover>
          </div>

          <ProfileDropdown user={user} onSignOut={onSignOut} />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-black-85 flex items-center justify-center p-4 border-black-10 dark:border-white-30 border-b-0.5">
        <Menu
          onClick={toggleMobileSidebar}
          className="w-5 h-5 text-black-100 dark:text-white-100 absolute left-4 cursor-pointer"
        />
        <img
          src={theme === "dark" ? "/logo/logo-white.svg" : "/logo/logo.svg"}
          alt="logo"
          className="h-8 rounded-full"
        />
        <ThemeToggleIcon theme={theme} onToggle={handleThemeToggle} isAbsolute={true} />
        <div className="absolute right-14">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="p-1 text-black-100 dark:text-white-100 cursor-pointer focus-within:text-blue-600 dark:hover:text-white-100 transition-colors"
                title="Task Scheduler"
                onClick={() => setIsSheetOpen(true)}
              >
                <AlarmClockCheck className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent className="bg-black-80">
              <SheetHeader className="hidden">
                <SheetTitle>Task Scheduler</SheetTitle>
                <SheetDescription>Provided your scheduled task update</SheetDescription>
              </SheetHeader>
              <SchedulerReminder closeSheet={() => setIsSheetOpen(false)} />
              <SheetFooter>
                <Button type="submit" onClick={() => navigate("/task-scheduler")}>
                  Show More
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-medium">3</span>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Header;
