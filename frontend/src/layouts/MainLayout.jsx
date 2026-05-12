import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  History,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Scissors,
  Stethoscope,
  Trash2,
  UserCircle,
  Users,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../apis/notifications/hooks";
import { useAuth } from "../context/AuthContext";
import Header from "../pages/Header";

const navMatchEnd = (url) =>
  url === "/dashboard" ||
  url === "/pet-profile" ||
  url === "/appointments" ||
  url === "/services" ||
  url === "/profile" ||
  url === "/vet/bookings" ||
  url === "/vet/profile" ||
  url === "/groomer/bookings" ||
  url === "/groomer/profile";

const notifTypeConfig = {
  booking:    { Icon: CalendarCheck,  bg: "bg-amber-100",   icon: "text-amber-600"   },
  adoption:   { Icon: HeartHandshake, bg: "bg-rose-100",    icon: "text-rose-500"    },
  community:  { Icon: Users,          bg: "bg-blue-100",    icon: "text-blue-500"    },
  onboarding: { Icon: PawPrint,       bg: "bg-emerald-100", icon: "text-emerald-600" },
  general:    { Icon: Info,           bg: "bg-gray-100",    icon: "text-gray-500"    },
};

function relativeTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationDropdown({ onClose }) {
  const queryClient = useQueryClient();
  const { data: notificationsResponse } = useNotifications();
  const { mutateAsync: markRead }  = useMarkNotificationRead();
  const { mutateAsync: markAll }   = useMarkAllNotificationsRead();
  const { mutateAsync: deleteNotif } = useDeleteNotification();

  const notifications = (notificationsResponse?.data ?? []).slice(0, 5);
  const unreadCount   = (notificationsResponse?.data ?? []).filter((n) => !n.isRead).length;
  const invalidate    = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  return (
    <>
      {/* Dropdown card */}
      <div
        className="fixed left-1/2 top-[80px] z-50 w-[420px] -translate-x-1/2 rounded-3xl bg-white shadow-[0_24px_70px_rgba(45,45,45,0.16)] ring-1 ring-black/5 md:left-auto md:right-6 md:translate-x-0"
        style={{ animation: "slideDown 0.18s ease-out both" }}
      >
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px) scaleY(0.96); }
            to   { opacity: 1; transform: translateY(0)    scaleY(1);    }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h3 className="text-base font-bold text-[#1A1A1A]">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={async () => { await markAll(); await invalidate(); }}
              className="text-xs font-semibold text-[#F5A623] hover:text-[#d4891a] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-400">No notifications yet.</p>
          ) : (
            notifications.map((n) => {
              const cfg = notifTypeConfig[n.type] ?? notifTypeConfig.general;
              const { Icon } = cfg;
              const unread = !n.isRead;
              return (
                <div
                  key={n._id}
                  className={`relative flex gap-4 px-6 py-5 transition-colors hover:bg-gray-50 ${unread ? "bg-amber-50/40" : ""}`}
                >
                  {unread && (
                    <span className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full bg-[#F5A623]" />
                  )}
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                    <Icon className={`h-5 w-5 ${cfg.icon}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${unread ? "text-[#1A1A1A]" : "text-gray-600"}`}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-gray-400">{relativeTime(n.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{n.message}</p>
                    <div className="mt-2.5 flex items-center gap-4">
                      {unread ? (
                        <button
                          onClick={async () => { await markRead(n._id); await invalidate(); }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#F5A623] hover:text-[#d4891a] transition-colors"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Mark as Read
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <CheckCheck className="h-3 w-3" /> Read
                        </span>
                      )}
                      <button
                        onClick={async () => { await deleteNotif(n._id); await invalidate(); }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#B78331] hover:text-[#F5A623] transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm font-semibold text-[#F5A623] hover:text-[#d4891a] transition-colors"
          >
            View all activity history
          </Link>
        </div>
      </div>
    </>
  );
}

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const p = window.location.pathname;
    return p.startsWith("/medical-records") || p.startsWith("/history/");
  });
  const notifRef = useRef(null);
  const { userProfile, currentUser } = useAuth();
  const { data: notificationsResponse } = useNotifications({ enabled: !!currentUser });
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = useMemo(() => {
    if (userProfile?.role === "admin") {
      return [
        { icon: PawPrint, label: "Admin Console", url: "/admin" },

      ];
    }

    if (userProfile?.role === "veterinarian") {
      return [
        { icon: Stethoscope, label: "Vet workspace", url: "/vet" },
        { icon: CalendarDays, label: "Clinical appointments", url: "/vet/bookings" },
        { icon: LayoutDashboard, label: "Pet parent home", url: "/dashboard" },
        { icon: UserCircle, label: "Provider profile", url: "/vet/profile" },
      ];
    }

    if (userProfile?.role === "groomer") {
      return [
        { icon: Scissors, label: "Groomer workspace", url: "/groomer" },
        { icon: CalendarDays, label: "Bookings", url: "/groomer/bookings" },
        { icon: LayoutDashboard, label: "Pet parent home", url: "/dashboard" },
        { icon: UserCircle, label: "Provider profile", url: "/groomer/profile" },
      ];
    }

    return [
      { icon: LayoutDashboard, label: "Dashboard", url: "/dashboard" },
      { icon: PawPrint, label: "Pet Profile", url: "/pet-profile" },
      { icon: CalendarDays, label: "Appointments", url: "/appointments" },
      { icon: Scissors, label: "Services", url: "/services" },
      { icon: UsersRound, label: "Community", url: "/dashboard/community" },
      { icon: HeartHandshake, label: "Adoption", url: "/dashboard/adoption" },
      { icon: UserCircle, label: "Profile", url: "/profile" },
    ];
  }, [userProfile?.role]);

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    const sorted = [...navItems].sort((a, b) => b.url.length - a.url.length);
    const hit = sorted.find(
      (item) => path === item.url || (item.url !== "/" && path.startsWith(`${item.url}/`))
    );
    return hit?.label ?? "PetHub";
  }, [location.pathname, navItems]);

  const userName =
    userProfile?.displayName ||
    userProfile?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    (currentUser ? "Pet Parent" : "Guest");
  const userInitial = userName.trim().charAt(0).toUpperCase() || "P";
  const userRoleLabel =
    userProfile?.role === "admin"
      ? "Admin Access"
      : userProfile?.role === "veterinarian"
      ? "Veterinarian"
      : userProfile?.role === "groomer"
      ? "Professional groomer"
      : currentUser
      ? "Pet Parent"
      : "Browse as guest";
  const unreadNotifications =
    notificationsResponse?.data?.filter((notification) => !notification.isRead).length ?? 0;

  const isCommunityArea =
    location.pathname === "/dashboard/community" || location.pathname.startsWith("/dashboard/community/");

  // Sidebar should be hidden on desktop (md:hidden) only for non‑logged‑in users on community pages
  const hideSidebarOnCommunityDesktop = isCommunityArea && !currentUser;
  // Main header should be hidden only for non‑logged‑in users on community pages
  const hideMainHeader = isCommunityArea && !currentUser;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4EAD9] text-[#2D2D2D]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,71,0.3),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(245,166,35,0.18),_transparent_28%)]" />
      {isCommunityArea && !currentUser ? (
        <div className="relative z-50 mx-auto w-full max-w-[1500px] px-2 pt-2 sm:px-3 md:px-4">
          <div className="rounded-[36px] bg-white/60 shadow-[0_28px_80px_rgba(45,45,45,0.09)] backdrop-blur-xl">
            <Header />
          </div>
        </div>
      ) : null}
      <div className="relative flex min-h-screen gap-3 px-2 py-2 md:gap-4 md:px-3 md:py-3 lg:px-4 lg:py-4">
        <aside
            className={`${
              sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
            } ${hideSidebarOnCommunityDesktop ? "md:hidden" : ""} 
            fixed inset-y-2 left-2 z-40 w-[290px] 
            rounded-[30px] bg-white/90 py-5 pl-5 
            shadow-[0_25px_80px_rgba(45,45,45,0.08)] 
            backdrop-blur-xl transition-transform duration-300 md:translate-x-0`}
          >
          <div className="flex h-full flex-col gap-6 ">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#F5A623,#FFB347)] shadow-[0_18px_35px_rgba(245,166,35,0.28)]">
                  <PawPrint className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B78331]">
                    PetHub
                  </p>
                  <h1 className="text-xl font-bold text-[#2D2D2D]">Care Platform</h1>
                </div>
              </Link>
              <Button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8EE] text-[#8B6A39] md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#F5A623]/60 pr-5">
              {navItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={navMatchEnd(item.url)}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-[22px] px-4 py-3.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_20px_40px_rgba(245,166,35,0.24)]"
                        : "bg-transparent text-[#5F5A53] hover:bg-[#FFF4E2] hover:text-[#2D2D2D]"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/35">
                      <item.icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </NavLink>
              ))}

              {/* History dropdown — only for regular users */}
              {userProfile?.role === "user" || !userProfile?.role ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setHistoryOpen((o) => !o)}
                    className={`group flex w-full items-center justify-between rounded-[22px] px-4 py-3.5 text-sm font-semibold transition-all ${
                      location.pathname.startsWith("/medical-records")
                        ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_20px_40px_rgba(245,166,35,0.24)]"
                        : "bg-transparent text-[#5F5A53] hover:bg-[#FFF4E2] hover:text-[#2D2D2D]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/35">
                        <History className="h-5 w-5" />
                      </span>
                      History
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 opacity-60 transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Submenu */}
                  {historyOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#F5A623]/30 pl-3">
                      {[
                        { to: "/medical-records",    icon: ClipboardList,  label: "Medical Records"  },
                        { to: "/history/payments",   icon: WalletCards,    label: "Payment History"  },
                      ].map(({ to, icon: Icon, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm font-semibold transition-all ${
                              isActive
                                ? "bg-[#FFF0D6] text-[#C77E1D]"
                                : "text-[#5F5A53] hover:bg-[#FFF4E2] hover:text-[#2D2D2D]"
                            }`
                          }
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#FFF0D6]">
                            <Icon className="h-4 w-4 text-[#F5A623]" />
                          </span>
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </nav>
            {currentUser ? (
                  <Link
                    to="/logout"
                    className="flex items-center justify-between rounded-[22px] bg-white px-4 py-3.5 mr-5 text-sm font-semibold text-[#D36A45] shadow-[0_15px_30px_rgba(45,45,45,0.04)] transition-transform hover:-translate-y-0.5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[#FFF3EA]">
                        <LogOut className="h-5 w-5" />
                      </span>
                      Logout
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2 mr-5">
                    <Link
                      to="/login"
                      className="flex items-center justify-between rounded-[22px] bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(245,166,35,0.24)] transition-transform hover:-translate-y-0.5"
                    >
                      <span>Sign in</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-between rounded-[22px] bg-white px-4 py-3.5 text-sm font-semibold text-[#5F5A53] shadow-[0_15px_30px_rgba(45,45,45,0.04)] transition-transform hover:-translate-y-0.5"
                    >
                      <span>Create account</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
          </div>
        </aside>

        {sidebarOpen ? (
          <Button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-[#2D2D2D]/20 md:hidden"
          />
        ) : null}

          <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto md:ml-[310px]">          
            <header
              className={`glass-surface sticky top-2 z-20 flex items-center justify-between rounded-[28px] px-4 py-4 shadow-[0_20px_60px_rgba(45,45,45,0.08)] md:px-6 ${
                hideMainHeader ? "hidden" : ""
              }`}
            >
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => setSidebarOpen((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF5E6] text-[#B57B28] md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B78331]">
                  {userRoleLabel}
                </p>
                <h2 className="text-xl font-bold text-[#2D2D2D] md:text-2xl">{pageTitle}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser ? (
                <div ref={notifRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotifOpen((o) => !o)}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#B57B28] shadow-[0_15px_30px_rgba(45,45,45,0.05)]"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-1.5 text-[10px] font-bold text-white shadow-[0_10px_20px_rgba(245,166,35,0.25)]">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    ) : null}
                  </button>
                  {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                </div>
              ) : null}
              <Link
                to={currentUser ? "/profile" : "/login"}
                className="hidden items-center gap-3 rounded-full bg-white/85 px-2 py-2 shadow-[0_15px_30px_rgba(45,45,45,0.05)] sm:flex"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-sm font-bold text-white">
                  {userInitial}
                </div>
                <div className="pr-2">
                  <p className="text-sm font-semibold text-[#2D2D2D]">{userName}</p>
                  <p className="text-xs text-[#8B7B66]">{userRoleLabel}</p>
                </div>
              </Link>
            </div>
          </header>

          <div className="min-w-0 flex-1 overflow-x-hidden px-1 py-4 sm:px-2 sm:py-5 md:px-0">
            <Outlet />
          </div>
        </main>

        <Button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group fixed bottom-6 right-6 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_24px_50px_rgba(245,166,35,0.38)] transition-transform hover:-translate-y-1"
          aria-label="Back to top"
        >
          <PawPrint className="h-7 w-7 transition-transform group-hover:scale-110" />
        </Button>
      </div>
    </div>
  );
};
