import type { ChartPayload } from "@/types/chartType";

interface ChartPlaceholderProps {
  content: ChartPayload;
  setSecondaryPanelContent?: (content: {
    code?: string | null;
    chart?: ChartPayload | null;
  }) => void;
}

const ChartPlaceholder = ({ content, setSecondaryPanelContent }: ChartPlaceholderProps) => {
  // Map chart types to their respective icons and get display name
  const getChartIcon = () => {
    const chartType = content.type.toLowerCase();
    if (chartType.includes("line")) return "/icons/lineChart.svg";
    if (chartType.includes("bar")) return "/icons/barChart.svg";
    if (chartType.includes("pie") || chartType.includes("donut")) return "/icons/pieChart.svg";
    if (chartType.includes("radar")) return "/icons/radarChart.svg";
    if (chartType.includes("radial")) return "/icons/radialChart.svg";
    if (chartType.includes("area")) return "/icons/areaChart.svg";

    // Default fallback
    return "/icons/lineChart.svg";
  };

  // Get the display name (first word + "chart")
  const getDisplayName = (type: string) => {
    const firstWord = type.split("-")[0] || "Chart";
    return `${firstWord.charAt(0).toUpperCase() + firstWord.slice(1)} Chart`;
  };

  return (
    <div className="my-4">
      {/* Chart Placeholder */}
      <div
        className="bg-neutral-100 dark:bg-black-85 border-2 border-blue-astryx dark:border-white/10 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-black-80 transition-colors overflow-hidden"
        onClick={() => {
          if (setSecondaryPanelContent) {
            setSecondaryPanelContent({ chart: content });
          }
        }}
      >
        {/* Chart Title and Description inside the card */}
        {content.title && (
          <div className="mb-3 ">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white-100">
              {content.title}
            </h4>
            {content.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{content.description}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-20 h-14 rotate-12  bg-blue-astryx/25 dark:bg-white/25 flex justify-center items-center rounded-xl -translate-x-6">
              <img
                src={getChartIcon()}
                alt={`${content.type} icon`}
                className="w-6 h-6 animate-bounce filter dark:invert !border-none !rounded-none"
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click here to see the chart in the sidepanel
            </span>
          </div>
          <div className="text-sm text-white dark:text-black-85 bg-blue-astryx dark:bg-white flex justify-center items-center px-4 py-2 rounded-lg backdrop-blur-xs rotate-12 translate-x-7 translate-y-4 h-16 contentTxt transition-all duration-300 ease-in">
            {getDisplayName(content.type)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPlaceholder;
