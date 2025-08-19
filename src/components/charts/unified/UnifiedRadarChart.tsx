import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
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

// Radar chart type definition
interface UnifiedRadarChartPayload {
  type: "radar-standard" | "radar-lines-only" | "radar-multiple";
  title?: string; // Optional
  description?: string; // Optional
  data: any[];

  // Core configuration
  dataKey?: string;
  nameKey?: string; // Key for radar axes labels
  groupedKeys?: string[]; // Required for multiple

  // Styling options
  color?: string | string[]; // Optional - will auto-generate if not provided
  height?: number;

  // Feature toggles
  showDots?: boolean;
  showFill?: boolean;
  showGrid?: boolean;
  showAxis?: boolean;
  showTooltip?: boolean;

  // Footer customization
  trendText?: string;
  footerText?: string;
}

export function UnifiedRadarChart({ chart }: { chart: UnifiedRadarChartPayload }) {
  // Determine required colors count
  const getColorCount = (): number => {
    if (chart.type === "radar-multiple") {
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
    nameKey = Object.keys(chart.data[0] || {}).find(
      key => key !== dataKey && !chart.groupedKeys?.includes(key)
    ) || "subject",
    height = 400,
    showDots = chart.type !== "radar-lines-only",
    showFill = chart.type !== "radar-lines-only",
    showGrid = true,
    showAxis = true,
    showTooltip = true,
    groupedKeys = [],
  } = chart;

  // Auto-managed values
  const fillOpacity = chart.type === "radar-lines-only" ? 0 : 0.3;
  const strokeWidth = 2;
  const showLegend = true;

  const colors = getColors();

  // Calculate trend for footer
  const calculateTrend = () => {
    if (chart.data.length < 2) return null;

    // For radar charts, calculate average of all values across all axes
    const calculateAverage = (data: any[], keys: string[]) => {
      const total = data.reduce((sum, item) => {
        return sum + keys.reduce((keySum, key) => keySum + (Number(item[key]) || 0), 0);
      }, 0);
      return total / (data.length * keys.length);
    };

    const keysToAnalyze = groupedKeys.length > 0 ? groupedKeys : [dataKey];
    const currentAvg = calculateAverage([chart.data[chart.data.length - 1]], keysToAnalyze);
    const previousAvg = calculateAverage([chart.data[chart.data.length - 2]], keysToAnalyze);

    if (previousAvg === 0) return null;

    const trendPercentage = ((currentAvg - previousAvg) / previousAvg) * 100;
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
      // Multiple radar configuration
      groupedKeys.forEach((key, index) => {
        config[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: colors[index % colors.length],
        };
      });
    } else {
      // Single radar configuration
      config[dataKey] = {
        label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
        color: colors[0],
      };
    }

    return config;
  };

  const chartConfig = generateChartConfig();
  const trend = calculateTrend();

  // Render radar areas based on chart type
  const renderRadarAreas = () => {
    if (chart.type === "radar-multiple") {
      return groupedKeys.map((key, index) => (
        <Radar
          key={key}
          dataKey={key}
          stroke={colors[index % colors.length]}
          fill={showFill ? colors[index % colors.length] : "transparent"}
          fillOpacity={fillOpacity}
          strokeWidth={strokeWidth}
          dot={showDots ? { r: 4, fill: colors[index % colors.length] } : false}
        />
      ));
    }

    // Single radar for default and lines-only types
    return (
      <Radar
        dataKey={dataKey}
        stroke={colors[0]}
        fill={showFill ? colors[0] : "transparent"}
        fillOpacity={fillOpacity}
        strokeWidth={strokeWidth}
        dot={showDots ? { r: 4, fill: colors[0] } : false}
      />
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
          <RadarChart
            data={chart.data}
            margin={{
              top: 20,
              right: 80,
              bottom: 20,
              left: 80,
            }}
          >
            {/* Polar Grid - enabled by default */}
            {showGrid && <PolarGrid />}

            {/* Polar Angle Axis - shows the category labels */}
            {showAxis && (
              <PolarAngleAxis dataKey={nameKey} className="text-xs fill-muted-foreground" />
            )}

            {/* Polar Radius Axis - shows the value scale */}
            {showAxis && (
              <PolarRadiusAxis
                angle={90}
                domain={[0, "dataMax"]}
                tick={false}
                tickCount={6}
                className="text-xs fill-muted-foreground"
              />
            )}

            {/* Tooltip enabled by default */}
            {showTooltip && (
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" hideLabel={false} />}
              />
            )}

            {/* Legend for multiple charts */}
            {showLegend && chart.type === "radar-multiple" && groupedKeys.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} />
            )}

            {renderRadarAreas()}
          </RadarChart>
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
          {chart.footerText || `Showing ${dataKey} data across ${chart.data.length} categories`}
        </div>
      </CardFooter>
    </Card>
  );
}
