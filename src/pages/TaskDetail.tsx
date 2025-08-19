import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Bell,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  Loader,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TASK_STATUS_COLORS,
  DUMMY_NOTIFICATIONS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_LABELS,
  EVENT_TYPES,
} from "@/constants/taskScheduler";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask, useGetTaskById } from "@/hooks/useTaskScheduler";
import type { Task } from "@/types/taskSchedulerType";
import cronstrue from "cronstrue";

function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "notifications">("overview");
  const { session, signOut } = useAuthStore();

  // Find the task by ID
  const { task, isLoading, refetch } = useGetTaskById(taskId);
  const taskDetails: Task | undefined = task?.data;

  const { deleteTask, isLoading: isDeleting } = useDeleteTask();

  // Get notifications for this task
  const taskNotifications = DUMMY_NOTIFICATIONS.filter(n => n.taskId === taskId);

  // Generate mock execution history
  const executionHistory = [
    {
      id: "1",
      status: "success",
      message: "Task executed successfully",
      timestamp: "2024-01-21T11:00:00Z",
      duration: "2.3s",
      data: { stockPrice: "$185.42", change: "+2.3%" },
    },
    {
      id: "2",
      status: "success",
      message: "Task executed successfully",
      timestamp: "2024-01-20T11:00:00Z",
      duration: "1.8s",
      data: { stockPrice: "$183.15", change: "-1.2%" },
    },
    {
      id: "3",
      status: "error",
      message: "Network timeout - failed to fetch data",
      timestamp: "2024-01-19T11:00:00Z",
      duration: "15.2s",
      data: null,
    },
    {
      id: "4",
      status: "success",
      message: "Task executed successfully",
      timestamp: "2024-01-18T11:00:00Z",
      duration: "2.1s",
      data: { stockPrice: "$187.89", change: "+2.6%" },
    },
    {
      id: "5",
      status: "success",
      message: "Task executed successfully",
      timestamp: "2024-01-17T11:00:00Z",
      duration: "1.9s",
      data: { stockPrice: "$185.23", change: "+0.8%" },
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "error":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleToggleTask = () => {
    toast.success("Task status updated");
  };

  const handleDeleteTask = () => {
    if (!taskId) return;
    deleteTask(
      { taskId },
      {
        onSuccess: () => {
          toast.success("Task deleted successfully");
          refetch();
          navigate("/task-scheduler");
        },
        onError: error => {
          toast.error(`Failed to delete task: ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={50} className="animate-spin" />
      </div>
    );
  }

  if (!taskDetails) {
    return (
      <div className="min-h-[100dvh] h-full w-full bg-white dark:bg-black-85 hide-scrollbar flex">
        <Sidebar showSidebar={showSidebar} />
        <MobileSidebar isOpen={showMobileSidebar} onClose={() => setShowMobileSidebar(false)} />

        <div className="min-h-full w-full flex flex-col">
          <Header
            user={session?.user}
            onSignOut={signOut}
            toggleSidebar={() => setShowSidebar(!showSidebar)}
            toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          />

          <div className="flex-grow p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-black-100 dark:text-white-100 mb-2">
                Task Not Found
              </h3>
              <p className="text-black-60 dark:text-white-60 mb-4">
                The task you're looking for doesn't exist or has been deleted.
              </p>
              <button
                onClick={() => navigate("/task-scheduler")}
                className="flex items-center gap-2 bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 text-black-100 dark:text-white-100 px-4 py-2 rounded-lg hover:bg-black-5 dark:hover:bg-white-5 transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = getTaskTypeInfo(taskDetails.event);

  return (
    <div className="min-h-[100dvh] h-full w-full bg-white dark:bg-black-85 hide-scrollbar flex">
      <Sidebar showSidebar={showSidebar} />
      <MobileSidebar isOpen={showMobileSidebar} onClose={() => setShowMobileSidebar(false)} />

      <div className="min-h-full w-full flex flex-col">
        <Header
          user={session?.user}
          onSignOut={signOut}
          toggleSidebar={() => setShowSidebar(!showSidebar)}
          toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        />

        <div className="flex-grow p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/task-scheduler")}
              className="flex items-center gap-2 bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 text-black-100 dark:text-white-100 px-3 py-2 rounded-lg hover:bg-black-5 dark:hover:bg-white-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black-100 dark:text-white-100">
                {taskDetails.taskQuery}
              </h1>
              <p className="text-black-60 dark:text-white-60 mt-1">
                Task Details & Execution History
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-black-40 dark:text-white-40 hover:text-black-100 dark:hover:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => toast.info("Edit functionality coming soon!")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleTask}>
                  {taskDetails.active ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {taskDetails.active ? "Pause Task" : "Activate Task"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteTask}
                  className="text-red-600 focus:text-red-600"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Task"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Task Overview Card */}
          <div className="bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {typeInfo?.icon && React.createElement(typeInfo.icon)}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-black-100 dark:text-white-100">
                    {taskDetails.taskQuery}
                  </h2>
                  <p className="text-black-60 dark:text-white-60">{taskDetails.query}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[`${taskDetails.active ? "active" : "paused"}`]}`}
              >
                {taskDetails.active ? "Active" : "Paused"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-black-40 dark:text-white-40" />
                <div>
                  <p className="text-sm text-black-40 dark:text-white-40">Schedule</p>
                  <p className="text-black-100 dark:text-white-100 font-mono">
                    {cronstrue.toString(taskDetails.cron)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-black-40 dark:text-white-40" />
                <div>
                  <p className="text-sm text-black-40 dark:text-white-40">Created At</p>
                  <p className="text-black-100 dark:text-white-100">
                    {formatDate(taskDetails.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-black-40 dark:text-white-40" />
                <div>
                  <p className="text-sm text-black-40 dark:text-white-40">Notifications</p>
                  <p className="text-black-100 dark:text-white-100">
                    {taskNotifications.length} received
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-black-10 dark:border-white-30 mb-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-black-100 dark:text-white-100 border-b-2 border-black-100 dark:border-white-100"
                  : "text-black-40 dark:text-white-40 hover:text-black-100 dark:hover:text-white-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "text-black-100 dark:text-white-100 border-b-2 border-black-100 dark:border-white-100"
                  : "text-black-40 dark:text-white-40 hover:text-black-100 dark:hover:text-white-100"
              }`}
            >
              Execution History ({executionHistory.length})
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "text-black-100 dark:text-white-100 border-b-2 border-black-100 dark:border-white-100"
                  : "text-black-40 dark:text-white-40 hover:text-black-100 dark:hover:text-white-100"
              }`}
            >
              Notifications ({taskNotifications.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === "overview" && (
              <div className="bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-black-100 dark:text-white-100 mb-4">
                  Task Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-black-100 dark:text-white-100 mb-3">
                      Basic Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-black-40 dark:text-white-40">
                          Task Type
                        </label>
                        <p className="text-black-100 dark:text-white-100">{typeInfo?.label}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-black-40 dark:text-white-40">
                          Created
                        </label>
                        <p className="text-black-100 dark:text-white-100">
                          {formatDate(taskDetails.createdAt)}
                        </p>
                      </div>
                      {/* <div>
                        <label className="block text-sm text-black-40 dark:text-white-40">
                          Last Run
                        </label>
                        <p className="text-black-100 dark:text-white-100">
                          {task.lastRun ? formatDate(task.lastRun) : "Never"}
                        </p>
                      </div> */}
                    </div>
                  </div>

                  {/* <div>
                    <h4 className="font-medium text-black-100 dark:text-white-100 mb-3">
                      Notification Settings
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(task.notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          <span className="text-sm text-black-100 dark:text-white-100 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {executionHistory.map(execution => (
                  <div
                    key={execution.id}
                    className="bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}
                        >
                          {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                        </span>
                        <span className="text-sm text-black-40 dark:text-white-40">
                          {formatDate(execution.timestamp)}
                        </span>
                        <span className="text-sm text-black-40 dark:text-white-40">
                          Duration: {execution.duration}
                        </span>
                      </div>
                    </div>

                    <p className="text-black-100 dark:text-white-100 mb-3">{execution.message}</p>

                    {execution.data && (
                      <div className="bg-black-5 dark:bg-white-5 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-black-100 dark:text-white-100 mb-2">
                          Execution Data
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {Object.entries(execution.data).map(([key, value]) => (
                            <div key={key}>
                              <span className="text-black-40 dark:text-white-40 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <span className="text-black-100 dark:text-white-100 ml-1">
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                {taskNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔔</div>
                    <h3 className="text-lg font-medium text-black-100 dark:text-white-100 mb-2">
                      No Notifications
                    </h3>
                    <p className="text-black-60 dark:text-white-60">
                      This task hasn't generated any notifications yet.
                    </p>
                  </div>
                ) : (
                  taskNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className="bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${NOTIFICATION_TYPE_COLORS[notification.type]}`}
                          >
                            {NOTIFICATION_TYPE_LABELS[notification.type]}
                          </span>
                          <span className="text-sm text-black-40 dark:text-white-40">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-black-100 dark:text-white-100 mb-3">
                        {notification.message}
                      </p>

                      <div className="text-sm text-black-40 dark:text-white-40">
                        Status:{" "}
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                        {notification.readAt && (
                          <>
                            <span className="mx-2">•</span>
                            Read: {formatDate(notification.readAt)}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
