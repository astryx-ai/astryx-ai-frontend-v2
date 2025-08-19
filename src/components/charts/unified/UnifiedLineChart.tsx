import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { generateBlueShades } from "@/lib/utils";

// Colors now generated from a single blue palette

// Line chart type definition
interface UnifiedLineChartPayload {
  type:
    | "line-standard"
    | "line-linear"
    | "line-step"
    | "line-multiple"
    | "line-dots"
    | "line-label";
  title?: string; // Optional
  description?: string; // Optional
  data: any[];

  // Core configuration
  dataKey?: string;
  xAxisKey?: string;
  groupedKeys?: string[]; // Required for multiple

  // Styling options
  color?: string | string[]; // Optional - will auto-generate if not provided
  height?: number;

  // Feature toggles (specific to line charts)
  showDots?: boolean;
  showActiveDots?: boolean;
  showLabels?: boolean;
  connectNulls?: boolean;

  // Advanced options
  customLabel?: (value: any, name?: string) => string;

  // Footer customization
  trendText?: string;
  footerText?: string;
}

export function UnifiedLineChart({ chart }: { chart: UnifiedLineChartPayload }) {
  // Determine required colors count
  const getColorCount = (): number => {
    if (chart.type === "line-multiple") {
      return chart.groupedKeys?.length || 1;
    }
    return 1;
  };

  // Auto-generate colors if not provided
  const getColors = (): string[] => {
    if (chart.color) {
      if (Array.isArray(chart.color)) {
        return chart.color;
      }
      return [chart.color];
    }

    // Auto-generate colors based on chart type
    const colorCount = getColorCount();
    return generateBlueShades(colorCount);
  };

  // Default values with all controls enabled
  const {
    dataKey = chart.groupedKeys?.[0] ||
      Object.keys(chart.data[0] || {}).find(key => typeof chart.data[0]?.[key] === "number") ||
      "value",
    xAxisKey = Object.keys(chart.data[0] || {}).find(
      key => key !== dataKey && !chart.groupedKeys?.includes(key)
    ) || "category",
    height = 400,
    showDots = chart.type === "line-dots",
    showActiveDots = true,
    showLabels = chart.type === "line-label",
    connectNulls = true,
    groupedKeys = [],
    customLabel,
  } = chart;

  // Auto-managed values
  const strokeWidth = 2;
  const dotSize = 4;
  const activeDotSize = 6;

  const colors = getColors();

  // Calculate trend for footer
  const calculateTrend = () => {
    if (chart.data.length < 2) return null;

    const lastTwoItems = chart.data.slice(-2);
    const currentValue = Number(lastTwoItems[1]?.[dataKey]) || 0;
    const previousValue = Number(lastTwoItems[0]?.[dataKey]) || 0;

    if (previousValue === 0) return null;

    const trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
    const isPositive = trendPercentage > 0;

    return {
      percentage: Math.abs(trendPercentage).toFixed(1),
      isPositive,
      text:
        chart.trendText ||
        `Trending ${isPositive ? "up" : "down"} by ${Math.abs(trendPercentage).toFixed(1)}% this period`,
    };
  };

  // Generate dynamic chart config
  const generateChartConfig = () => {
    const config: any = {};

    if (groupedKeys.length > 0) {
      // Multiple line configuration
      groupedKeys.forEach((key, index) => {
        config[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: colors[index % colors.length],
        };
      });
    } else {
      // Single line configuration
      config[dataKey] = {
        label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
        color: colors[0],
      };
    }

    return config;
  };

  const chartConfig = generateChartConfig();
  const trend = calculateTrend();

  // Determine curve type based on chart type
  const getCurveType = (): "linear" | "natural" | "step" => {
    switch (chart.type) {
      case "line-linear":
        return "linear";
      case "line-step":
        return "step";
      case "line-standard":
      case "line-multiple":
      case "line-dots":
      case "line-label":
      default:
        return "natural";
    }
  };

  // Render lines based on chart type
  const renderLines = () => {
    const curveType = getCurveType();

    if (chart.type === "line-multiple") {
      return groupedKeys.map((key, index) => (
        <Line
          key={key}
          dataKey={key}
          type={curveType}
          stroke={colors[index % colors.length]}
          strokeWidth={strokeWidth}
          dot={showDots ? { r: dotSize, fill: colors[index % colors.length] } : false}
          activeDot={
            showActiveDots ? { r: activeDotSize, fill: colors[index % colors.length] } : false
          }
          connectNulls={connectNulls}
        />
      ));
    }

    // Single line for all other types
    return (
      <Line
        dataKey={dataKey}
        type={curveType}
        stroke={colors[0]}
        strokeWidth={strokeWidth}
        dot={showDots ? { r: dotSize, fill: colors[0] } : false}
        activeDot={showActiveDots ? { r: activeDotSize, fill: colors[0] } : false}
        connectNulls={connectNulls}
      >
        {showLabels && (
          <LabelList
            dataKey={dataKey}
            position="top"
            formatter={customLabel || ((value: any) => value.toString())}
          />
        )}
      </Line>
    );
  };

  return (
    <Card>
      {/* Conditional Header - Only render if title or description exists */}
      {(chart.title || chart.description) && (
        <CardHeader>
          {chart.title && <CardTitle>{chart.title}</CardTitle>}
          {chart.description && <CardDescription>{chart.description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>
        <ChartContainer config={chartConfig} className="w-full aspect-auto" style={{ height }}>
          <LineChart
            data={chart.data}
            margin={{
              left: 12,
              right: 30,
              top: showLabels ? 35 : 20, // Extra space for labels
              bottom: 20,
            }}
          >
            {/* Grid enabled by default */}
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            {/* X-axis configuration */}
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value =>
                typeof value === "string" && value.length > 3 ? value.slice(0, 3) : String(value)
              }
            />

            {/* Y-axis configuration */}
            <YAxis tickLine={false} tickMargin={10} axisLine={false} />

            {/* Tooltip enabled by default */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator={chart.type === "line-dots" ? "dot" : "line"}
                  hideLabel={chart.type === "line-linear"}
                />
              }
            />

            {/* Legend for multiple charts */}
            {chart.type === "line-multiple" && groupedKeys.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} />
            )}

            {renderLines()}
          </LineChart>
        </ChartContainer>
      </CardContent>

      {/* Footer with trend (enabled by default) */}
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {trend && (
          <div className="flex gap-2 leading-none font-medium">
            {trend.text}
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          {chart.footerText || `Showing ${dataKey} data from ${chart.data.length} data points`}
        </div>
      </CardFooter>
    </Card>
  );
}
