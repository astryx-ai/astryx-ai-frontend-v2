import type { DropdownOption } from "@/components/ui/DropdownSelector";

export const history = [
  {
    id: 1,
    prompt: "latest news",
  },
  {
    id: 2,
    prompt: "Market updates",
  },
  {
    id: 3,
    prompt: "Research on Tesla",
  },
];

export const agents: DropdownOption[] = [
  { id: "1", name: "General", description: "All-purpose AI assistant" },
  { id: "2", name: "Research", description: "Specialized in research tasks" },
  { id: "3", name: "Code", description: "Programming and development help" },
];

export const models: DropdownOption[] = [
  { id: "1", name: "GPT-4", description: "Most capable model" },
  { id: "2", name: "Claude", description: "Anthropic's AI assistant" },
  { id: "3", name: "Gemini", description: "Google's multimodal AI" },
];
