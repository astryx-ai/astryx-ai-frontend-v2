export interface Task {
  id: string;
  userId: string;
  query: string;
  taskQuery: string;
  cron: string;
  createdAt: string;
  active: boolean;
  event: EventType;
  scheduled_datetime: string | null;
}

export type EventType = "TIME_BASED" | "EVENT_BASED" | "TIME_AND_EVENT" | "ONE_TIME";

export type TaskStatus = "active" | "paused" | "completed" | "failed";

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  cronExpression: string;
  type: EventType;
  notificationSettings: NotificationSettings;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  cronExpression?: string;
  status?: TaskStatus;
  isActive?: boolean;
  notificationSettings?: NotificationSettings;
}

export interface TaskNotification {
  id: string;
  taskId: string;
  taskTitle: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  userId: string;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export type NotificationStatus = "unread" | "read" | "archived";
