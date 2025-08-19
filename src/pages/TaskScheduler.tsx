import React, { useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  MoreVertical,
  Bell,
  ChevronDown,
  InfoIcon,
  ArrowLeft,
} from "lucide-react";
import { EVENT_TYPES, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/constants/taskScheduler";
import type { Task, TaskStatus, EventType } from "@/types/taskSchedulerType";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useDeleteTask, useGetAllTasks } from "@/hooks/useTaskScheduler";
import cronstrue from "cronstrue";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function TaskScheduler() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  // const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");

  const { allTasks, refetch } = useGetAllTasks(1, 10);
  const tasks: Task[] = allTasks?.data || [];

  const { deleteTask, isLoading: isDeleting } = useDeleteTask();
  const { session, signOut } = useAuthStore();
  const navigate = useNavigate();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskQuery.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && task.active) ||
      (statusFilter === "paused" && !task.active);

    const matchEventType = typeFilter === "all" || task.event === typeFilter;

    return matchesSearch && matchesStatus && matchEventType;
  });

  const handleDeleteTask = (taskId: string) => {
    console.log("Deleted taskId", taskId);
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

  const getTaskTypeInfo = (type: EventType) => {
    return EVENT_TYPES.find(t => t.value === type);
  };

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
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 text-black-100 dark:text-white-100 px-3 py-2 rounded-lg hover:bg-black-5 dark:hover:bg-white-5 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black-100 dark:text-white-100">
                Task Scheduler
              </h1>
              <p className="text-black-60 dark:text-white-60 mt-1">
                Manage your automated tasks and reminders
              </p>
            </div>
            <div className="flex sm:flex-col md:flex-row items-center gap-2">
              <button
                onClick={() => navigate("/task-notifications")}
                className="flex items-center gap-2 bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 text-black-100 dark:text-white-100 px-4 py-2 rounded-lg hover:bg-black-5 dark:hover:bg-white-5 transition-colors "
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>
              <TooltipProvider>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 bg-white cursor-pointer dark:bg-black-90 border border-black-10 dark:border-white-30 text-black-100 dark:text-white-100 px-4 py-2 rounded-lg hover:bg-black-5 dark:hover:bg-white-5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Scheduler
                  {/* Info Tooltip on hover */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <InfoIcon className="w-4 h-4 hover:text-blue-600 dark:hover:text-blue-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="w-72 text-xs text-left leading-relaxed">
                      <p className="font-medium text-sm mb-1 text-white dark:text-gray-700">
                        How it works:
                      </p>
                      <p>Use natural language prompts like:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Remind me BSE stock every Monday at 10am</li>
                        <li>Schedule task for Apple earnings every month</li>
                        <li>Notify when Nifty drops below 21,000</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </button>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black-40 dark:text-white-40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-black-10 dark:border-white-30 rounded-lg bg-white dark:bg-black-90 text-black-100 dark:text-white-100 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-white-30"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 border border-black-10 dark:border-white-30 rounded-lg bg-white dark:bg-black-90 text-black-100 dark:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 transition-colors">
                  <span>
                    {statusFilter === "all"
                      ? "All Status"
                      : TASK_STATUS_LABELS[statusFilter as TaskStatus]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={value => setStatusFilter(value as TaskStatus | "all")}
                >
                  <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="paused">Paused</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 border border-black-10 dark:border-white-30 rounded-lg bg-white dark:bg-black-90 text-black-100 dark:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 transition-colors">
                  <span>
                    {typeFilter === "all"
                      ? "All Types"
                      : EVENT_TYPES.find(t => t.value === typeFilter)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={value => setTypeFilter(value as EventType | "all")}
                >
                  <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                  {EVENT_TYPES.map(type => (
                    <DropdownMenuRadioItem key={type.value} value={type.value}>
                      {type.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-4">
            {tasks.length > 0 ? (
              filteredTasks.map(task => {
                const typeInfo = getTaskTypeInfo(task.event);
                return (
                  <div
                    key={task.id}
                    className={`bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => navigate(`/task-scheduler/${task.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl p-1 bg-gray-100 dark:bg-gray-600 rounded-full">
                            {typeInfo?.icon && React.createElement(typeInfo.icon)}
                          </span>
                          <h3 className="text-lg font-medium text-black-100 dark:text-white-100">
                            {task.taskQuery}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[`${task.active ? "active" : "paused"}`]}`}
                          >
                            {task.active ? "Active" : "Paused"}
                          </span>
                        </div>

                        <p className="text-black-60 dark:text-white-60 mb-3">{task.query}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-black-40 dark:text-white-40">
                          <div>
                            <span className="font-medium">Schedule:</span>{" "}
                            {cronstrue.toString(task.cron, { verbose: true })}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 text-black-40 dark:text-white-40 hover:text-black-100 dark:hover:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 rounded-lg transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              navigate(`/task-scheduler/${task.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="text-red-600 focus:text-red-600"
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? "Deleting..." : "Delete Task"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center translate-y-[50px]">
                <h3>No Task has scheduled yet!</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskScheduler;
