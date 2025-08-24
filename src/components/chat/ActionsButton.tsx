import { copyToClipboard } from "@/helper";
import { Check, Copy, ThumbsDown, ThumbsUp, Volume2, Square } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

const ActionsButton = ({ content }: { content: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Use TTS hook - voice filtering is now handled internally in the hook
  const { supported, speaking, paused, toggle, cancel } = useTextToSpeech();

  // Stop TTS when component unmounts or chat changes
  useEffect(() => {
    return () => {
      // Cleanup: stop any ongoing speech when component unmounts
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // noop
      }
    };
  }, []);

  // Handler functions for the action buttons
  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await copyToClipboard(content);
    if (success) {
      setIsCopied(true);
      // Hide the tick after 1 second
      setTimeout(() => setIsCopied(false), 1000);
    }
  };

  const handleGoodResponse = () => {
    setFeedback(feedback === "good" ? null : "good");
  };

  const handleBadResponse = () => {
    setFeedback(feedback === "bad" ? null : "bad");
  };
  return (
    <div className="flex items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
      <button
        onClick={() => {
          if (!supported) return;
          if (speaking || paused) {
            cancel();
          } else {
            // Voice selection is now handled automatically in the hook
            toggle(content);
          }
        }}
        className="p-1.5 rounded hover:bg-black-10 dark:hover:bg-white-20 transition-colors"
        title={speaking || paused ? "Stop reading" : "Read aloud"}
        aria-label={speaking || paused ? "Stop reading" : "Read aloud"}
      >
        {speaking || paused ? (
          <Square className="w-4 h-4 text-black-60 dark:text-white-60" />
        ) : (
          <Volume2 className="w-4 h-4 text-black-60 dark:text-white-60" />
        )}
      </button>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded hover:bg-black-10 dark:hover:bg-white-20 transition-colors"
        title="Copy response"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-black-60 dark:text-white-60" />
        ) : (
          <Copy className="w-4 h-4 text-black-60 dark:text-white-60" />
        )}
      </button>
      <button
        onClick={handleGoodResponse}
        className={`p-1.5 rounded hover:bg-black-10 dark:hover:bg-white-20 transition-colors`}
        title="Good response"
      >
        <ThumbsUp
          className={`w-4 h-4 transition-colors text-black-60 dark:text-white-60 ${
            feedback === "good" ? "fill-current" : ""
          }`}
        />
      </button>
      <button
        onClick={handleBadResponse}
        className={`p-1.5 rounded hover:bg-black-10 dark:hover:bg-white-20 transition-colors`}
        title="Bad response"
      >
        <ThumbsDown
          className={`w-4 h-4 transition-colors text-black-60 dark:text-white-60 ${
            feedback === "bad" ? "fill-current" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default ActionsButton;
