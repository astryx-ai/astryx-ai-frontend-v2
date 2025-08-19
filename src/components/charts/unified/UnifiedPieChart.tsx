import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Pie, PieChart, Cell, Label, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
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
  ChartStyle,
} from "@/components/ui/chart";
import { generateBlueShades } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Colors now generated from a single blue palette

// Pie chart type definition
interface UnifiedPieChartPayload {
  type: "pie-standard" | "pie-label" | "pie-donut" | "pie-interactive";
  title?: string; // Optional
  description?: string; // Optional
  data: any[];

  // Core configuration
  dataKey?: string;
  nameKey?: string; // Key for slice labels/names

  // Styling options
  color?: string | string[]; // Optional - will auto-generate if not provided
  height?: number;

  // Feature toggles
  showLabels?: boolean;
  showTooltip?: boolean;

  // Interactive options
  centerLabel?: string; // Label for center text in interactive/donut charts

  // Footer customization
  trendText?: string;
  footerText?: string;
}

export function UnifiedPieChart({ chart }: { chart: UnifiedPieChartPayload }) {
  // Generate unique ID for ChartStyle
  const chartId = `pie-chart-${Math.random().toString(36).substr(2, 9)}`;

  // State for interactive functionality
  const [activeItem, setActiveItem] = useState<string>(
    chart.type === "pie-interactive" && chart.data.length > 0
      ? chart.data[0][chart.nameKey || "name"]
      : ""
  );

  // Auto-generate colors if not provided
  const getColors = (): string[] => {
    if (chart.color) {
      if (Array.isArray(chart.color)) {
        return chart.color;
      }
      return [chart.color];
    }

    // Auto-generate colors based on data length
    return generateBlueShades(chart.data.length);
  };

  // Default values
  const {
    dataKey = Object.keys(chart.data[0] || {}).find(
      key => typeof chart.data[0]?.[key] === "number"
    ) || "value",
    nameKey = Object.keys(chart.data[0] || {}).find(key => key !== dataKey) || "name",
    height = 400,
    showTooltip = true,
    centerLabel = "Visitors",
  } = chart;

  // Auto-managed values
  const innerRadius = chart.type === "pie-donut" ? 60 : chart.type === "pie-interactive" ? 60 : 0;
  const outerRadius = 80;
  const startAngle = 90;
  const endAngle = 450;
  const paddingAngle = 0;
  const showLegend = false;

  const colors = getColors();

  // Calculate trend for footer
  const calculateTrend = () => {
    if (chart.data.length < 2) return null;

    const sortedData = [...chart.data].sort((a, b) => Number(b[dataKey]) - Number(a[dataKey]));
    const currentValue = Number(sortedData[0]?.[dataKey]) || 0;
    const previousValue = Number(sortedData[1]?.[dataKey]) || 0;

    if (previousValue === 0) return null;

    const trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
    const isPositive = trendPercentage > 0;

    return {
      percentage: Math.abs(trendPercentage).toFixed(1),
      isPositive,
      text:
        chart.trendText ||
        `Trending ${isPositive ? "up" : "down"} by ${Math.abs(trendPercentage).toFixed(1)}% this month`,
    };
  };

  // Generate dynamic chart config for interactive charts
  const generateChartConfig = () => {
    const config: any = {};

    // Add main data key config
    config[dataKey] = {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
    };

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

    return config;
  };

  const chartConfig = generateChartConfig();
  const trend = calculateTrend();

  // Transform data to include fill colors
  const transformedData = chart.data.map((item, index) => ({
    ...item,
    fill:
      chart.type === "pie-interactive"
        ? `var(--color-${item[nameKey]})`
        : colors[index % colors.length],
  }));

  // Interactive chart logic
  const activeIndex = useMemo(() => {
    if (chart.type !== "pie-interactive") return undefined;
    return chart.data.findIndex(item => item[nameKey] === activeItem);
  }, [activeItem, chart.data, chart.type, nameKey]);

  const availableItems = useMemo(() => {
    return chart.data.map(item => item[nameKey]);
  }, [chart.data, nameKey]);

  // Active shape for interactive charts
  const renderActiveShape = (props: PieSectorDataItem) => {
    const { outerRadius = 0, ...restProps } = props;
    return (
      <g>
        <Sector {...restProps} outerRadius={outerRadius + 10} />
        <Sector {...restProps} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
      </g>
    );
  };

  // Center label for interactive charts
  const renderCenterLabel = ({ viewBox }: any) => {
    if (
      viewBox &&
      "cx" in viewBox &&
      "cy" in viewBox &&
      chart.type === "pie-interactive" &&
      activeIndex !== undefined
    ) {
      const activeData = chart.data[activeIndex];
      return (
        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
            {Number(activeData[dataKey]).toLocaleString()}
          </tspan>
          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
            {centerLabel}
          </tspan>
        </text>
      );
    }
  };

  return (
    <Card
      data-chart={chart.type === "pie-interactive" ? chartId : undefined}
      className="flex flex-col"
    >
      {/* Chart Style for interactive charts */}
      {chart.type === "pie-interactive" && <ChartStyle id={chartId} config={chartConfig} />}

      {/* Conditional Header */}
      {(chart.title || chart.description || chart.type === "pie-interactive") && (
        <CardHeader
          className={
            chart.type === "pie-interactive"
              ? "flex-row items-start space-y-0 pb-0"
              : "items-center pb-0"
          }
        >
          <div className={chart.type === "pie-interactive" ? "grid gap-1" : ""}>
            {chart.title && <CardTitle>{chart.title}</CardTitle>}
            {chart.description && <CardDescription>{chart.description}</CardDescription>}
          </div>

          {/* Interactive dropdown */}
          {chart.type === "pie-interactive" && (
            <Select value={activeItem} onValueChange={setActiveItem}>
              <SelectTrigger
                className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent align="end" className="rounded-xl">
                {availableItems.map(key => {
                  const config = chartConfig[key as keyof typeof chartConfig];
                  if (!config) return null;

                  return (
                    <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="flex h-3 w-3 shrink-0 rounded-xs"
                          style={{
                            backgroundColor: `var(--color-${key})`,
                          }}
                        />
                        {config?.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </CardHeader>
      )}

      <CardContent
        className={
          chart.type === "pie-interactive" ? "flex flex-1 justify-center pb-0" : "flex-1 pb-0"
        }
      >
        <ChartContainer
          id={chart.type === "pie-interactive" ? chartId : undefined}
          config={chartConfig}
          className={
            chart.type === "pie-interactive"
              ? "mx-auto aspect-square w-full max-w-[300px]"
              : chart.type === "pie-label"
                ? "[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
                : "w-full aspect-auto"
          }
          style={
            chart.type === "pie-interactive" || chart.type === "pie-label" ? undefined : { height }
          }
        >
          <PieChart>
            {/* Tooltip */}
            {showTooltip && (
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            )}

            <Pie
              data={transformedData}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              startAngle={startAngle}
              endAngle={endAngle}
              paddingAngle={paddingAngle}
              strokeWidth={chart.type === "pie-interactive" ? 5 : 0}
              activeShape={chart.type === "pie-interactive" ? renderActiveShape : undefined}
              label={chart.type === "pie-label"} // Enable labels for label type
            >
              {/* Render colored cells only for non-interactive charts */}
              {chart.type !== "pie-interactive" &&
                chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}

              {/* Center label for interactive charts */}
              {chart.type === "pie-interactive" && <Label content={renderCenterLabel} />}
            </Pie>

            {/* Legend for default charts */}
            {showLegend && chart.type === "pie-standard" && (
              <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" height={36} />
            )}
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* Footer - only for non-interactive charts */}
      {chart.type !== "pie-interactive" && (
        <CardFooter className="flex-col gap-2 text-sm">
          {trend && (
            <div className="flex items-center gap-2 leading-none font-medium">
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
              `Showing total ${centerLabel.toLowerCase()} for the last ${chart.data.length} ${chart.data.length === 1 ? "period" : "periods"}`}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
