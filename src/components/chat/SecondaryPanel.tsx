import { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import ChartRenderer from "../charts/ChartRenderer";
import type { ChartPayload } from "@/types/chartType";
import { copyToClipboard } from "@/helper";

interface SecondaryPanelProps {
  isMaximized: boolean;
  onMaximize: () => void;
  onClose: () => void;
  codeContent: string | string[] | null;
  chartContent: ChartPayload | ChartPayload[] | null;
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
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);

  // Convert chartContent to array for easier handling
  const charts = Array.isArray(chartContent) ? chartContent : chartContent ? [chartContent] : [];
  const currentChart = charts[currentChartIndex];

  // Convert codeContent to array for easier handling
  const codeBlocks = Array.isArray(codeContent) ? codeContent : codeContent ? [codeContent] : [];
  const currentCode = codeBlocks[currentCodeIndex];

  // Auto-close panel when no content is available
  useEffect(() => {
    if (charts.length === 0 && codeBlocks.length === 0) {
      onClose();
    }
  }, [charts.length, codeBlocks.length, onClose]);

  // Reset chart index when charts change
  useEffect(() => {
    setCurrentChartIndex(0);
  }, [charts.length]);

  // Reset code index when code blocks change
  useEffect(() => {
    setCurrentCodeIndex(0);
  }, [codeBlocks.length]);

  // Auto-switch to chart tab if chart content is available and no code content
  useEffect(() => {
    if (charts.length > 0 && codeBlocks.length === 0) {
      setActiveTab("chart");
    } else if (codeBlocks.length > 0 && charts.length === 0) {
      setActiveTab("code");
    }
  }, [codeBlocks.length, charts.length]);

  // Don't render if no content is available
  if (charts.length === 0 && codeBlocks.length === 0) {
    return null;
  }

  const handleCopyCode = async () => {
    if (currentCode) {
      const success = await copyToClipboard(currentCode);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handlePreviousChart = () => {
    setCurrentChartIndex(prev => (prev > 0 ? prev - 1 : charts.length - 1));
  };

  const handleNextChart = () => {
    setCurrentChartIndex(prev => (prev < charts.length - 1 ? prev + 1 : 0));
  };

  const handlePreviousCode = () => {
    setCurrentCodeIndex(prev => (prev > 0 ? prev - 1 : codeBlocks.length - 1));
  };

  const handleNextCode = () => {
    setCurrentCodeIndex(prev => (prev < codeBlocks.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="h-[calc(100vh-75px)] bg-gray-50 dark:bg-black-85 flex flex-col sticky top-0">
      {/* Header with tabs and controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
        {/* Tabs */}
        <div className="flex space-x-1">
          {codeBlocks.length > 0 && (
            <button
              onClick={() => setActiveTab("code")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "code"
                  ? "bg-white-90 dark:bg-black-70 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100"
              }`}
            >
              Code{codeBlocks.length > 1 ? ` (${codeBlocks.length})` : ""}
            </button>
          )}
          {charts.length > 0 && (
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "chart"
                  ? "bg-white-90 dark:bg-black-70 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100"
              }`}
            >
              Chart{charts.length > 1 ? `s (${charts.length})` : ""}
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white-100">
                Code Panel
              </h3>
              {codeBlocks.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousCode}
                    className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-black-70"
                    title="Previous code block"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                    {currentCodeIndex + 1} of {codeBlocks.length}
                  </span>
                  <button
                    onClick={handleNextCode}
                    className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-black-70"
                    title="Next code block"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-black-80 rounded-lg p-4 overflow-auto border border-gray-200 dark:border-white/10 relative">
              <button
                onClick={handleCopyCode}
                className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-black-70"
                title={copied ? "Copied!" : "Copy code"}
                disabled={!currentCode}
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-sm text-gray-800 dark:text-gray-200 pr-12">
                <code>
                  {currentCode ||
                    `// No code content available
// Code will appear here when available`}
                </code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white-100">
                Chart Panel
              </h3>
              {charts.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousChart}
                    className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-black-70"
                    title="Previous chart"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                    {currentChartIndex + 1} of {charts.length}
                  </span>
                  <button
                    onClick={handleNextChart}
                    className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white-100 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-black-70"
                    title="Next chart"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="">
              {currentChart ? (
                <div className="w-full">
                  <ChartRenderer type={currentChart.type || "bar-chart"} chart={currentChart} />
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
