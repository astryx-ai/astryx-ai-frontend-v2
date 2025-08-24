import type { RefObject } from "react";
import { useCallback, useRef, useState } from "react";
import { useSpeechRecognition } from "react-speech-kit";

interface UseSpeechToTextOptions {
  onCommit?: (finalText: string) => void;
  autoResizeRef?: RefObject<HTMLTextAreaElement>;
  language?: string;
  respectSentenceCase?: boolean;
}

interface UseSpeechToTextResult {
  supported: boolean | undefined;
  listening: boolean;
  interimTranscript: string;
  startListening: (prevEndChar?: string) => void;
  stopListening: (prevEndChar?: string) => void;
  toggleListening: (prevEndChar?: string) => void;
  clearInterim: () => void;
}

const showToast = (msg: string) => {
  if (typeof window !== "undefined" && (window as any).toast) {
    (window as any).toast(msg, { type: "error" });
  } else if (typeof window !== "undefined") {
    alert(msg);
  }
};

export function useSpeechToText(options?: UseSpeechToTextOptions): UseSpeechToTextResult {
  const { onCommit, autoResizeRef, language = "en-US", respectSentenceCase = true } = options || {};

  const [interimTranscript, setInterimTranscript] = useState<string>("");

  // Session management refs
  const fullTranscriptRef = useRef<string>(""); // Complete transcript for current session
  const lastCommittedLengthRef = useRef<number>(0); // Length of last committed portion
  const prevEndCharRef = useRef<string>(""); // Last char before starting this session
  const manualStopRef = useRef<boolean>(false);

  const setPrevEndChar = useCallback((char: string) => {
    prevEndCharRef.current = char || "";
  }, []);

  const buildLeading = useCallback(
    (text: string) => {
      if (!text) return "";

      const prevEnd = prevEndCharRef.current;
      const needsSpace = prevEnd !== "" && !/\s$/.test(prevEnd) && !/^\s/.test(text);

      // Handle sentence case
      let processedText = text;
      if (respectSentenceCase) {
        const endsSentence = /[.!?]\s*$/.test(prevEnd);
        if (endsSentence && text.length > 0) {
          processedText = text.charAt(0).toUpperCase() + text.slice(1);
        } else if (prevEnd && text.length > 0) {
          processedText = text.charAt(0).toLowerCase() + text.slice(1);
        }
      }

      return (needsSpace ? " " : "") + processedText;
    },
    [respectSentenceCase]
  );

  const commitTranscript = useCallback(() => {
    const fullText = fullTranscriptRef.current.trim();
    const alreadyCommitted = lastCommittedLengthRef.current;

    if (fullText.length > alreadyCommitted) {
      const newContent = fullText.slice(alreadyCommitted);
      if (newContent.trim()) {
        const processedContent = buildLeading(newContent.trim());
        onCommit?.(processedContent);
        lastCommittedLengthRef.current = fullText.length;
      }
    }
  }, [onCommit, buildLeading]);

  const resetSession = useCallback(() => {
    fullTranscriptRef.current = "";
    lastCommittedLengthRef.current = 0;
    setInterimTranscript("");
  }, []);

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (transcript: string, isFinal: boolean) => {
      // Clean up the transcript
      const cleanTranscript = transcript.trim();

      if (!cleanTranscript) return;

      // Update full transcript reference
      fullTranscriptRef.current = cleanTranscript;

      if (isFinal) {
        // Commit the final result
        commitTranscript();
        resetSession();
      } else {
        // Show interim result (only the new part that hasn't been committed)
        const alreadyCommitted = lastCommittedLengthRef.current;
        const interimPart = cleanTranscript.slice(alreadyCommitted);

        if (interimPart) {
          const processedInterim = buildLeading(interimPart);
          setInterimTranscript(processedInterim);
        } else {
          setInterimTranscript("");
        }
      }

      // Auto-resize textarea
      queueMicrotask(() => {
        if (autoResizeRef?.current) {
          autoResizeRef.current.style.height = "auto";
          autoResizeRef.current.style.height = autoResizeRef.current.scrollHeight + "px";
        }
      });
    },

    onEnd: () => {
      // Commit any remaining content when recognition ends
      if (fullTranscriptRef.current.trim()) {
        commitTranscript();
      }
      resetSession();
    },

    onError: (event: any) => {
      console.warn("Speech recognition error:", event);
      resetSession();
    },
  });

  const startListening = useCallback(
    (prevEndChar?: string) => {
      if (!supported) {
        showToast(
          "Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari."
        );
        return;
      }

      manualStopRef.current = false;
      if (typeof prevEndChar === "string") {
        setPrevEndChar(prevEndChar);
      }

      resetSession();

      try {
        listen({
          interimResults: true,
          lang: language,
          continuous: true, // Enable continuous listening
        });
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        showToast("Failed to start speech recognition. Please try again.");
      }
    },
    [language, listen, setPrevEndChar, supported, resetSession]
  );

  const stopListening = useCallback(
    (prevEndChar?: string) => {
      manualStopRef.current = true;
      if (typeof prevEndChar === "string") {
        setPrevEndChar(prevEndChar);
      }

      try {
        stop();
      } catch (error) {
        console.warn("Error stopping speech recognition:", error);
      }
    },
    [stop, setPrevEndChar]
  );

  const toggleListening = useCallback(
    (prevEndChar?: string) => {
      if (listening) {
        stopListening(prevEndChar);
      } else {
        startListening(prevEndChar);
      }
    },
    [listening, startListening, stopListening]
  );

  const clearInterim = useCallback(() => {
    setInterimTranscript("");
    fullTranscriptRef.current = "";
    lastCommittedLengthRef.current = 0;
  }, []);

  return {
    supported,
    listening,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    clearInterim,
  };
}

export default useSpeechToText;
