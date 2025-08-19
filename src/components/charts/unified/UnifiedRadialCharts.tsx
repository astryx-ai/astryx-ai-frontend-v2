import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { RadialBar, RadialBarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
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

// Radial chart type definition
interface UnifiedRadialChartPayload {
  type: "radial-standard" | "radial-stacked";
  title?: string; // Optional
  description?: string; // Optional
  data: any[];

  // Core configuration
  dataKey?: string;
  nameKey?: string; // Key for radial bar labels
  groupedKeys?: string[]; // Required for stacked

  // Styling options
  color?: string | string[]; // Optional - will auto-generate if not provided
  height?: number;

  // Feature toggles
  showGrid?: boolean;
  showAxis?: boolean;
  showTooltip?: boolean;
  showCenterText?: boolean;

  // Center text for default charts
  centerText?: string | number;
  centerLabel?: string;

  // Footer customization
  trendText?: string;
  footerText?: string;
}

export function UnifiedRadialChart({ chart }: { chart: UnifiedRadialChartPayload }) {
  // Determine required colors count
  const getColorCount = (): number => {
    if (chart.type === "radial-stacked") {
      return chart.groupedKeys?.length || 1;
    }
    return chart.data.length;
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
    ) || "name",
    height = 400,
    showGrid = false,
    showAxis = false,
    showTooltip = true,
    showCenterText = chart.type === "radial-standard",
    centerText,
    centerLabel,
    groupedKeys = [],
  } = chart;

  // Auto-managed values
  const innerRadius = 30;
  const outerRadius = 110;
  const startAngle = 90;
  const endAngle = 450;
  const cornerRadius = 10;
  const showLegend = true;

  const colors = getColors();

  // Calculate trend for footer
  const calculateTrend = () => {
    if (chart.data.length < 2) return null;

    // For radial charts, calculate based on primary data key
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

  // Transform data for radial chart
  const transformData = () => {
    if (chart.type === "radial-stacked") {
      // For stacked radial, we need to create layers
      return chart.data.map(item => {
        const transformed: any = { ...item };
        let cumulativeValue = 0;

        groupedKeys.forEach(key => {
          cumulativeValue += Number(item[key]) || 0;
          transformed[`${key}_end`] = cumulativeValue;
        });

        return transformed;
      });
    }

    // For default radial, add fill property for each data point
    return chart.data.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length],
    }));
  };

  // Generate dynamic chart config
  const generateChartConfig = () => {
    const config: any = {};

    if (chart.type === "radial-stacked" && groupedKeys.length > 0) {
      // Stacked radial configuration
      groupedKeys.forEach((key, index) => {
        config[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: colors[index % colors.length],
        };
      });
    } else {
      // Default radial configuration - use name key for categories
      chart.data.forEach((item, index) => {
        const key = item[nameKey] || `item-${index}`;
        config[key] = {
          label:
            String(item[nameKey] || key)
              .charAt(0)
              .toUpperCase() + String(item[nameKey] || key).slice(1),
          color: colors[index % colors.length],
        };
      });
    }

    return config;
  };

  const chartConfig = generateChartConfig();
  const transformedData = transformData();
  const trend = calculateTrend();

  // Calculate total for center text
  const calculateCenterValue = () => {
    if (centerText !== undefined) return centerText;

    if (chart.type === "radial-stacked") {
      // For stacked, sum all values
      return chart.data.reduce((sum, item) => {
        return sum + groupedKeys.reduce((keySum, key) => keySum + (Number(item[key]) || 0), 0);
      }, 0);
    }

    // For standard, sum primary data key
    return chart.data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
  };

  const centerValue = calculateCenterValue();

  // Render radial bars based on chart type
  const renderRadialBars = () => {
    if (chart.type === "radial-stacked") {
      // const startAngleOffset = 0;
      // const totalAngle = endAngle - startAngle;
      // const anglePerItem = totalAngle / chart.data.length;

      return groupedKeys.map((key, keyIndex) => (
        <RadialBar
          key={key}
          dataKey={key}
          stackId="stack"
          cornerRadius={cornerRadius}
          fill={colors[keyIndex % colors.length]}
          className="stroke-transparent stroke-2"
        />
      ));
    }

    // Default radial bar
    return (
      <RadialBar
        dataKey={dataKey}
        cornerRadius={cornerRadius}
        className="stroke-background stroke-2"
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
          <RadialBarChart
            data={transformedData}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
          >
            {/* Polar Grid - optional */}
            {showGrid && <PolarGrid />}

            {/* Polar Angle Axis - optional */}
            {showAxis && (
              <PolarAngleAxis
                type="category"
                dataKey={nameKey}
                className="text-xs fill-muted-foreground"
              />
            )}

            {/* Polar Radius Axis - optional */}
            {showAxis && (
              <PolarRadiusAxis
                type="number"
                domain={[0, "dataMax"]}
                tick={false}
                className="text-xs fill-muted-foreground"
              />
            )}

            {/* Tooltip enabled by default */}
            {showTooltip && (
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel={chart.type === "radial-standard"}
                    formatter={(value, name) => [
                      typeof value === "number" ? value.toLocaleString() : value,
                      chartConfig[String(name)]?.label || name,
                    ]}
                  />
                }
              />
            )}

            {/* Legend for stacked charts */}
            {showLegend && chart.type === "radial-stacked" && groupedKeys.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" height={36} />
            )}

            {renderRadialBars()}

            {/* Center text */}
            {showCenterText && (
              <>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-3xl font-bold fill-foreground"
                >
                  {typeof centerValue === "number" ? centerValue.toLocaleString() : centerValue}
                </text>
                {centerLabel && (
                  <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm fill-muted-foreground"
                  >
                    {centerLabel}
                  </text>
                )}
              </>
            )}
          </RadialBarChart>
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
          {chart.footerText ||
            `Showing ${chart.type === "radial-stacked" ? "stacked" : dataKey} data from ${chart.data.length} ${chart.data.length === 1 ? "category" : "categories"}`}
        </div>
      </CardFooter>
    </Card>
  );
}
