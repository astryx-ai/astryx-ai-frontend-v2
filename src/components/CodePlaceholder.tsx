import { Code2Icon } from "lucide-react";

interface CodePlaceholderProps {
  content: string;
  setSecondaryPanelContent?: (content: { code?: string | null; chart?: any | null }) => void;
}

const CodePlaceholder = ({ content, setSecondaryPanelContent }: CodePlaceholderProps) => {
  return (
    <div className="my-4">
      {/* Code Placeholder */}
      <div
        className="bg-neutral-100 dark:bg-black-85 border-2 border-blue-astryx dark:border-white/10 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-black-80 transition-colors overflow-hidden"
        onClick={() => {
          if (setSecondaryPanelContent) {
            setSecondaryPanelContent({ code: content });
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-20 h-14 rotate-12  bg-blue-astryx/25 dark:bg-white/25 flex justify-center items-center rounded-xl -translate-x-6">
              <Code2Icon className="w-6 h-6 animate-bounce" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click here to see the code in the sidepanel
            </span>
          </div>
          <div className="text-sm text-white dark:text-black-85 bg-blue-astryx dark:bg-white flex justify-center items-center px-4 py-2 rounded-lg backdrop-blur-xs rotate-12 translate-x-7 translate-y-4 h-16 contentTxt transition-all duration-300 ease-in">
            {content.split("\n").length} lines
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlaceholder;
