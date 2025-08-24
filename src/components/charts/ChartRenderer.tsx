import type { ChartPayload } from "@/types/chartType";
import { UnifiedBarChart } from "./unified/UnifiedBarChart";
import { UnifiedPieChart } from "./unified/UnifiedPieChart";
import { UnifiedRadarChart } from "./unified/UnifiedRadarChart";
import { UnifiedRadialChart } from "./unified/UnifiedRadialCharts";
import { UnifiedLineChart } from "./unified/UnifiedLineChart";
import { UnifiedAreaChart } from "./unified/UnifiedAreaChart";

const ChartRenderer = ({ type, chart }: { type: string; chart: ChartPayload }) => {
  // Map chart types to unified components
  const getUnifiedChartComponent = (chartType: string) => {
    const componentMap: Record<string, any> = {
      // Bar Charts
      "bar-standard": UnifiedBarChart,
      "bar-multiple": UnifiedBarChart,
      "bar-stacked": UnifiedBarChart,
      "bar-negative": UnifiedBarChart,

      // Pie Charts
      "pie-standard": UnifiedPieChart,
      "pie-label": UnifiedPieChart,
      "pie-donut": UnifiedPieChart,
      "pie-interactive": UnifiedPieChart,

      // Radar Charts
      "radar-standard": UnifiedRadarChart,
      "radar-lines-only": UnifiedRadarChart,
      "radar-multiple": UnifiedRadarChart,

      // Radial Charts
      "radial-standard": UnifiedRadialChart,
      "radial-stacked": UnifiedRadialChart,

      // Line Charts
      "line-standard": UnifiedLineChart,
      "line-linear": UnifiedLineChart,
      "line-step": UnifiedLineChart,
      "line-multiple": UnifiedLineChart,
      "line-dots": UnifiedLineChart,
      "line-label": UnifiedLineChart,

      // Area Charts
      "area-standard": UnifiedAreaChart,
      "area-linear": UnifiedAreaChart,
      "area-step": UnifiedAreaChart,
      "area-stacked": UnifiedAreaChart,
    };

    return componentMap[chartType] || null;
  };

  const UnifiedComponent = getUnifiedChartComponent(type);

  if (!UnifiedComponent) {
    return (
      <p className="bg-gray-100 dark:bg-black-80 p-3 text-lg font-semibold ">
        Chart type not supported!
      </p>
    );
  }

  // Transform chart data to unified format
  // Auto-correct dataKey if mismatch (e.g. API provided market_share but mapping renamed marketCap)
  let correctedChart = chart;
  if (chart && chart.dataKey && chart.data.length > 0) {
    const first = chart.data[0];
    if (first && !(chart.dataKey in first)) {
      // Try to find a numeric alternative key
      const numericKeys = Object.keys(first).filter(k => typeof (first as any)[k] === "number");
      if (numericKeys.length) {
        correctedChart = { ...chart, dataKey: numericKeys[0] } as any;
      }
    }
  }

  const unifiedChart = {
    ...correctedChart,
    type: type,
  } as typeof correctedChart;

  return <UnifiedComponent chart={unifiedChart} />;
};

export default ChartRenderer;
