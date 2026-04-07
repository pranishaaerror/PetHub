import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Scissors,
  Search,
  Stethoscope,
  UserCircle,
  UsersRound,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../apis/notifications/hooks";
import { useAuth } from "../context/AuthContext";
import { resolveSearchPath } from "../utils/navigationSearch";
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

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { userProfile, currentUser } = useAuth();
  const { data: notificationsResponse } = useNotifications({ enabled: !!currentUser });
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    if (userProfile?.role === "admin") {
      return [
        { icon: PawPrint, label: "Admin Console", url: "/admin" },
        { icon: LayoutDashboard, label: "Dashboard", url: "/dashboard" },
        { icon: PawPrint, label: "Pet Profile", url: "/pet-profile" },
        { icon: CalendarDays, label: "Appointments", url: "/appointments" },
        { icon: Scissors, label: "Services", url: "/services" },
        { icon: UsersRound, label: "Community", url: "/community" },
        { icon: HeartHandshake, label: "Adoption", url: "/dashboard/adoption" },
        { icon: UserCircle, label: "Profile", url: "/profile" },
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
      { icon: UsersRound, label: "Community", url: "/community" },
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(resolveSearchPath(searchTerm));
  };

  const isCommunityArea =
    location.pathname === "/community" || location.pathname.startsWith("/community/");

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
          } ${hideSidebarOnCommunityDesktop ? "md:hidden" : ""} fixed inset-y-2 left-2 z-40 w-[290px] rounded-[30px] bg-white/90 p-5 shadow-[0_25px_80px_rgba(45,45,45,0.08)] backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0`}
        >
          <div className="flex h-full flex-col gap-6">
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

            <div className="rounded-[26px] bg-[linear-gradient(145deg,rgba(245,166,35,0.18),rgba(255,255,255,0.9))] p-4 shadow-[0_18px_35px_rgba(245,166,35,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#A77222]">
                Welcome Home
              </p>
              <h2 className="mt-2 text-lg font-bold">{userName}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Everything for care plans, wellness history, services, and your pet-loving
                community in one warm workspace.
              </p>
              {userProfile?.petHubId ? (
                <div className="mt-3 inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A77222]">
                  {userProfile.petHubId}
                </div>
              ) : null}
            </div>

            <nav className="flex flex-1 flex-col gap-2">
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
            </nav>

            <div className="rounded-[26px] bg-[#FFF8EE] p-4 shadow-[0_18px_35px_rgba(45,45,45,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A97C3A]">
                Pro Tip
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Keep vaccination dates and grooming notes updated so the dashboard cards stay
                fresh for your next visit.
              </p>
            </div>

            {currentUser ? (
              <Link
                to="/logout"
                className="flex items-center justify-between rounded-[22px] bg-white px-4 py-3.5 text-sm font-semibold text-[#D36A45] shadow-[0_15px_30px_rgba(45,45,45,0.04)] transition-transform hover:-translate-y-0.5"
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
              <div className="flex flex-col gap-2">
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

        <main className="relative flex min-h-screen min-w-0 flex-1 flex-col">
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
              <form
                onSubmit={handleSearchSubmit}
                className="hidden items-center gap-3 rounded-full bg-white/80 px-4 py-3 text-sm text-[#6B6B6B] shadow-[0_15px_30px_rgba(45,45,45,0.05)] md:flex md:min-w-[280px]"
              >
                <Search className="h-4 w-4 text-[#C28C3B]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search records, services, or meetups"
                  className="w-full bg-transparent outline-none placeholder:text-[#9D8B73]"
                />
              </form>
              {currentUser ? (
                <Link
                  to="/notifications"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#B57B28] shadow-[0_15px_30px_rgba(45,45,45,0.05)]"
                  aria-label="Open notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-1.5 text-[10px] font-bold text-white shadow-[0_10px_20px_rgba(245,166,35,0.25)]">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>
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
