import { ArrowRight, Paperclip, X } from "lucide-react";
import { useState, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { ChatState } from "@/enums";
import { motion } from "framer-motion";
import DropdownSelector from "./ui/DropdownSelector";
import { agents, models, history } from "@/constants/promptInput";
import "@/App.css";
// Extend window type for toast if it exists
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

  // Prefer explicit isThinking prop; fall back to chatState value
  const thinking = isThinking ?? chatState === ChatState.THINKING;

  // Toast fallback
  const showToast = (msg: string) => {
    if (window.toast) {
      // If you have a global toast system
      window.toast(msg, { type: "error" });
    } else {
      alert(msg);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (thinking) return;
    if ((inputValue.trim() || uploadedFiles.length > 0) && onSubmit) {
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!thinking) {
        handleSubmit();
      }
    }
  };

  return (
    <div
      className={`sticky w-full bottom-0 z-10 max-w-3xl lg:max-w-5xl mx-auto ${chatState === ChatState.INITIAL ? "mt-10" : "mt-4"}`}
    >
      <form
        className={`border p-4 rounded-xl bg-gray-50 dark:bg-black-85 shadow-white/10 hover:shadow-sm transition-all duration-200 cursor-text`}
        onClick={handleContainerClick}
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Uploaded Files Display */}
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
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="How may I help you?"
          className="w-full outline-none border-none resize-none min-h-[40px] max-h-[200px] text-gray-900 dark:text-white placeholder-gray-500 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 overflow-y-auto styled-scrollbar"
          rows={1}
          onInput={e => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}
        />

        <div className="flex gap-2 justify-between mt-4">
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

          <button
            onClick={handleSubmit}
            type="button"
            className="bg-blue-astryx hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(!inputValue.trim() && uploadedFiles.length === 0) || thinking}
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
          className="mt-4 flex gap-2 overflow-x-auto items-center"
        >
          {history.map(item => (
            <button
              key={item.id}
              onClick={() => setInputValue(item.prompt)}
              className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 max-w-[200px] w-fit truncate hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 transition-all duration-200 text-sm"
            >
              {item.prompt}
            </button>
          ))}
          <button
            onClick={() => setInputValue("")}
            className="text-gray-400 hover:text-gray-600 dark:text-white/50 dark:hover:text-white transition-colors text-sm"
          >
            clear history...
          </button>
        </motion.div>
      )}

      {/* Click outside handler */}
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
