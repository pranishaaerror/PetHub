// AdminDashboardPage.jsx
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BellRing,
  CalendarClock,
  HeartHandshake,
  PawPrint,
  Settings2,
  Users,
} from "lucide-react";
import { useAdoption } from "../apis/adoption/hooks";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { useAppointment } from "../apis/appointment/hooks";
import { useServices } from "../apis/services/hooks";
import { useUsers } from "../apis/users/hooks";

const adminActions = [
  {
    title: "Manage Users",
    description: "Review pet parents, onboarding completion, and role assignments.",
    icon: Users,
    url: "/admin/users",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Manage Appointments",
    description: "Confirm, complete, or cancel bookings with a real backend update trail.",
    icon: CalendarClock,
    url: "/admin/appointments",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Manage Services",
    description: "Add premium service cards that appear immediately in booking.",
    icon: Settings2,
    url: "/admin/services",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Review Adoption Queue",
    description: "Approve or reject adoption requests from one warm review space.",
    icon: HeartHandshake,
    url: "/admin/adoption-requests",
    gradient: "from-rose-500 to-pink-500",
  },
];

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const AdminDashboardPage = () => {
  const { data: usersResponse } = useUsers();
  const { data: appointmentsResponse } = useAppointment();
  const { data: servicesResponse } = useServices();
  const { data: requestsResponse } = useMyAdoptionRequests();
  const { data: adoptionResponse } = useAdoption();

  const users = usersResponse?.data ?? [];
  const appointments = appointmentsResponse?.data ?? [];
  const services = servicesResponse?.data ?? [];
  const adoptionRequests = requestsResponse?.data ?? [];
  const adoptionPets = adoptionResponse?.data?.pets ?? [];

  const pendingAppointments = appointments.filter((item) => ["pending", "confirmed"].includes(item.status));
  const pendingRequests = adoptionRequests.filter((item) => item.status === "pending");
  const recentUsers = users.slice(0, 4);
  const todayAppointments = pendingAppointments.slice(0, 4);

  const statCards = [
    {
      label: "Total users",
      value: users.length,
      note: "All synced PetHub accounts",
      icon: Users,
      gradient: "from-blue-400 to-blue-600",
      link: "/admin/users",
    },
    {
      label: "Open bookings",
      value: pendingAppointments.length,
      note: "Pending and confirmed appointments",
      icon: CalendarClock,
      gradient: "from-emerald-400 to-emerald-600",
      link: "/admin/appointments",
    },
    {
      label: "Live services",
      value: services.length,
      note: "Visible to booking users right now",
      icon: Settings2,
      gradient: "from-amber-400 to-amber-600",
      link: "/admin/services",
    },
    {
      label: "Adoption requests",
      value: pendingRequests.length,
      note: `${adoptionPets.length} adoption pets in the gallery`,
      icon: BellRing,
      gradient: "from-rose-400 to-rose-600",
      link: "/admin/adoption-requests",
    },
  ];

  return (
    <div className="pet-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero + Stats Row */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Main Hero Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-xl border border-amber-100 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl -translate-y-40 translate-x-40" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-100/20 rounded-full blur-3xl translate-y-20 -translate-x-20" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold tracking-wide">
              <PawPrint className="w-3.5 h-3.5" />
              Admin Overview
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-stone-800 to-amber-800 bg-clip-text text-transparent">
              Welcome back, Admin
            </h1>
            <p className="mt-4 text-stone-600 leading-relaxed max-w-xl">
              Track users, control service availability, manage live bookings, and review adoption
              requests from one warm operations workspace.
            </p>

            {/* Stat Cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => ( 
                <a href={card.link} key={card.label} className="cursor-pointer">
                <div
                  className="group bg-white rounded-2xl p-4 shadow-md border border-amber-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-stone-500">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-stone-800">{card.value}</p>
                  <p className="mt-1 text-xs text-amber-600">{card.note}</p>
                </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Today's Booking Pulse */}
        <section className="relative overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl shadow-xl p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold uppercase tracking-wider text-amber-300">Today's Booking Pulse</span>
            </div>
            <div className="mt-5 space-y-3">
              {todayAppointments.length ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="font-semibold text-white">
                      {appointment.petName} · {appointment.serviceId?.serviceName || "Service"}
                    </p>
                    <p className="mt-1 text-sm text-amber-300">{formatWhen(appointment.appointmentTime)}</p>
                  </div>
                ))
              ) : (
                <p className="text-stone-300 text-sm leading-relaxed">
                  No pending appointments right now. As bookings are created, today's operational
                  pulse will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Quick Actions + Sidebar */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Quick Actions */}
        <section className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-white p-6 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold tracking-wide">
                  <PawPrint className="w-3.5 h-3.5" />
                  Quick Actions
                </span>
                <h2 className="mt-3 text-2xl font-bold text-stone-800">Operations that matter today</h2>
              </div>
            </div>
          </div>

          <div className="p-6 grid gap-4 sm:grid-cols-2">
            {adminActions.map((action) => (
              <Link
                key={action.title}
                to={action.url}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-amber-50/50 p-5 border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity rounded-full blur-2xl -translate-y-8 translate-x-8"
                  style={{ backgroundImage: `linear-gradient(135deg, ${action.gradient.split(' ')[1]}, ${action.gradient.split(' ')[3]})` }}
                />
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="mt-4 text-lg font-semibold text-stone-800">{action.title}</p>
                <p className="mt-2 text-sm text-stone-500 leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Users */}
          <section className="bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-white p-5 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-stone-700">Recent Users</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {recentUsers.length ? (
                recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/30 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {(user.fullName || user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{user.fullName || user.displayName || user.email}</p>
                      <p className="text-xs text-stone-400 truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.onboardingCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {user.onboardingCompleted ? "Onboarded" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-stone-400">No users yet</div>
              )}
            </div>
          </section>

          {/* Today's Appointments — moved to top row */}
        </div>
      </div>
    </div>
  );
};
