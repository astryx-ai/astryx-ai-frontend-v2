import { useState } from "react";
import { useGetAllTasks } from "@/hooks/useTaskScheduler";
import type { Task } from "@/types/taskSchedulerType";
import { BellDotIcon, ChevronDown, ChevronRight, Loader } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type SchedulerReminderProps = {
  closePopover?: () => void;
  closeSheet?: () => void;
};

const SchedulerReminder = ({ closePopover, closeSheet }: SchedulerReminderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { allTasks, isLoading, isFetching } = useGetAllTasks(1, 10);
  const tasks: Task[] = allTasks?.data || [];

  const loading = isLoading || isFetching;
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(prev => (prev === taskId ? null : taskId));
  };

  const handleAddNewButton = () => {
    if (location.pathname === "/") {
      // On home already — close popover or sheet
      if (closePopover) closePopover(); //desktop
      if (closeSheet) closeSheet(); // mobile
    } else {
      navigate("/");
    }
  };

  return (
    <div>
      <div className="p-0 border-none shadow-xl rounded-xl max-w-md scheduler-box-shadow bg-white dark:bg-black-80 backdrop-blur-sm relative hidden md:block">
        <div className="bg-white dark:bg-black-80 z-10 h-3 w-3 border-3 border-transparent border-t-[#0047FF] border-l-[#0047FF] dark:border-t-white/10 dark:border-l-white/10 absolute rotate-[45deg] left-0 right-0 translate-x-[318px] lg:translate-x-[300px] -top-1"></div>

        <div className="border-2 border-[#0047FF] dark:border-white/10 rounded-xl p-4 text-black relative">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col justify-center items-center dark:text-white space-y-2">
              <Loader className="animate-spin" />
              <p>Loading reminders...</p>
            </div>
          )}

          {/* Tasks Available */}
          {!loading && tasks.length > 0 ? (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-2 mt-3">
                <p className="text-sm font-semibold text-[#0047FF] dark:text-white">
                  SCHEDULED REMINDERS
                </p>
                <button
                  onClick={handleAddNewButton}
                  className="text-sm font-semibold text-[#0047FF] dark:text-white dark:hover:bg-black-90 rounded-full px-3 py-2 cursor-pointer"
                >
                  +ADD NEW
                </button>
              </div>
              <hr className="mb-4" />

              {/* Task List (limited to 3) */}
              {tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`flex flex-col dark:bg-black-70  dark:hover:bg-black-60 rounded-2xl p-3 mb-3 cursor-pointer transition ${expandedTaskId === task.id ? "bg-blue-600 text-white" : "bg-white hover:text-black hover:bg-gray-100"}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => toggleExpand(task.id)}
                      className="flex items-start space-x-2"
                    >
                      {expandedTaskId === task.id ? (
                        <ChevronDown className="dark:text-white" size={20} />
                      ) : (
                        <ChevronRight className="dark:text-white" size={20} />
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm font-medium dark:text-white">{task.taskQuery}</p>

                        {/* Expanded content */}
                        {expandedTaskId === task.id && (
                          <div
                            className={`mt-2 text-xs dark:text-gray-300 space-y-1 ${expandedTaskId === task.id ? "text-white" : "text-gray-700"}`}
                          >
                            <p>
                              <strong>Event:</strong> {task.event.split("_").join(" ")}
                            </p>
                            {task.scheduled_datetime && (
                              <p>
                                <strong>Scheduled:</strong>{" "}
                                {new Date(task.scheduled_datetime).toLocaleString()}
                              </p>
                            )}
                            <p>
                              <strong>Status:</strong> {task.active ? "Active" : "Inactive"}
                            </p>

                            <button
                              className="text-white dark:text-gray-200 mt-1 text-xs cursor-pointer hover:underline hover:underline-offset-1"
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/task-scheduler/${task.id}`);
                              }}
                            >
                              View Full Details →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show More Button */}
              <div className="text-center mt-4">
                <button
                  className="bg-blue-600 dark:bg-black-90 rounded-full cursor-pointer px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
                  onClick={() => navigate("/task-scheduler")}
                >
                  Show More
                </button>
              </div>
            </div>
          ) : null}

          {/* Empty State */}
          {!loading && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 px-4 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-black-60 text-blue-600 dark:text-white rounded-full flex items-center justify-center text-4xl">
                <BellDotIcon size={40} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                No Reminders Yet
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
                Reminders help you stay on top of important updates. You can create one by simply
                typing what you want to track.
              </p>

              <div className="bg-gray-100 dark:bg-black-70 rounded-md p-3 text-left text-sm text-gray-800 dark:text-gray-200 max-w-xs w-full">
                <p className="mb-1 font-medium text-[#0047FF] dark:text-white">Example:</p>
                <p>📝 “Remind me to check BSE stock every Monday at 10am”</p>
                <p>🕒 “Schedule a task for Apple earnings report on Aug 25”</p>
                <p>📈 “Alert me when Nifty 50 drops below 21,000”</p>
              </div>

              <button
                className="text-sm px-4 py-2 bg-blue-600 dark:bg-black-50 cursor-pointer text-white rounded-full hover:bg-blue-700 transition mt-2"
                onClick={() => navigate("/")}
              >
                Create a Reminder
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Just type your reminder — we’ll handle the scheduling.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="p-4 text-black relative overflow-y-auto h-[80vh]">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col justify-center items-center dark:text-white space-y-2">
              <Loader className="animate-spin" />
              <p>Loading reminders...</p>
            </div>
          )}

          {/* Tasks Available */}
          {!loading && tasks.length > 0 ? (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-2 mt-3">
                <p className="text-sm font-semibold text-[#0047FF] dark:text-white">
                  SCHEDULED REMINDERS
                </p>
                <button
                  onClick={handleAddNewButton}
                  className="text-sm font-semibold text-[#0047FF] dark:text-white dark:hover:bg-black-90 rounded-full px-3 py-2 cursor-pointer"
                >
                  +ADD NEW
                </button>
              </div>
              <hr className="mb-4" />

              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`flex flex-col dark:bg-black-70  dark:hover:bg-black-60 rounded-2xl p-3 mb-3 cursor-pointer transition ${expandedTaskId === task.id ? "bg-blue-600 text-white" : "bg-white hover:text-black hover:bg-gray-100"}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => toggleExpand(task.id)}
                      className="flex items-start space-x-2"
                    >
                      {expandedTaskId === task.id ? (
                        <ChevronDown className="dark:text-white" size={20} />
                      ) : (
                        <ChevronRight className="dark:text-white" size={20} />
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm font-medium dark:text-white">{task.taskQuery}</p>

                        {/* Expanded content */}
                        {expandedTaskId === task.id && (
                          <div
                            className={`mt-2 text-xs dark:text-gray-300 space-y-1 ${expandedTaskId === task.id ? "text-white" : "text-gray-700"}`}
                          >
                            <p>
                              <strong>Event:</strong> {task.event}
                            </p>
                            {task.scheduled_datetime && (
                              <p>
                                <strong>Scheduled:</strong>{" "}
                                {new Date(task.scheduled_datetime).toLocaleString()}
                              </p>
                            )}
                            <p>
                              <strong>Status:</strong> {task.active ? "Active" : "Inactive"}
                            </p>

                            <button
                              className="text-white mt-1 text-xs cursor-pointer hover:underline hover:underline-offset-1"
                              onClick={e => {
                                e.stopPropagation();
                                navigate(`/task-scheduler/${task.id}`);
                              }}
                            >
                              View Full Details →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Empty State */}
          {!loading && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 px-4 text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-black-60 text-blue-600 dark:text-white rounded-full flex items-center justify-center text-4xl">
                <BellDotIcon size={40} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                No Reminders Yet
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
                Reminders help you stay on top of important updates. You can create one by simply
                typing what you want to track.
              </p>

              <div className="bg-gray-100 dark:bg-black-70 rounded-md p-3 text-left text-sm text-gray-800 dark:text-gray-200 max-w-xs w-full">
                <p className="mb-1 font-medium text-[#0047FF] dark:text-white">Example:</p>
                <p>📝 “Remind me to check BSE stock every Monday at 10am”</p>
                <p>🕒 “Schedule a task for Apple earnings report on Aug 25”</p>
                <p>📈 “Alert me when Nifty 50 drops below 21,000”</p>
              </div>

              <button
                className="text-sm px-4 py-2 bg-blue-600 dark:bg-black-50 cursor-pointer text-white rounded-full hover:bg-blue-700 transition mt-2"
                onClick={() => navigate("/")}
              >
                Create a Reminder
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Just type your reminder — we’ll handle the scheduling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulerReminder;
