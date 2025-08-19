export type NewChatType = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
};

// Generic chart data point (AI responses may contain arbitrary keys, e.g. company & market_share)
export interface ChartDataPoint {
  [key: string]: string | number | undefined;
}

export interface AiChartData {
  data: ChartDataPoint[];
  type: string; // e.g. "bar-standard"
  title: string;
  dataKey: string; // numeric metric key, e.g. "market_share"
  nameKey: string; // categorical key, e.g. "company"
  description: string;
}

export interface SourceLinkPreview {
  title?: string;
  image?: string;
  url: string;
}

export interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: string;
  isNewMessage?: boolean;
  responseTime?: number;
  aiChartData?: AiChartData | null;
  aiResponseSources?: SourceLinkPreview[] | null;
}

export type AddNewMessageType = {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  isAi: boolean;
  aiChartData?: AiChartData | null;
  createdAt: string;
  aiResponseSources?: SourceLinkPreview[] | null;
};
