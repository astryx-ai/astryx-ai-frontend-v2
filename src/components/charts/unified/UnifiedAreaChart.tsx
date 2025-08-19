import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

// Area chart type definition
interface UnifiedAreaChartPayload {
  type: "area-standard" | "area-linear" | "area-step" | "area-stacked" | "area-axes";
  title?: string; // Optional
  description?: string; // Optional
  data: any[];

  // Core configuration
  dataKey?: string;
  xAxisKey?: string;
  groupedKeys?: string[]; // Required for stacked

  // Styling options
  color?: string | string[]; // Optional - will auto-generate if not provided
  height?: number;

  // Feature toggles (specific to area charts)
  showDots?: boolean;
  connectNulls?: boolean;

  // Footer customization
  trendText?: string;
  footerText?: string;
}

export function UnifiedAreaChart({ chart }: { chart: UnifiedAreaChartPayload }) {
  // Determine required colors count
  const getColorCount = (): number => {
    if (chart.type === "area-stacked") {
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
    showDots = false,
    connectNulls = true,
    groupedKeys = [],
  } = chart;

  // Auto-managed values
  const fillOpacity = 0.4;
  const strokeWidth = 2;

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
      // Stacked area configuration
      groupedKeys.forEach((key, index) => {
        config[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: colors[index % colors.length],
        };
      });
    } else {
      // Single area configuration
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
      case "area-linear":
        return "linear";
      case "area-step":
        return "step";
      case "area-standard":
      case "area-stacked":
      case "area-axes":
      default:
        return "natural";
    }
  };

  // Render areas based on chart type
  const renderAreas = () => {
    const curveType = getCurveType();

    if (chart.type === "area-stacked") {
      return groupedKeys.map((key, index) => (
        <Area
          key={key}
          dataKey={key}
          type={curveType}
          stackId="stack"
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          fillOpacity={fillOpacity}
          strokeWidth={strokeWidth}
          dot={showDots}
          connectNulls={connectNulls}
        />
      ));
    }

    // Single area for all other types
    return (
      <Area
        dataKey={dataKey}
        type={curveType}
        stroke={colors[0]}
        fill={colors[0]}
        fillOpacity={fillOpacity}
        strokeWidth={strokeWidth}
        dot={showDots}
        connectNulls={connectNulls}
      />
    );
  };

  // Determine if Y-axis should be shown (for axes type)
  const showYAxis = chart.type === "area-axes";

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
          <AreaChart
            data={chart.data}
            margin={{
              left: showYAxis ? -20 : 12, // Adjust left margin for Y-axis
              right: 30,
              top: 20,
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

            {/* Y-axis configuration - only show for axes type */}
            {showYAxis && <YAxis tickLine={false} tickMargin={10} axisLine={false} tickCount={3} />}

            {/* Tooltip enabled by default */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator={chart.type === "area-linear" ? "dot" : "line"}
                  hideLabel={chart.type === "area-linear"}
                />
              }
            />

            {/* Legend for stacked charts */}
            {chart.type === "area-stacked" && groupedKeys.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} />
            )}

            {renderAreas()}
          </AreaChart>
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
