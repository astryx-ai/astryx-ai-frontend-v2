import { useEffect, useRef } from "react";
import useTTSSettingsStore from "@/store/ttsStore";

/**
 * Hook to initialize TTS voices when the app starts
 * This ensures voices are loaded and a default voice is selected
 * before the user tries to use TTS functionality
 */
export function useTTSInitialization() {
  const ttsStore = useTTSSettingsStore();
  const initializationAttempted = useRef(false);

  useEffect(() => {
    // Only attempt initialization once
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    const initializeVoices = () => {
      try {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          console.warn("Speech synthesis not supported");
          return;
        }

        const voices = window.speechSynthesis.getVoices();

        // If voices are already loaded, initialize immediately
        if (voices.length > 0) {
          selectDefaultVoice(voices);
          return;
        }

        // If voices aren't loaded yet, wait for the voiceschanged event
        const handleVoicesChanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices();
          if (loadedVoices.length > 0) {
            selectDefaultVoice(loadedVoices);
            // Remove event listener after successful initialization
            window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
          }
        };

        window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

        // Cleanup function
        return () => {
          window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        };
      } catch (error) {
        console.error("Failed to initialize TTS voices:", error);
      }
    };

    const selectDefaultVoice = (voices: SpeechSynthesisVoice[]) => {
      // If user already has a voice selected, validate it still exists
      if (ttsStore.voiceName) {
        const existingVoice = voices.find(v => v.name === ttsStore.voiceName);
        if (existingVoice) {
          console.log("TTS: Using existing voice selection:", existingVoice.name);
          return; // Keep existing selection
        } else {
          console.log("TTS: Previously selected voice no longer available, selecting new default");
        }
      }

      // Define allowed voice names and priority order
      const allowedVoices = ["Samantha", "Arthur", "Aaron", "Rishi"];
      const priorityOrder = ["Rishi", "Arthur", "Samantha", "Aaron"];

      // Filter to English voices that are in our allowed list
      const englishAllowedVoices = voices.filter(voice => {
        const isEnglish = (voice.lang || "").toLowerCase().startsWith("en");
        const isAllowed = allowedVoices.some(allowedVoice => voice.name.includes(allowedVoice));
        return isEnglish && isAllowed;
      });

      // Select voice based on priority order
      for (const preferredVoice of priorityOrder) {
        const foundVoice = englishAllowedVoices.find(voice => voice.name.includes(preferredVoice));
        if (foundVoice) {
          ttsStore.setVoiceName(foundVoice.name);
          console.log("TTS: Initialized with default voice:", foundVoice.name);
          return;
        }
      }

      // Fallback to first available allowed voice
      if (englishAllowedVoices.length > 0) {
        ttsStore.setVoiceName(englishAllowedVoices[0].name);
        console.log("TTS: Initialized with fallback voice:", englishAllowedVoices[0].name);
        return;
      }

      // Final fallback to any available voice
      if (voices.length > 0) {
        ttsStore.setVoiceName(voices[0].name);
        console.log("TTS: Initialized with system default voice:", voices[0].name);
      } else {
        console.warn("TTS: No voices available for initialization");
      }
    };

    // Start initialization
    const cleanup = initializeVoices();

    // Return cleanup function
    return cleanup;
  }, [ttsStore]); // Include ttsStore in dependencies

  return null; // This hook doesn't return anything, it just initializes
}

export default useTTSInitialization;
