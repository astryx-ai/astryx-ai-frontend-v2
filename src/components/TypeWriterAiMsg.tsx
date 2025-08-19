import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, ThumbsUp, ThumbsDown, Check, Code2Icon, ChartSpline } from "lucide-react";
import CodeBlock from "./chat/Codeblock";
import { processTextForTypewriter, validateTextContent, copyToClipboard } from "@/helper";
import type { ChartPayload } from "@/types/chartType";
import type { AiChartData, SourceLinkPreview } from "@/types/chatType";
import { SourceLinkPreview as SourceLinkPreviewComponent } from "./SourceLinkPreview";

const useTypewriter = (text: string, speed: number = 50, shouldAnimate: boolean = true) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (!text) return;

    if (!shouldAnimate) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    setDisplayText("");
    setIsComplete(false);
    currentIndexRef.current = 0;

    // Use helper function to process text
    const words = processTextForTypewriter(text);

    const typeNextWord = () => {
      if (currentIndexRef.current < words.length) {
        const currentWord = words[currentIndexRef.current];

        // Additional safety check to ensure currentWord is valid
        if (currentWord && typeof currentWord === "string") {
          setDisplayText(prev => {
            const newText = currentIndexRef.current === 0 ? currentWord : prev + " " + currentWord;
            return newText;
          });
        }

        currentIndexRef.current++;
        timerRef.current = setTimeout(typeNextWord, speed);
      } else {
        setIsComplete(true);
      }
    };

    timerRef.current = setTimeout(typeNextWord, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed, shouldAnimate]);

  return { displayText, isComplete };
};

const TypeWriterAiMsg = ({
  content,
  theme,
  isNewMessage = false,
  responseTime,
  setSecondaryPanelContent,
  aiChartData,
  sourceLinkPreview,
}: {
  content: string;
  theme: string;
  isNewMessage?: boolean;
  responseTime?: number;
  setSecondaryPanelContent?: (content: {
    code?: string | null;
    chart?: ChartPayload | null;
  }) => void;
  aiChartData?: AiChartData | Record<string, AiChartData> | AiChartData[] | null;
  sourceLinkPreview?: SourceLinkPreview[] | null;
}) => {
  // Validate and clean the content before processing
  const validatedContent = validateTextContent(content);
  const { displayText, isComplete } = useTypewriter(validatedContent, 10, isNewMessage);
  // State for animations and interactions
  const [isCopied, setIsCopied] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  // Function to format response time
  const formatResponseTime = (time?: number) => {
    if (!time) return "0ms";
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const chartTypeRef = useRef<string>("");

  // Helper: normalize any AI chart data (old or new shape) into ChartPayload
  const buildChartPayload = (raw: AiChartData): ChartPayload => {
    const { dataKey, nameKey, data, type, title, description } = raw;
    const normalized = (data || []).map(point => {
      // If expected numeric key exists, keep as-is
      if (point && point[dataKey] !== undefined) return { ...point } as any;
      // If missing, find a numeric candidate to mirror
      const numericCandidate = Object.keys(point || {}).find(k => typeof point[k] === "number");
      if (numericCandidate && numericCandidate !== dataKey) {
        return { ...point, [dataKey]: point[numericCandidate] } as any;
      }
      return { ...point } as any;
    });
    // Determine categorical key fallback if nameKey missing
    const derivedNameKey =
      nameKey ||
      (normalized[0]
        ? Object.keys(normalized[0]).find(k => typeof (normalized[0] as any)[k] === "string")
        : undefined);
    return {
      type,
      title,
      description,
      data: normalized,
      dataKey,
      xAxisKey: derivedNameKey,
      nameKey: derivedNameKey,
    } as ChartPayload;
  };

  // Extract one or more charts from aiChartData which can be single, array, or keyed object
  const extractChartPayloads = useCallback(
    (
      raw: AiChartData | Record<string, AiChartData> | AiChartData[] | null | undefined
    ): ChartPayload[] => {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw.map(buildChartPayload).filter(Boolean);
      }
      if ((raw as any).data && (raw as any).type) {
        return [buildChartPayload(raw as AiChartData)];
      }
      const values = Object.values(raw as Record<string, AiChartData>);
      return values
        .filter(v => v && typeof v === "object" && (v as any).data && (v as any).type)
        .map(v => buildChartPayload(v));
    },
    []
  );

  // Handle aiChartData if present (for secondary panel auto-update)
  useEffect(() => {
    if (aiChartData && setSecondaryPanelContent) {
      const payloads = extractChartPayloads(aiChartData as any);
      if (payloads.length > 0) {
        setSecondaryPanelContent({ chart: payloads[0] });
      }
    }
  }, [aiChartData, setSecondaryPanelContent, extractChartPayloads]);

  // Handler functions for the action buttons
  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await copyToClipboard(validatedContent);
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

  // Memoize the content processing to avoid unnecessary re-renders
  const contentParts = useMemo(() => {
    const processContent = (text: string) => {
      // Validate the text input
      const cleanText = validateTextContent(text);
      if (!cleanText) return [];

      const parts = [];
      // Use a more robust approach to find and extract chart blocks and code blocks
      const chartStartPattern = "```chart";
      const codeStartPattern = "```";
      const codeEndPattern = "```";

      let currentIndex = 0;

      while (true) {
        // Find the start of a chart block or code block
        const chartStartIndex = cleanText.indexOf(chartStartPattern, currentIndex);
        const codeStartIndex = cleanText.indexOf(codeStartPattern, currentIndex);

        // Determine which block comes first
        let blockStartIndex = -1;
        let blockType = "";
        let blockEndPattern = "";

        // Prioritize chart blocks over code blocks
        if (chartStartIndex !== -1) {
          blockStartIndex = chartStartIndex;
          blockType = "chart";
          blockEndPattern = codeEndPattern;
        } else if (codeStartIndex !== -1) {
          blockStartIndex = codeStartIndex;
          blockType = "code";
          blockEndPattern = codeEndPattern;
        }

        if (blockStartIndex === -1) break;

        // Add content before block
        if (blockStartIndex > currentIndex) {
          const beforeContent = cleanText.slice(currentIndex, blockStartIndex);
          const trimmedBeforeContent = beforeContent.replace(/\s+$/, "");
          if (trimmedBeforeContent.trim()) {
            parts.push({
              type: "markdown",
              content: trimmedBeforeContent,
            });
          }
        }

        // Find the end of the block
        const searchStart =
          blockStartIndex +
          (blockType === "chart" ? chartStartPattern.length : codeStartPattern.length);
        const blockEndIndex = cleanText.indexOf(blockEndPattern, searchStart);

        if (blockEndIndex === -1) {
          // No closing ```, treat rest as markdown
          const remainingContent = cleanText.slice(blockStartIndex);
          parts.push({
            type: "markdown",
            content: remainingContent,
          });
          break;
        }

        if (blockType === "chart") {
          // Extract and parse chart JSON
          const chartContentStart = blockStartIndex + chartStartPattern.length;
          let chartJsonContent = cleanText.slice(chartContentStart, blockEndIndex).trim();

          // Handle both formats: ```chart { ... } ``` and ```chart\n{ ... }\n```
          if (!chartJsonContent.startsWith("{")) {
            // Format: ```chart\n{ ... }\n``` - extract JSON from the content
            const jsonMatch = chartJsonContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              chartJsonContent = jsonMatch[0];
            }
          }

          try {
            const chartData = JSON.parse(chartJsonContent);
            chartTypeRef.current = chartData.type;

            // Set the chart content in secondary panel
            if (setSecondaryPanelContent) {
              setSecondaryPanelContent({ chart: chartData });
            }

            parts.push({
              type: "chart-placeholder",
              content: chartData,
            });
          } catch (e) {
            console.error("Failed to parse chart data:", e);
            console.error("Chart content that failed to parse:", chartJsonContent);
            // If parsing fails, treat as regular markdown
            const failedContent = cleanText.slice(
              blockStartIndex,
              blockEndIndex + blockEndPattern.length
            );
            parts.push({
              type: "markdown",
              content: failedContent,
            });
          }
        } else if (blockType === "code") {
          // Extract code content
          const codeContentStart = blockStartIndex + codeStartPattern.length;
          const codeContent = cleanText.slice(codeContentStart, blockEndIndex).trim();

          // Set the code content in secondary panel
          if (setSecondaryPanelContent) {
            setSecondaryPanelContent({ code: codeContent });
          }

          parts.push({
            type: "code-placeholder",
            content: codeContent,
          });
        }

        // Move past the closing ```
        currentIndex = blockEndIndex + blockEndPattern.length;
      }
      // Add any remaining content
      if (currentIndex < cleanText.length) {
        const remainingContent = cleanText.slice(currentIndex);
        // Remove leading whitespace and extra ``` that might be left
        const trimmedContent = remainingContent.replace(/^(\s|`)*/, "").replace(/(`)*\s*$/, "");
        if (trimmedContent.trim()) {
          parts.push({
            type: "markdown",
            content: trimmedContent,
          });
        }
      }

      return parts;
    };

    const processedParts = processContent(displayText);

    // Add chart placeholder(s) at the end if aiChartData is present
    if (aiChartData) {
      const payloads = extractChartPayloads(aiChartData as any);
      payloads.forEach(payload => {
        processedParts.push({
          type: "chart-placeholder",
          content: payload,
        });
      });
    }

    return processedParts;
  }, [displayText, setSecondaryPanelContent, aiChartData, extractChartPayloads]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-full bg-blue-astryx/10 dark:bg-white-20 w-fit">
          <img
            src={theme === "dark" ? "/logo/x-white.svg" : "/logo/x.svg"}
            alt="astryx"
            className="w-5 h-5"
          />
        </div>
        <p className="font-medium text-black-100 dark:text-white-100">Astryx</p>
        <p className="text-xs text-black-30 dark:text-white-30">10:00 AM</p>
      </div>
      <div className="mt-4 sm:ml-14 markdown-content">
        <div className="relative">
          {contentParts.map((part, index) =>
            part.type === "markdown" ? (
              <ReactMarkdown
                key={index}
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, ...props }) => {
                    const content = String(children).replace(/\n$/, "");
                    // Check if it's a code block - more reliable heuristics
                    const isCodeBlock =
                      content.includes("\n") || // Multi-line content
                      (className && className.startsWith("language-")) || // Has language specified
                      content.length > 50; // Long single-line code is likely a block

                    return isCodeBlock ? (
                      <CodeBlock className={className}>{content}</CodeBlock>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {part.content}
              </ReactMarkdown>
            ) : part.type === "chart-placeholder" ? (
              <div key={index} className="my-4">
                {/* Chart Title */}
                {part.content.title && (
                  <div className="mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white-100">
                      {part.content.title}
                    </h4>
                    {part.content.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {part.content.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Chart Placeholder */}
                <div
                  className="bg-white dark:bg-black-90 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors custom-shadow overflow-hidden cardBox"
                  onClick={() => {
                    if (setSecondaryPanelContent) {
                      setSecondaryPanelContent({ chart: part.content });
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-14 rotate-12  backdrop-blur-sm bg-green-500/25 flex justify-center items-center rounded-xl -translate-x-6">
                        <ChartSpline className="animate-bounce" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click here to see the chart in the sidepanel
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-800 capitalize bg-[#6cceb899] flex justify-center items-center px-4 py-2 rounded-lg backdrop-blur-xs rotate-12 translate-x-7 translate-y-4 h-16 contentTxt transition-all duration-300 ease-in">
                      {part.content.type.split("-").join(" ") || "Chart"}
                    </div>
                  </div>
                </div>
              </div>
            ) : part.type === "code-placeholder" ? (
              <div key={index} className="my-4">
                <div
                  className="bg-white dark:bg-black-90 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors custom-shadow overflow-hidden cardBox"
                  onClick={() => {
                    if (setSecondaryPanelContent) {
                      setSecondaryPanelContent({ code: part.content });
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 ">
                      <div className="w-20 h-14 rotate-12  backdrop-blur-sm bg-blue-500/25 flex justify-center items-center rounded-xl -translate-x-6">
                        <Code2Icon className="animate-bounce" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click here to see the code in the sidepanel
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-800 bg-[#6cbace99] flex justify-center items-center px-6 py-2 rounded-lg backdrop-blur-xs rotate-12 translate-x-7 translate-y-4 h-16 contentTxt transition-all duration-300 ease-in">
                      {part.content.split("\n").length} lines
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          )}
          {/* Source Link Preview */}
          {sourceLinkPreview && sourceLinkPreview.length > 0 && (
            <SourceLinkPreviewComponent sources={sourceLinkPreview} />
          )}

          {!isComplete && (
            <span className="inline-block w-2 h-5 bg-blue-astryx ml-1 animate-pulse" />
          )}
          {responseTime && (
            <p className="!text-[10px] bg-black-10 dark:bg-white-20 rounded-full px-2 py-1 w-fit mt-2">
              Response time: {formatResponseTime(responseTime)}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3 opacity-60 hover:opacity-100 transition-opacity">
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
        </div>
      </div>
    </div>
  );
};

export default TypeWriterAiMsg;
