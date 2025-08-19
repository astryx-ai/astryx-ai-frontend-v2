import type { EventType, TaskNotification } from "@/types/taskSchedulerType";
import { Calendar1, CalendarClock, CalendarCog, Clock3, type LucideIcon } from "lucide-react";

export const EVENT_TYPES: { value: EventType; label: string; icon: LucideIcon }[] = [
  { value: "EVENT_BASED", label: "Event Based", icon: CalendarCog },
  { value: "ONE_TIME", label: "One Time", icon: Calendar1 },
  { value: "TIME_AND_EVENT", label: "Time and Event", icon: CalendarClock },
  { value: "TIME_BASED", label: "Time Based", icon: Clock3 },
];

export const CRON_EXAMPLES = [
  {
    label: "Daily at 11:00 AM",
    value: "0 11 * * *",
    description: "Runs every day at 11:00 AM",
  },
  {
    label: "Every Monday at 9:00 AM",
    value: "0 9 * * 1",
    description: "Runs every Monday at 9:00 AM",
  },
  {
    label: "Every hour",
    value: "0 * * * *",
    description: "Runs every hour",
  },
  {
    label: "Every 30 minutes",
    value: "*/30 * * * *",
    description: "Runs every 30 minutes",
  },
  {
    label: "Weekdays at 5:00 PM",
    value: "0 17 * * 1-5",
    description: "Runs Monday to Friday at 5:00 PM",
  },
];

// export const DUMMY_TASKS: Task[] = [
//   {
//     id: "1",
//     title: "Daily Stock Price Check",
//     description: "Get the price of AAPL stock every day at 11:00 AM",
//     cronExpression: "0 11 * * *",
//     status: "active",
//     type: "stock_price",
//     createdAt: "2024-01-15T10:00:00Z",
//     lastRun: "2024-01-20T11:00:00Z",
//     nextRun: "2024-01-21T11:00:00Z",
//     userId: "user1",
//     isActive: true,
//     notificationSettings: {
//       email: true,
//       push: true,
//       inApp: true,
//     },
//   },
//   {
//     id: "2",
//     title: "Weekly Team Meeting Reminder",
//     description: "Remind about weekly team meeting every Monday",
//     cronExpression: "0 9 * * 1",
//     status: "active",
//     type: "reminder",
//     createdAt: "2024-01-10T14:30:00Z",
//     lastRun: "2024-01-15T09:00:00Z",
//     nextRun: "2024-01-22T09:00:00Z",
//     userId: "user1",
//     isActive: true,
//     notificationSettings: {
//       email: false,
//       push: true,
//       inApp: true,
//     },
//   },
//   {
//     id: "3",
//     title: "Market Data Update",
//     description: "Fetch latest market data every hour during trading hours",
//     cronExpression: "0 9-17 * * 1-5",
//     status: "paused",
//     type: "data_fetch",
//     createdAt: "2024-01-05T08:00:00Z",
//     lastRun: "2024-01-19T17:00:00Z",
//     nextRun: "2024-01-22T09:00:00Z",
//     userId: "user1",
//     isActive: false,
//     notificationSettings: {
//       email: true,
//       push: false,
//       inApp: true,
//     },
//   },
// ];

export const DUMMY_NOTIFICATIONS: TaskNotification[] = [
  {
    id: "1",
    taskId: "1",
    taskTitle: "Daily Stock Price Check",
    message: "AAPL stock price: $185.42 (up 2.3% from yesterday)",
    type: "success",
    status: "unread",
    createdAt: "2024-01-21T11:00:00Z",
    userId: "user1",
  },
  {
    id: "2",
    taskId: "2",
    taskTitle: "Weekly Team Meeting Reminder",
    message: "Your weekly team meeting starts in 15 minutes",
    type: "info",
    status: "unread",
    createdAt: "2024-01-22T08:45:00Z",
    userId: "user1",
  },
  {
    id: "3",
    taskId: "3",
    taskTitle: "Market Data Update",
    message: "Failed to fetch market data: Network timeout",
    type: "error",
    status: "read",
    createdAt: "2024-01-21T16:00:00Z",
    readAt: "2024-01-21T16:05:00Z",
    userId: "user1",
  },
  {
    id: "4",
    taskId: "1",
    taskTitle: "Daily Stock Price Check",
    message: "AAPL stock price: $183.15 (down 1.2% from yesterday)",
    type: "warning",
    status: "read",
    createdAt: "2024-01-20T11:00:00Z",
    readAt: "2024-01-20T11:30:00Z",
    userId: "user1",
  },
  {
    id: "5",
    taskId: "2",
    taskTitle: "Weekly Team Meeting Reminder",
    message: "Your weekly team meeting starts in 15 minutes",
    type: "info",
    status: "read",
    createdAt: "2024-01-15T08:45:00Z",
    readAt: "2024-01-15T09:00:00Z",
    userId: "user1",
  },
  {
    id: "6",
    taskId: "1",
    taskTitle: "Daily Stock Price Check",
    message: "AAPL stock price: $187.89 (up 2.6% from yesterday)",
    type: "success",
    status: "archived",
    createdAt: "2024-01-19T11:00:00Z",
    readAt: "2024-01-19T11:15:00Z",
    userId: "user1",
  },
];

export const TASK_STATUS_COLORS = {
  active: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400",
  paused: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400",
  completed: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400",
  failed: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400",
};

export const TASK_STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  failed: "Failed",
};

export const NOTIFICATION_TYPE_COLORS = {
  success: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400",
  error: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400",
  warning: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400",
  info: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400",
};

export const NOTIFICATION_TYPE_LABELS = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

export const NOTIFICATION_STATUS_COLORS = {
  unread: "text-white bg-blue-600 dark:bg-blue-500",
  read: "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300",
  archived: "text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400",
};
