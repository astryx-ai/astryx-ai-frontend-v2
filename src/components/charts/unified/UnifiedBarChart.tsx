import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
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

// Simplified type definition
interface UnifiedBarChartPayload {
  type: "bar-standard" | "bar-multiple" | "bar-stacked" | "bar-negative";
  title?: string; // Made optional
  description?: string; // Made optional
  data: any[];

  // Core configuration
  dataKey?: string;
  xAxisKey?: string;
  groupedKeys?: string[]; // Required for multiple/stacked

  // Styling options
  color?: string | string[]; // Made optional - will auto-generate if not provided
  height?: number;
  layout?: "horizontal" | "vertical";
  radius?: number | [number, number, number, number];
  negativeColor?: string; // For negative chart type

  // Footer customization
  trendText?: string;
  footerText?: string;
}

export function UnifiedBarChart({ chart }: { chart: UnifiedBarChartPayload }) {
  // Determine required colors count
  const getColorCount = (): number => {
    if (chart.type === "bar-multiple" || chart.type === "bar-stacked") {
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
    layout = "vertical",
    radius = 4,
    negativeColor = "hsl(0, 70%, 45%)", // Slightly darker red
    groupedKeys = [],
  } = chart;

  const colors = getColors();

  // Calculate trend for footer (enabled by default)
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
      // Multiple/Stacked bar configuration
      groupedKeys.forEach((key, index) => {
        config[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: colors[index % colors.length],
        };
      });
    } else {
      // Single bar configuration
      config[dataKey] = {
        label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
        color: colors[0],
      };
    }

    return config;
  };

  const chartConfig = generateChartConfig();
  const trend = calculateTrend();

  // Render bars based on chart type
  const renderBars = () => {
    switch (chart.type) {
      case "bar-multiple":
        return groupedKeys.map((key, index) => (
          <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={radius} />
        ));

      case "bar-stacked":
        return groupedKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="stack"
            fill={colors[index % colors.length]}
            radius={index === groupedKeys.length - 1 ? radius : 0}
          />
        ));

      case "bar-negative":
        return (
          <Bar dataKey={dataKey} radius={radius}>
            {chart.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry[dataKey] >= 0 ? colors[0] : negativeColor} />
            ))}
          </Bar>
        );

      case "bar-standard":
      default:
        return <Bar dataKey={dataKey} fill={colors[0]} radius={radius} />;
    }
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
          <BarChart
            data={chart.data}
            layout={layout === "horizontal" ? "horizontal" : undefined}
            margin={{
              left: layout === "horizontal" ? 20 : 12,
              right: 30,
              top: 20,
              bottom: 20,
            }}
          >
            {/* Grid enabled by default */}
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            {/* Axis configuration */}
            {layout === "horizontal" ? (
              <>
                <XAxis type="number" dataKey={dataKey} />
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={value =>
                    typeof value === "string" && value.length > 3
                      ? value.slice(0, 3)
                      : String(value)
                  }
                />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
              </>
            )}

            {/* Tooltip enabled by default */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel={layout === "horizontal"}
                  indicator={groupedKeys.length > 1 ? "dashed" : "dot"}
                />
              }
            />

            {/* Legend for multiple/stacked charts */}
            {(chart.type === "bar-multiple" || chart.type === "bar-stacked") &&
              groupedKeys.length > 1 && <ChartLegend content={<ChartLegendContent />} />}

            {renderBars()}
          </BarChart>
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
