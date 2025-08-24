import React from "react";
import { AlignHorizontalDistributeCenter, ArrowLeft, ChartLine } from "lucide-react";

export interface Strategy {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const STRATEGIES: Strategy[] = [
  {
    id: "volume-spike-1",
    title: "Volume Spike Detection",
    description: "Alert me when unusual volume spikes occur in small-cap tech stocks.",
    icon: <AlignHorizontalDistributeCenter size={20} />,
  },
  {
    id: "mean-reversion-1",
    title: "Mean Reversion Strategy",
    description: "Find stocks that tend to bounce back after dropping more than 5% in one day.",
    icon: <ArrowLeft size={20} />,
  },
  {
    id: "historical-patterns",
    title: "Compare Historical Patterns",
    description: "Show me how TCS and Infosys reacted to rate hikes over the past 10 years.",
    icon: <ChartLine size={20} />,
  },
  {
    id: "volume-spike-2",
    title: "Volume Spike Detection",
    description: "Alert me when unusual volume spikes occur in small-cap tech stocks.",
    icon: <ChartLine size={20} />,
  },
  {
    id: "mean-reversion-2",
    title: "Mean Reversion Strategy",
    description: "Find stocks that tend to bounce back after dropping more than 5% in one day.",
    icon: <ArrowLeft size={20} />,
  },
];
