import { Bell, CheckCircle2, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useMarkNotificationRead, useNotifications } from "../apis/notifications/hooks";
import { Button } from "../components/Button";

const notificationLinks = {
  booking: { href: "/service-booking", label: "Open bookings" },
  adoption: { href: "/adoption", label: "Open adoption" },
  community: { href: "/community", label: "Open community" },
  onboarding: { href: "/profile", label: "Open profile" },
  general: { href: "/dashboard", label: "Open dashboard" },
};

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notificationsResponse, isLoading } = useNotifications();
  const { mutateAsync: markRead, isPending } = useMarkNotificationRead();
  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleMarkRead = async (notificationId) => {
    await markRead(notificationId);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

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
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="pet-card p-6 md:p-8">
          <span className="pet-chip">Notifications</span>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Warm reminders, booking updates, and care signals.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
            PetHub keeps your care flow visible without turning the experience into a noisy feed.
          </p>

          <div className="mt-8 space-y-4">
            {notifications.length ? (
              notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`rounded-[28px] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)] ${
                    notification.isRead ? "bg-[#FFF8EE]" : "bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)]"
                  }`}
                >
                  {(() => {
                    const action = notificationLinks[notification.type] ?? notificationLinks.general;

                    return (
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{notification.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{notification.message}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                        {notification.type || "general"}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link to={action.href} className="pet-button-secondary gap-2">
                        {action.label}
                      </Link>
                      {!notification.isRead ? (
                        <Button
                          type="button"
                          onClick={() => handleMarkRead(notification._id)}
                          disabled={isPending}
                          className="pet-button-secondary gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                          Mark as read
                        </Button>
                      ) : (
                        <span className="pet-chip">Read</span>
                      )}
                    </div>
                  </div>
                    );
                  })()}
                </article>
              ))
            ) : (
              <EmptyState
                eyebrow="Quiet inbox"
                title="No notifications yet."
                description="Booking confirmations, onboarding milestones, and adoption updates will appear here."
              />
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card p-6">
            <Bell className="h-8 w-8 text-[#F5A623]" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">
              Unread now
            </p>
            <p className="mt-2 text-4xl font-bold">{unreadCount}</p>
          </div>
          <div className="pet-card bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6">
            <Sparkles className="h-8 w-8 text-[#F5A623]" />
            <h2 className="mt-4 text-2xl font-bold">Notification tone</h2>
            <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
              PetHub keeps reminders helpful, soft, and clear. Expect milestone nudges, booking
              updates, and adoption flow feedback instead of generic noise.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
