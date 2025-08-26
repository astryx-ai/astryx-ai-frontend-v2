import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./chat/Codeblock";
import { processTextForTypewriter, validateTextContent } from "@/helper";
import type { ChartPayload } from "@/types/chartType";
import type { AiChartData, SourceLinkPreview } from "@/types/chatType";
import { SourceLinkPreview as SourceLinkPreviewComponent } from "./SourceLinkPreview";
import ActionsButton from "./chat/ActionsButton";
import ChartPlaceholder from "./ChartPlaceholder";
import CodePlaceholder from "./CodePlaceholder";

const useTypewriter = (text: string, speed: number = 50, shouldAnimate: boolean = true) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!text) return;

    // If we've already animated this text or shouldn't animate, show full text immediately
    if (!shouldAnimate || hasAnimatedRef.current) {
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
        const currentToken = words[currentIndexRef.current];

        // Append token verbatim to preserve spaces and newlines
        if (currentToken && typeof currentToken === "string") {
          setDisplayText(prev => prev + currentToken);
        }

        currentIndexRef.current++;
        timerRef.current = setTimeout(typeNextWord, speed);
      } else {
        setIsComplete(true);
        hasAnimatedRef.current = true; // Mark as animated
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
    code?: string | string[] | null;
    chart?: ChartPayload | ChartPayload[] | null;
  }) => void;
  aiChartData?: AiChartData[] | null;
  sourceLinkPreview?: SourceLinkPreview[] | null;
}) => {
  // Validate and clean the content before processing
  const validatedContent = validateTextContent(content);
  const { displayText, isComplete } = useTypewriter(validatedContent, 10, isNewMessage);

  // Function to format response time
  const formatResponseTime = (time?: number) => {
    if (!time) return "0ms";
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const chartTypeRef = useRef<string>("");

  // Helper: normalize any AI chart data (always array format) into ChartPayload
  const buildChartPayload = (raw: AiChartData): ChartPayload => {
    const { dataKey, nameKey, data, type, title, description } = raw;
    // Chart data is always an array now, no need for null checks
    const normalized = data.map(point => {
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
      (normalized.length > 0
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

  // Extract charts from aiChartData which is always an array or null
  const extractChartPayloads = useCallback((raw: AiChartData[] | null): ChartPayload[] => {
    if (!raw) return [];
    return raw.map(buildChartPayload).filter(Boolean);
  }, []);

  // Handle aiChartData if present (for secondary panel auto-update) AFTER typing completes
  useEffect(() => {
    if (!isComplete) return;
    if (aiChartData && setSecondaryPanelContent) {
      const payloads = extractChartPayloads(aiChartData);
      if (payloads.length > 0) {
        // Pass all charts to the secondary panel
        setSecondaryPanelContent({ chart: payloads.length === 1 ? payloads[0] : payloads });
      }
    }
  }, [isComplete, aiChartData, setSecondaryPanelContent, extractChartPayloads]);

  // Memoize the content processing to avoid unnecessary re-renders
  const contentParts = useMemo(() => {
    const processContent = (text: string) => {
      // Validate the text input
      const cleanText = validateTextContent(text);
      if (!cleanText) return { parts: [], codeBlocks: [] };

      const parts = [];
      const codeBlocks: string[] = [];
      let encounteredIncompleteBlock = false;
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
          // If typing not complete, do not render partial blocks or any trailing text
          if (!isComplete) {
            encounteredIncompleteBlock = true;
            break;
          }
          // If complete but malformed, treat rest as markdown
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

            // Only update side panel and render chart card after typing completes
            if (isComplete) {
              if (setSecondaryPanelContent) {
                setSecondaryPanelContent({ chart: chartData });
              }
              parts.push({
                type: "chart-placeholder",
                content: chartData,
              });
            }
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

          // Only update side panel and render code card after typing completes
          if (isComplete) {
            codeBlocks.push(codeContent);
            parts.push({
              type: "code-placeholder",
              content: codeContent,
            });
          }
        }

        // Move past the closing ```
        currentIndex = blockEndIndex + blockEndPattern.length;
      }
      // Add any remaining content (only when not blocked by an incomplete block while typing)
      if (!encounteredIncompleteBlock && currentIndex < cleanText.length) {
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

      return { parts, codeBlocks };
    };

    const result = processContent(displayText);
    const processedParts = result.parts || [];
    const codeBlocks = result.codeBlocks || [];

    // Add chart placeholder(s) at the end if aiChartData is present
    if (aiChartData && isComplete) {
      const payloads = extractChartPayloads(aiChartData);
      payloads.forEach(payload => {
        processedParts.push({
          type: "chart-placeholder",
          content: payload,
        });
      });
    }

    // Update secondary panel with all code blocks if any exist
    if (codeBlocks.length > 0 && isComplete && setSecondaryPanelContent) {
      setSecondaryPanelContent({
        code: codeBlocks.length === 1 ? codeBlocks[0] : codeBlocks,
      });
    }

    return processedParts;
  }, [displayText, setSecondaryPanelContent, aiChartData, extractChartPayloads, isComplete]);

  // During typing, coerce headings to normal paragraphs to avoid size jumps
  const markdownComponents = useMemo(() => {
    const linkRenderer = {
      a: props => (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {props.children}
        </a>
      ),
    } as const;

    const codeRenderer = {
      code: ({ className, children, ...props }: any) => {
        const content = String(children).replace(/\n$/, "");
        const isCodeBlock =
          content.includes("\n") ||
          (className && className.startsWith("language-")) ||
          content.length > 50;
        return isCodeBlock ? (
          <CodeBlock className={className}>{content}</CodeBlock>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    } as const;

    if (!isComplete) {
      const asParagraph = (p: any) => <p {...p}>{p.children}</p>;
      return {
        ...linkRenderer,
        ...codeRenderer,
        h1: asParagraph,
        h2: asParagraph,
        h3: asParagraph,
        h4: asParagraph,
        h5: asParagraph,
        h6: asParagraph,
      } as const;
    }
    return { ...linkRenderer, ...codeRenderer } as const;
  }, [isComplete]);

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
                components={markdownComponents}
              >
                {part.content}
              </ReactMarkdown>
            ) : part.type === "chart-placeholder" ? (
              <ChartPlaceholder
                key={index}
                content={part.content}
                setSecondaryPanelContent={setSecondaryPanelContent}
              />
            ) : part.type === "code-placeholder" ? (
              <CodePlaceholder
                key={index}
                content={part.content}
                setSecondaryPanelContent={setSecondaryPanelContent}
              />
            ) : null
          )}
          {/* Source Link Preview */}
          {isComplete && sourceLinkPreview && sourceLinkPreview.length > 0 && (
            <SourceLinkPreviewComponent sources={sourceLinkPreview} />
          )}

          {!isComplete && (
            <span className="inline-block w-2 h-5 bg-blue-astryx ml-1 animate-pulse" />
          )}
          {isComplete && responseTime && (
            <p className="!text-[10px] bg-black-10 dark:bg-white-20 rounded-full px-2 py-1 w-fit mt-2">
              Response time: {formatResponseTime(responseTime)}
            </p>
          )}

          {isComplete && <ActionsButton content={validatedContent} />}
        </div>
      </div>
    </div>
  );
};

export default TypeWriterAiMsg;
