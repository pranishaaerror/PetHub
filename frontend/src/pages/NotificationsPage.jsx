import {
  Bell,
  CalendarCheck,
  CheckCheck,
  CheckCircle2,
  HeartHandshake,
  Info,
  PawPrint,
  Trash2,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../apis/notifications/hooks";


const typeConfig = {
  booking:    { Icon: CalendarCheck,  bg: "bg-amber-100",   icon: "text-amber-600"   },
  adoption:   { Icon: HeartHandshake, bg: "bg-rose-100",    icon: "text-rose-500"    },
  community:  { Icon: Users,          bg: "bg-blue-100",    icon: "text-blue-500"    },
  onboarding: { Icon: PawPrint,       bg: "bg-emerald-100", icon: "text-emerald-600" },
  general:    { Icon: Info,           bg: "bg-gray-100",    icon: "text-gray-500"    },
};

function relativeTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationCard({ notification, onMarkRead, onDelete, isMarkingRead, isDeleting }) {
  const cfg = typeConfig[notification.type] ?? typeConfig.general;
  const { Icon } = cfg;
  const unread = !notification.isRead;

  return (
    <div
      className={`relative flex gap-4 rounded-2xl border p-5 transition-all ${
        unread
          ? "border-amber-200 bg-white shadow-[0_4px_20px_rgba(245,166,35,0.08)]"
          : "border-gray-100 bg-[#FAFAF8]"
      }`}
    >
     
      {unread && (
        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[linear-gradient(180deg,#F5A623,#FFB347)]" />
      )}

      
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
        <Icon className={`h-5 w-5 ${cfg.icon}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug ${unread ? "text-[#1A1A1A]" : "text-gray-600"}`}>
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-gray-400">{relativeTime(notification.createdAt)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">{notification.message}</p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          {unread ? (
            <button
              onClick={() => onMarkRead(notification._id)}
              disabled={isMarkingRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#F5A623] hover:text-[#d4891a] transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark as Read
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCheck className="h-3.5 w-3.5" />
              Read
            </span>
          )}
          <button
            onClick={() => onDelete(notification._id)}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#B78331] hover:text-[#F5A623] transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notificationsResponse, isLoading } = useNotifications();
  const { mutateAsync: markRead, isPending: isMarkingRead } = useMarkNotificationRead();
  const { mutateAsync: markAll, isPending: isMarkingAll } = useMarkAllNotificationsRead();
  const { mutateAsync: deleteNotif, isPending: isDeleting } = useDeleteNotification();

  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const handleMarkRead = async (id) => { await markRead(id); await invalidate(); };
  const handleMarkAll  = async ()  => { await markAll();     await invalidate(); };
  const handleDelete   = async (id) => { await deleteNotif(id); await invalidate(); };

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Notifications"
        message="Collecting your latest reminders, booking updates, and adoption signals."
      />
    );
  }

  return (
    <div className="pet-page">
      <div className="mx-auto max-w-2xl space-y-4">

        {/* ── Header card ── */}
        <div className="pet-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1A1A1A]">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-400">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                className="text-sm font-semibold text-[#F5A623] hover:text-[#d4891a] transition-colors disabled:opacity-50"
              >
                {isMarkingAll ? "Marking…" : "Mark all as read"}
              </button>
            )}
          </div>
        </div>

        {notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                isMarkingRead={isMarkingRead}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        ) : (
          <div className="pet-card p-10 text-center">
            <EmptyState
              eyebrow="Quiet inbox"
              title="No notifications yet."
              description="Booking confirmations, onboarding milestones, and adoption updates will appear here."
            />
          </div>
        )}

      </div>
    </div>
  );
};
