import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import {
  BellRing,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  PawPrint,
  Settings2,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile } = useAuth();
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { label: "Overview", url: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Users", url: "/admin/users", icon: Users },
      { label: "Appointments", url: "/admin/appointments", icon: ClipboardCheck },
      { label: "Services", url: "/admin/services", icon: Settings2 },
      { label: "Adoption Queue", url: "/admin/adoption-requests", icon: BellRing },
    ],
    []
  );

  const pageTitle =
    navItems.find((item) =>
      item.exact ? location.pathname === item.url : location.pathname.startsWith(item.url)
    )?.label ?? "Admin";
  const adminName =
    userProfile?.fullName ||
    userProfile?.displayName ||
    userProfile?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "PetHub Admin";
  const adminInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4EAD9] text-[#2D2D2D]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,71,0.26),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(245,166,35,0.16),_transparent_30%)]" />
      <div className="relative flex min-h-screen gap-3 px-2 py-2 md:gap-4 md:px-3 md:py-3 lg:px-4 lg:py-4">
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
          } fixed inset-y-2 left-2 z-40 w-[300px] rounded-[30px] bg-white/92 p-5 shadow-[0_25px_80px_rgba(45,45,45,0.08)] backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0`}
        >
          <div className="flex h-full flex-col gap-6">
            <div className="flex items-center justify-between">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#F5A623,#FFB347)] shadow-[0_18px_35px_rgba(245,166,35,0.28)]">
                  <PawPrint className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#B78331]">
                    PetHub
                  </p>
                  <h1 className="text-xl font-bold">Admin Console</h1>
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
                Admin Access
              </p>
              <h2 className="mt-2 text-lg font-bold">{adminName}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Manage users, appointments, adoption requests, and service offerings from the same
                warm PetHub design system.
              </p>
              <div className="mt-4 flex gap-2">
                <Link to="/dashboard" className="pet-button-secondary px-4 py-2 text-xs">
                  User View
                </Link>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-[22px] px-4 py-3.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_20px_40px_rgba(245,166,35,0.24)]"
                        : "text-[#5F5A53] hover:bg-[#FFF4E2] hover:text-[#2D2D2D]"
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
                Admin Note
              </p>
              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Approving requests and updating booking states now creates real notification trails
                for users.
              </p>
            </div>

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
          <header className="glass-surface sticky top-2 z-20 flex items-center justify-between rounded-[28px] px-4 py-4 shadow-[0_20px_60px_rgba(45,45,45,0.08)] md:px-6">
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
                  Admin Workspace
                </p>
                <h2 className="text-xl font-bold md:text-2xl">{pageTitle}</h2>
              </div>
            </div>

            <Link
              to="/profile"
              className="hidden items-center gap-3 rounded-full bg-white/85 px-2 py-2 shadow-[0_15px_30px_rgba(45,45,45,0.05)] sm:flex"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-sm font-bold text-white">
                {adminInitial}
              </div>
              <div className="pr-2">
                <p className="text-sm font-semibold text-[#2D2D2D]">{adminName}</p>
                <p className="text-xs text-[#8B7B66]">Administrator</p>
              </div>
            </Link>
          </header>

          <div className="flex-1 py-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
