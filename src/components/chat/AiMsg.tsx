import { ChatState } from "@/enums";
import chat from "@/constants/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/useTheme";

const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayText("");
    setIsComplete(false);

    const words = text.split(" ");
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayText(prev => {
          const newText = currentIndex === 0 ? words[0] : prev + " " + words[currentIndex];
          return newText;
        });
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

const AiMsg = ({ chatState }: { chatState: ChatState }) => {
  const { theme } = useTheme();
  const { displayText, isComplete } = useTypewriter(
    chatState === ChatState.CHATTING ? chat : "",
    10 // Speed in milliseconds between words
  );

  return (
    <div className="w-fit ">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-blue-astryx/10 w-fit">
          <img
            src={theme === "dark" ? "/logo/x-white.svg" : "/logo/x.svg"}
            alt="astryx"
            className="w-5 h-5 "
          />
        </div>
        <p className="font-medium text-black-100 dark:text-white-100">Astryx</p>
      </div>

      <div className="mt-4 sm:ml-14 markdown-content">
        {chatState === ChatState.THINKING && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-astryx rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-blue-astryx rounded-full animate-pulse delay-100" />
              <div className="w-2 h-2 bg-blue-astryx rounded-full animate-pulse delay-200" />
            </div>
            <span className="text-gray-500 dark:text-white/50">Thinking...</span>
          </div>
        )}
        {chatState === ChatState.CHATTING && (
          <div className="relative">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayText}</ReactMarkdown>
            {!isComplete && (
              <span className="inline-block w-2 h-5 bg-blue-astryx ml-1 animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiMsg;
