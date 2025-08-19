type ChartData = {
  [key: string]: string | number;
};

export type ChartPayload = {
  type: string;
  title: string;
  description?: string;
  data: ChartData[];
  dataKey: string;
  nameKey?: string; // for pie / radar / radial or categorical label key
  xAxisKey?: string;
  height?: number;
  color?: string | string[];
  groupedKeys?: string[];
};
