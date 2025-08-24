import { useMemo, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import useTTSSettingsStore from "@/store/ttsStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Play, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { voices } = useSpeechSynthesis();
  const navigate = useNavigate();

  const {
    voiceName,
    rate,
    pitch,
    volume,
    setVoiceName,
    setRate,
    setPitch,
    setVolume,
    resetDefaults,
  } = useTTSSettingsStore();

  const [previewText, setPreviewText] = useState("Hello! This is your Astryx read aloud preview.");

  const allowedVoiceNames = useMemo(() => ["Samantha", "Aaron", "Arthur", "Rishi"], []);
  const englishAllowed = useMemo(() => {
    if (!voices) return [] as SpeechSynthesisVoice[];
    const english = voices.filter(v => (v.lang || "").toLowerCase().startsWith("en"));
    // Keep only Samantha, Aaron, Arthur; exclude Albert, Bad News
    return english.filter(v => {
      const name = v.name || "";
      return allowedVoiceNames.some(n => name.includes(n));
    });
  }, [voices, allowedVoiceNames]);

  const selectedVoice = useMemo(() => {
    if (!voices || voices.length === 0) return undefined;
    const byName = voices.find(v => v.name === voiceName);
    if (byName) return byName;
    return englishAllowed[0] || voices[0];
  }, [voices, voiceName, englishAllowed]);

  const handlePreview = () => {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(previewText);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      if (selectedVoice) utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // noop
    }
  };

  const loading = !voices || voices.length === 0;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black-90">
      <div className="mx-auto max-w-5xl px-6 py-6 ">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="border-gray-200 dark:border-white/10 bg-white dark:bg-black-80 text-gray-900 dark:text-white-100 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <ArrowLeft /> Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white-100">Settings</h1>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-medium flex items-center gap-2 text-gray-900 dark:text-white-100">
              Read Aloud
            </h2>

            <Separator className="my-4 bg-gray-200 dark:bg-white/10" />

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Spinner size="small" /> Loading voices...
              </div>
            ) : englishAllowed.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No supported English voices found.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-1 block text-gray-900 dark:text-white-100">Voice</Label>
                  <Select
                    value={voiceName || englishAllowed[0]?.name}
                    onValueChange={val => setVoiceName(val || null)}
                  >
                    <SelectTrigger
                      size="sm"
                      className="min-w-[280px] border-gray-200 dark:border-white/10 bg-white dark:bg-black-80 text-gray-900 dark:text-white-100"
                    >
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {englishAllowed.map(v => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block text-gray-900 dark:text-white-100">
                    Rate: {rate.toFixed(2)}
                  </Label>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={rate}
                    onChange={e => setRate(parseFloat(e.target.value))}
                    className="w-full accent-blue-astryx"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-gray-900 dark:text-white-100">
                    Pitch: {pitch.toFixed(2)}
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={pitch}
                    onChange={e => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-blue-astryx"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-gray-900 dark:text-white-100">
                    Volume: {volume.toFixed(2)}
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-blue-astryx"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <Label className="mb-1 block text-gray-900 dark:text-white-100">Preview text</Label>
              <textarea
                className="w-full p-2 rounded-md bg-white dark:bg-black-80 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-astryx/20"
                rows={3}
                value={previewText}
                onChange={e => setPreviewText(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={handlePreview}
                  className="bg-blue-astryx hover:bg-blue-600 text-white"
                >
                  <Play /> Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 dark:border-white/10 bg-white dark:bg-black-80 text-gray-900 dark:text-white-100 hover:bg-gray-50 dark:hover:bg-white/5"
                  onClick={() => {
                    try {
                      window.speechSynthesis?.cancel();
                    } catch {
                      // noop
                    }
                  }}
                >
                  <Square /> Stop
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto border-gray-200 dark:border-white/10 bg-white dark:bg-black-80 text-gray-900 dark:text-white-100 hover:bg-gray-50 dark:hover:bg-white/5"
                  onClick={resetDefaults}
                >
                  Reset Defaults
                </Button>
              </div>
            </div>
          </div>

          {/* Future settings sections can be added below */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
