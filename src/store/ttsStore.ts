import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TTSSettingsState {
  voiceName: string | null;
  rate: number; // 0.1 - 10 (we'll use sensible UI range)
  pitch: number; // 0 - 2
  volume: number; // 0 - 1
}

interface TTSSettingsActions {
  setVoiceName: (name: string | null) => void;
  setRate: (value: number) => void;
  setPitch: (value: number) => void;
  setVolume: (value: number) => void;
  setAll: (values: Partial<TTSSettingsState>) => void;
  resetDefaults: () => void;
}

export type TTSSettingsStore = TTSSettingsState & TTSSettingsActions;

const defaultState: TTSSettingsState = {
  voiceName: "Rishi",
  rate: 1.2,
  pitch: 1.1,
  volume: 1,
};

export const useTTSSettingsStore = create<TTSSettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setVoiceName: (name: string | null) => set({ voiceName: name }),
      setRate: (value: number) => set({ rate: value }),
      setPitch: (value: number) => set({ pitch: value }),
      setVolume: (value: number) => set({ volume: value }),
      setAll: (values: Partial<TTSSettingsState>) => set({ ...get(), ...values }),
      resetDefaults: () => set({ ...defaultState }),
    }),
    {
      name: "tts-settings-storage",
      partialize: state => ({
        voiceName: state.voiceName,
        rate: state.rate,
        pitch: state.pitch,
        volume: state.volume,
      }),
    }
  )
);

export default useTTSSettingsStore;
