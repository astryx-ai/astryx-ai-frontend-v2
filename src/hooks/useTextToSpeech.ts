import { useCallback, useMemo, useRef, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import useTTSSettingsStore from "@/store/ttsStore";

interface UseTextToSpeechOptions {
  voiceName?: string;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
  onEnd?: () => void;
}

interface UseTextToSpeechResult {
  supported: boolean | undefined;
  speaking: boolean;
  paused: boolean;
  voices: SpeechSynthesisVoice[] | undefined;
  currentVoice: SpeechSynthesisVoice | undefined;
  speak: (text: string) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  toggle: (text: string) => void;
  setVoiceByName: (name: string) => void;
  setRate: (value: number) => void;
  setPitch: (value: number) => void;
  setVolume: (value: number) => void;
}

const showToast = (msg: string) => {
  if (typeof window !== "undefined" && (window as any).toast) {
    (window as any).toast(msg, { type: "error" });
  } else if (typeof window !== "undefined") {
    alert(msg);
  }
};

export function useTextToSpeech(options?: UseTextToSpeechOptions): UseTextToSpeechResult {
  const ttsStore = useTTSSettingsStore();
  const effectiveRate = options?.rate ?? ttsStore.rate;
  const effectivePitch = options?.pitch ?? ttsStore.pitch;
  const effectiveVolume = options?.volume ?? ttsStore.volume;
  const [paused, setPaused] = useState<boolean>(false);

  const currentTextRef = useRef<string>("");

  const {
    speak: synthSpeak,
    cancel,
    speaking,
    supported,
    voices,
  } = useSpeechSynthesis({
    onEnd: () => {
      setPaused(false);
      options?.onEnd?.();
    },
    onError: () => {
      setPaused(false);
    },
  });

  // Filter and select voice based on allowed voices (Samantha, Arthur, Aaron)
  const currentVoice = useMemo(() => {
    if (!voices || voices.length === 0) return undefined;
    // Define allowed voice names - using consistent casing
    const allowedVoices = ["Samantha", "Arthur", "Aaron", "Rishi"];

    // If a specific voice is requested via options, use it if it's allowed
    if (options?.voiceName) {
      const isAllowed = allowedVoices.some(allowedVoice =>
        options.voiceName!.includes(allowedVoice)
      );
      if (isAllowed) {
        const requestedVoice = voices.find(v => v.name === options.voiceName);
        if (requestedVoice) {
          return requestedVoice;
        }
      }
    }

    // Check if stored voice is valid and allowed - RESPECT USER SELECTION
    if (ttsStore.voiceName) {
      const storedVoice = voices.find(v => v.name === ttsStore.voiceName);
      if (storedVoice) {
        // Check if it's an allowed voice
        const isAllowed = allowedVoices.some(allowedVoice =>
          storedVoice.name.includes(allowedVoice)
        );
        if (isAllowed) {
          return storedVoice;
        }
      }
    }

    // Only use fallback logic if no voice is stored or stored voice is invalid
    // Note: Voice initialization should have already happened in useTTSInitialization
    // This is just a safety fallback
    const priorityOrder = ["Rishi", "Arthur", "Samantha", "Aaron"];

    for (const preferredVoice of priorityOrder) {
      const foundVoice = voices.find(voice => voice.name.includes(preferredVoice));
      if (foundVoice) {
        // Only update store if no voice was previously stored (initialization should handle this)
        if (!ttsStore.voiceName) {
          console.warn("TTS: Fallback voice selection - initialization may have failed");
          ttsStore.setVoiceName(foundVoice.name);
        }
        return foundVoice;
      }
    }

    // Final fallback to first available voice if none of the preferred ones are found
    if (voices.length > 0) {
      // Only update store if no voice was previously stored (initialization should handle this)
      if (!ttsStore.voiceName) {
        console.warn("TTS: Using system default voice - initialization may have failed");
        ttsStore.setVoiceName(voices[0].name);
      }
      return voices[0];
    }

    return undefined;
  }, [voices, options?.voiceName, ttsStore]);

  const pause = useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.pause();
        setPaused(true);
      }
    } catch {
      // noop
    }
  }, []);

  const resume = useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.resume();
        setPaused(false);
      }
    } catch {
      // noop
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported) {
        showToast(
          "Speech synthesis is not supported in your browser. Try Chrome, Edge, or Safari."
        );
        return;
      }
      if (!text || !text.trim()) return;

      currentTextRef.current = text;
      setPaused(false);
      try {
        synthSpeak({
          text,
          voice: currentVoice,
          rate: effectiveRate,
          pitch: effectivePitch,
          volume: effectiveVolume,
        });
      } catch (error) {
        console.error("Failed to start speech synthesis:", error);
        showToast("Failed to start speech. Please try again.");
      }
    },
    [supported, synthSpeak, currentVoice, effectiveRate, effectivePitch, effectiveVolume]
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking || paused) {
        try {
          cancel();
        } catch {
          // noop
        }
      } else {
        speak(text);
      }
    },
    [speaking, paused, cancel, speak]
  );

  const setVoiceByName = useCallback(
    (name: string) => {
      ttsStore.setVoiceName(name || null);
    },
    [ttsStore]
  );

  // No local-setting syncing logic here to avoid feedback loops. The store is the source of truth.

  return {
    supported,
    speaking,
    paused,
    voices,
    currentVoice,
    speak,
    cancel,
    pause,
    resume,
    toggle,
    setVoiceByName,
    setRate: ttsStore.setRate,
    setPitch: ttsStore.setPitch,
    setVolume: ttsStore.setVolume,
  };
}

export default useTextToSpeech;
