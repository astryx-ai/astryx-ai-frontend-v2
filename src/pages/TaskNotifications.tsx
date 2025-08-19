import { useState } from "react";
import { Bell, Check, Archive, Trash2, Search, MoreVertical, ChevronDown } from "lucide-react";
import {
  DUMMY_NOTIFICATIONS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_STATUS_COLORS,
} from "@/constants/taskScheduler";
import type {
  TaskNotification,
  NotificationType,
  NotificationStatus,
} from "@/types/taskSchedulerType";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

function TaskNotifications() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [notifications, setNotifications] = useState<TaskNotification[]>(DUMMY_NOTIFICATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
  const { session, signOut } = useAuthStore();

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      notification.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? {
              ...notification,
              status: "read" as NotificationStatus,
              readAt: new Date().toISOString(),
            }
          : notification
      )
    );
    toast.success("Notification marked as read");
  };

  const handleArchive = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, status: "archived" as NotificationStatus }
          : notification
      )
    );
    toast.success("Notification archived");
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    toast.success("Notification deleted");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.status === "unread"
          ? {
              ...notification,
              status: "read" as NotificationStatus,
              readAt: new Date().toISOString(),
            }
          : notification
      )
    );
    toast.success("All notifications marked as read");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.status === "unread").length;
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black-100 dark:text-white-100">
                Task Notifications
              </h1>
              <p className="text-black-60 dark:text-white-60 mt-1">
                View and manage your task notifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getUnreadCount() > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 text-black-100 dark:text-white-100 px-4 py-2 rounded-lg hover:bg-black-5 dark:hover:bg-white-5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black-40 dark:text-white-40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-black-10 dark:border-white-30 rounded-lg bg-white dark:bg-black-90 text-black-100 dark:text-white-100 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-white-30"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 border border-black-10 dark:border-white-30 rounded-lg bg-white dark:bg-black-90 text-black-100 dark:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 transition-colors">
                  <span>
                    {typeFilter === "all"
                      ? "All Types"
                      : NOTIFICATION_TYPE_LABELS[typeFilter as NotificationType]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={value => setTypeFilter(value as NotificationType | "all")}
                >
                  <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="success">Success</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="error">Error</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="warning">Warning</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="info">Info</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 border border-black-10 dark:border-white-30 rounded-lg bg-white dark:bg-black-90 text-black-100 dark:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 transition-colors">
                  <span>
                    {statusFilter === "all"
                      ? "All Status"
                      : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={value => setStatusFilter(value as NotificationStatus | "all")}
                >
                  <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unread">Unread</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="read">Read</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="archived">Archived</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-black-100 dark:text-white-100 mb-2">
                  No notifications found
                </h3>
                <p className="text-black-60 dark:text-white-60">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters or search terms"
                    : "You're all caught up! No notifications to show."}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-black-90 border border-black-10 dark:border-white-30 rounded-lg p-6 hover:shadow-md transition-shadow ${
                    notification.status === "unread" ? "ring-2 ring-white dark:ring-white-30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell
                          className={`w-5 h-5 ${
                            notification.status === "unread"
                              ? "text-white dark:text-white-100"
                              : "text-black-40 dark:text-white-40"
                          }`}
                        />
                        <h3 className="text-lg font-medium text-black-100 dark:text-white-100">
                          {notification.taskTitle}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${NOTIFICATION_TYPE_COLORS[notification.type]}`}
                        >
                          {NOTIFICATION_TYPE_LABELS[notification.type]}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${NOTIFICATION_STATUS_COLORS[notification.status]}`}
                        >
                          {notification.status.charAt(0).toUpperCase() +
                            notification.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-black-60 dark:text-white-60 mb-3">
                        {notification.message}
                      </p>

                      <div className="text-sm text-black-40 dark:text-white-40">
                        <span className="font-medium">Received:</span>{" "}
                        {formatDate(notification.createdAt)}
                        {notification.readAt && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="font-medium">Read:</span>{" "}
                            {formatDate(notification.readAt)}
                          </>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-black-40 dark:text-white-40 hover:text-black-100 dark:hover:text-white-100 hover:bg-black-5 dark:hover:bg-white-5 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {notification.status === "unread" && (
                          <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        {notification.status !== "archived" && (
                          <DropdownMenuItem onClick={() => handleArchive(notification.id)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskNotifications;
