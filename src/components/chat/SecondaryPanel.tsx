import { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Copy } from "lucide-react";
import ChartRenderer from "../charts/ChartRenderer";
import type { ChartPayload } from "@/types/chartType";
import { copyToClipboard } from "@/helper";

interface SecondaryPanelProps {
  isMaximized: boolean;
  onMaximize: () => void;
  onClose: () => void;
  codeContent: string | null;
  chartContent: ChartPayload | null;
}

const SecondaryPanel = ({
  isMaximized,
  onMaximize,
  onClose,
  codeContent,
  chartContent,
}: SecondaryPanelProps) => {
  const [activeTab, setActiveTab] = useState<"code" | "chart">("code");
  const [copied, setCopied] = useState(false);

  // Auto-switch to chart tab if chart content is available and no code content
  useEffect(() => {
    if (chartContent && !codeContent) {
      setActiveTab("chart");
    } else if (codeContent && !chartContent) {
      setActiveTab("code");
    }
  }, [codeContent, chartContent]);

  const handleCopyCode = async () => {
    if (codeContent) {
      const success = await copyToClipboard(codeContent);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-75px)] bg-gray-50 dark:bg-black-85 flex flex-col sticky top-0">
      {/* Header with tabs and controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
        {/* Tabs */}
        <div className="flex space-x-1">
          {codeContent && (
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "code"
                  ? "bg-white-90 dark:bg-black-70 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100"
              }`}
            >
              Code
            </button>
          )}
          {chartContent && (
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "chart"
                  ? "bg-white-90 dark:bg-black-70 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100"
              }`}
            >
              Chart
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onMaximize}
            className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === "code" ? (
          <div className="h-full">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white-100">
              Code Panel
            </h3>
            <div className="bg-white dark:bg-black-80 rounded-lg p-4 overflow-auto border border-gray-200 dark:border-white/10 relative">
              <button
                onClick={handleCopyCode}
                className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-black-70"
                title={copied ? "Copied!" : "Copy code"}
                disabled={!codeContent}
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-sm text-gray-800 dark:text-gray-200 pr-12">
                <code>
                  {codeContent ||
                    `// No code content available
// Code will appear here when available`}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white-100">
              Chart Panel
            </h3>
            <div className=" min-h-96 ">
              {chartContent ? (
                <div className="w-full">
                  <ChartRenderer
                    type={(chartContent as ChartPayload).type || "bar-chart"}
                    chart={chartContent as ChartPayload}
                  />
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Chart visualization will appear here
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondaryPanel;
