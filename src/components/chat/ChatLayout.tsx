import AiMsg from "./AiMsg";
import UserMsg from "./UserMsg";
import PromptInput from "../PromptInput";
import AnimatedStratergy from "../AnimatedStratergy";
import TypeWriterAiMsg from "../TypeWriterAiMsg";
import SecondaryPanel from "./SecondaryPanel";
import { Spinner } from "../ui/spinner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable";
import { useTheme } from "@/lib/useTheme";
import { ChatState } from "@/enums";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types/chatType";
import type { ChartPayload } from "@/types/chartType";

interface ChatLayoutProps {
  // State from hooks
  chatState: ChatState;
  currentMessages: Message[];
  showInitialState: boolean;
  isThinking: boolean;
  isLoadingChatMessages?: boolean;
  handlePromptSubmit: (message: string) => void;

  // Secondary panel props
  setSecondaryPanelContent: (content: {
    code?: string | null;
    chart?: ChartPayload | null;
  }) => void;
  toggleSecondaryPanel: (isOpen?: boolean) => void;
  secondaryPanelContent: { code: string | null; chart: ChartPayload | null };
  isSecondaryPanelOpen: boolean;

  // Optional customization
  showLoadingSpinner?: boolean;
}

const ChatLayout = ({
  chatState,
  currentMessages,
  showInitialState,
  isThinking,
  isLoadingChatMessages = false,
  handlePromptSubmit,
  showLoadingSpinner = true,
  setSecondaryPanelContent,
  toggleSecondaryPanel,
  secondaryPanelContent,
  isSecondaryPanelOpen,
}: ChatLayoutProps) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  // Secondary panel state
  const [isMaximized, setIsMaximized] = useState(false);
  // To remember chat session
  const chatSessionId = currentMessages.map(chatId => chatId.id);

  const handleClosePanel = () => {
    toggleSecondaryPanel(false);
  };

  const handleMaximizePanel = () => {
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const activeScrollRef = isMobile ? mobileScrollContainerRef : scrollContainerRef;

    if (activeScrollRef.current) {
      const timeout = setTimeout(() => {
        activeScrollRef.current!.scrollTop = activeScrollRef.current!.scrollHeight;
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [chatSessionId, currentMessages.length, isThinking]);

  return (
    <div className="w-full h-full bg-white dark:bg-black-90 overflow-hidden relative">
      {/* Desktop Layout */}
      <div className="hidden md:block w-full h-full">
        <ResizablePanelGroup direction="horizontal" className="">
          <ResizablePanel
            defaultSize={isSecondaryPanelOpen ? 70 : 100}
            minSize={isSecondaryPanelOpen ? (isMaximized ? 0 : 30) : 100}
            maxSize={isMaximized ? 0 : 100}
          >
            <div
              ref={scrollContainerRef}
              className="h-[calc(100vh-75px)] overflow-y-auto p-4 pb-0 max-h-[calc(100vh-75px)] scroll-smooth relative flex flex-col "
            >
              <div
                className={`max-w-3xl lg:max-w-5xl mx-auto flex-1 flex flex-col relative w-full  ${
                  showInitialState ? "pt-[16%] md:pt-[8%]" : "pt-0"
                }`}
              >
                <AnimatePresence>
                  {showInitialState && (
                    <motion.div
                      initial={{ height: "fit-content", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="flex flex-col gap-4 text-xl sm:text-2xl md:text-3xl font-medium text-center font-family-parkinsans"
                    >
                      <p className="text-(--primary-blue) dark:text-white-100">
                        Build, test, and execute strategies,
                      </p>
                      <p className="text-(--primary-blue) dark:text-white-100">
                        Let Astryx do it all for you!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  key="chat-messages"
                  initial={{ height: "0", opacity: 0 }}
                  animate={{ height: showInitialState ? "0" : "100%", opacity: 1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className={`${
                    showInitialState ? "flex-grow-0" : "flex-grow mb-6 "
                  } scroll-smooth relative`}
                >
                  {!showInitialState && (
                    <div className="flex flex-col gap-4 md:gap-6">
                      {/* Loading spinner for empty chats */}
                      {showLoadingSpinner &&
                        isLoadingChatMessages &&
                        currentMessages.length === 0 && (
                          <div className="flex-1 flex items-center justify-center min-h-[200px]">
                            <Spinner size="large" className="text-black-20 dark:text-white-40" />
                          </div>
                        )}
                      {/* Messages */}
                      {currentMessages.map(message => (
                        <div key={message.id}>
                          {message.isAi ? (
                            <TypeWriterAiMsg
                              content={message.content}
                              theme={theme}
                              isNewMessage={message.isNewMessage || false}
                              responseTime={message.responseTime}
                              setSecondaryPanelContent={setSecondaryPanelContent}
                              aiChartData={message.aiChartData}
                              sourceLinkPreview={message.aiResponseSources}
                            />
                          ) : (
                            <UserMsg message={message.content} />
                          )}
                        </div>
                      ))}

                      {/* Thinking state */}
                      {isThinking && currentMessages.length > 0 && (
                        <AiMsg chatState={ChatState.THINKING} />
                      )}

                      <div ref={messagesEndRef} className="h-1" />
                    </div>
                  )}
                </motion.div>
                <PromptInput
                  onSubmit={handlePromptSubmit}
                  chatState={chatState}
                  isThinking={isThinking}
                />

                <AnimatePresence>
                  {showInitialState && (
                    <AnimatedStratergy handlePromptSubmit={handlePromptSubmit} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ResizablePanel>

          {isSecondaryPanelOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={isMaximized ? 100 : 30}
                minSize={isMaximized ? 100 : 20}
                maxSize={isMaximized ? 100 : 70}
              >
                <SecondaryPanel
                  isMaximized={isMaximized}
                  onMaximize={handleMaximizePanel}
                  onClose={handleClosePanel}
                  codeContent={secondaryPanelContent.code}
                  chartContent={secondaryPanelContent.chart}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full">
        {/* Main chat area */}
        <div
          ref={mobileScrollContainerRef}
          className="h-[calc(100vh-75px)] overflow-y-auto p-4 max-h-[calc(100vh-75px)] scroll-smooth relative flex flex-col"
        >
          <div
            className={`max-w-3xl mx-auto flex-1 flex flex-col relative w-full ${
              showInitialState ? "pt-[16%]" : "pt-0"
            }`}
          >
            <AnimatePresence>
              {showInitialState && (
                <motion.div
                  initial={{ height: "fit-content", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex flex-col gap-4 text-xl sm:text-2xl font-medium text-center font-family-parkinsans"
                >
                  <p className="text-(--primary-blue) dark:text-white-100">
                    Build, test, and execute strategies,
                  </p>
                  <p className="text-(--primary-blue) dark:text-white-100">
                    Let Astryx do it all for you!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key="chat-messages"
              initial={{ height: "0", opacity: 0 }}
              animate={{ height: showInitialState ? "0" : "100%", opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`${
                showInitialState ? "flex-grow-0" : "flex-grow mb-6 "
              } scroll-smooth relative`}
            >
              {!showInitialState && (
                <div className="flex flex-col gap-4">
                  {/* Loading spinner for empty chats */}
                  {showLoadingSpinner && isLoadingChatMessages && currentMessages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                      <Spinner size="large" className="text-black-20 dark:text-white-40" />
                    </div>
                  )}

                  {/* Messages */}
                  {currentMessages.map(message => (
                    <div key={message.id}>
                      {message.isAi ? (
                        <TypeWriterAiMsg
                          content={message.content}
                          theme={theme}
                          isNewMessage={message.isNewMessage || false}
                          responseTime={message.responseTime}
                          setSecondaryPanelContent={setSecondaryPanelContent}
                          aiChartData={message.aiChartData}
                          sourceLinkPreview={message.aiResponseSources}
                        />
                      ) : (
                        <UserMsg message={message.content} />
                      )}
                    </div>
                  ))}

                  {/* Thinking state */}
                  {isThinking && currentMessages.length > 0 && (
                    <AiMsg chatState={ChatState.THINKING} />
                  )}

                  <div ref={messagesEndRef} className="h-1" />
                </div>
              )}
            </motion.div>
            <PromptInput
              onSubmit={handlePromptSubmit}
              chatState={chatState}
              isThinking={isThinking}
            />

            <AnimatePresence>
              {showInitialState && <AnimatedStratergy handlePromptSubmit={handlePromptSubmit} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Secondary Panel Overlay */}
        <AnimatePresence>
          {isSecondaryPanelOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 z-[9999] md:hidden bg-white dark:bg-black-90"
            >
              <SecondaryPanel
                isMaximized={false}
                onMaximize={handleMaximizePanel}
                onClose={handleClosePanel}
                codeContent={secondaryPanelContent.code}
                chartContent={secondaryPanelContent.chart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatLayout;
