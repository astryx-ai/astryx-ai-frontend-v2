import { ArrowRight, Paperclip, X, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "./ui/textarea";
import { ChatState } from "@/enums";
import { motion } from "framer-motion";
import DropdownSelector from "./ui/DropdownSelector";
import { agents, models, history } from "@/constants/promptInput";
import useSpeechToText from "@/hooks/useSpeechToText";
import "@/App.css";

declare global {
  interface Window {
    toast?: (msg: string, opts?: { type?: string }) => void;
  }
}

interface PromptInputProps {
  onSubmit?: (message: string) => void;
  chatState: ChatState;
  isThinking?: boolean;
}

const PromptInput = ({ onSubmit, chatState, isThinking }: PromptInputProps) => {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const thinking = isThinking ?? chatState === ChatState.THINKING;

  const { supported, listening, interimTranscript, stopListening, toggleListening, clearInterim } =
    useSpeechToText({
      autoResizeRef: inputRef,
      // The hook will emit a fully-normalized chunk (with leading space if needed, and proper casing).
      // So just append it directly with no extra spaces here.
      onCommit: (normalizedAppendChunk: string) => {
        setInputValue(prev => (prev || "") + normalizedAppendChunk);
      },
      language: "en-US",
      respectSentenceCase: true,
    });

  useEffect(() => {
    if (typeof window !== "undefined" && !supported) {
      console.warn("Speech recognition is not supported in this browser");
    }
  }, [supported]);

  const showToast = (msg: string) => {
    if (window.toast) {
      // If you have a global toast system
      window.toast(msg, { type: "error" });
    } else {
      alert(msg);
    }
  };

  const handleMicClick = () => {
    const lastChar = getPrevEndChar();
    toggleListening(lastChar);
  };

  // In handleInputChange function, add a small delay before clearing interim
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    if (listening) {
      const lastChar = getPrevEndChar();
      stopListening(lastChar);
      // Small delay to ensure speech recognition stops before clearing
      setTimeout(() => clearInterim(), 100);
    }

    setInputValue(value);

    queueMicrotask(() => {
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = inputRef.current.scrollHeight + "px";
      }
    });
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(
      file => file.type.startsWith("image/") || file.type === "application/pdf"
    );
    const invalidFiles = files.filter(
      file => !file.type.startsWith("image/") && file.type !== "application/pdf"
    );
    if (invalidFiles.length > 0) {
      showToast("Only images and PDF files are supported.");
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };
  // Helper: compute last committed char (without interim)
  const getPrevEndChar = () => {
    const prev = (inputValue || "").trimEnd();
    return prev.slice(-1) || "";
  };

  // On submit, stop listening first with context
  const handleSubmit = () => {
    if (thinking) return;
    if (listening) {
      const lastChar = getPrevEndChar();
      stopListening(lastChar);
    }

    const message = (inputValue || "").trim();
    if ((message || uploadedFiles.length > 0) && onSubmit) {
      onSubmit(message);
      setInputValue("");
      clearInterim();
    }
  };

  // Render committed + interim; no extra spaces here
  const liveValue = inputValue + (interimTranscript ? interimTranscript : "");

  return (
    <div
      className={`sticky w-full bottom-0 z-10  mx-auto ${chatState === ChatState.INITIAL ? "mt-10 max-w-3xl" : "mt-4 max-w-5xl"}`}
    >
      <form
        className={`border-2 shdw-box p-4 rounded-lg bg-white border-(--primary-blue) dark:border-[#4b4b4b] dark:bg-black-85 shadow-white/10 hover:shadow-sm transition-all duration-200 cursor-text ${chatState === ChatState.CHATTING ? "flex justify-between items-center" : null}`}
        onClick={handleContainerClick}
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors
                  bg-white border-gray-200 text-gray-900
                  dark:bg-black-80 dark:border-white/10 dark:text-white-100"
              >
                <span className="truncate max-w-[120px] flex items-center gap-1">{file.name}</span>
                <button
                  onClick={e => {
                    e.preventDefault();
                    removeFile(index);
                  }}
                  className="text-gray-400 hover:text-gray-700 dark:text-white/50 dark:hover:text-white transition-colors p-1 rounded-full"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Textarea
          ref={inputRef}
          value={liveValue}
          onChange={handleInputChange}
          onKeyPress={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!thinking) handleSubmit();
            }
          }}
          placeholder={listening ? "Listening... Speak now" : "How may I help you?"}
          className={`w-full outline-none border-none resize-none min-h-[40px] max-h-[200px] text-gray-900 dark:text-white !placeholder-(--primary-blue) dark:!placeholder-gray-400 md:text-[16px] bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto styled-scrollbar ${chatState === ChatState.INITIAL ? "p-0" : null}`}
          rows={1}
          onInput={e => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}
        />

        <div
          className={`flex gap-2 justify-between ${chatState === ChatState.INITIAL ? "mt-4" : null}`}
        >
          {chatState !== ChatState.CHATTING && (
            <div className="flex items-center gap-2">
              {/* Agents Dropdown */}
              <DropdownSelector
                options={agents}
                selected={selectedAgent}
                onSelect={option => setSelectedAgent(option)}
                dropdownClassName={
                  chatState === ChatState.INITIAL ? "top-full" : "bottom-[calc(100%+6px)]"
                }
              />

              {/* Models Dropdown */}
              <DropdownSelector
                options={models}
                selected={selectedModel}
                onSelect={option => setSelectedModel(option)}
                dropdownClassName={
                  chatState === ChatState.INITIAL ? "top-full" : "bottom-[calc(100%+6px)]"
                }
              />

              {supported && (
                <button
                  onClick={e => {
                    e.preventDefault();
                    handleMicClick();
                  }}
                  className={`p-1 transition-all duration-200 ${
                    listening
                      ? "text-red-500 opacity-100 animate-pulse"
                      : "opacity-30 hover:opacity-80"
                  }`}
                  title={listening ? "Stop recording" : "Start speech recognition"}
                >
                  {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={e => {
                  e.preventDefault();
                  handlePaperclipClick();
                }}
                className="p-1 opacity-30 hover:opacity-80 transition-all duration-200"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            type="button"
            className="bg-blue-astryx hover:bg-blue-600 dark:bg-white dark:text-black text-white p-2 rounded-full transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={(!liveValue.trim() && uploadedFiles.length === 0) || thinking}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {chatState === ChatState.INITIAL && (
        <motion.div
          initial={{ height: "fit-content", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mt-6 flex gap-2 overflow-x-auto items-center justify-center"
        >
          {history.map(item => (
            <button
              key={item.id}
              onClick={() => setInputValue(item.prompt)}
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 max-w-[200px] w-fit truncate hover:bg-(--primary-blue) cursor-pointer dark:hover:bg-white/5 hover:border-(--primary-blue) hover:text-white transition-all duration-200 text-sm"
            >
              {item.prompt}
            </button>
          ))}
          <button
            onClick={() => setInputValue("")}
            className="text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer text-sm"
          >
            clear history...
          </button>
        </motion.div>
      )}

      {(showAgentDropdown || showModelDropdown) && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => {
            setShowAgentDropdown(false);
            setShowModelDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default PromptInput;
