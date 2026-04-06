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
  },
  {
    title: "Manage Appointments",
    description: "Confirm, complete, or cancel bookings with a real backend update trail.",
    icon: CalendarClock,
    url: "/admin/appointments",
  },
  {
    title: "Manage Services",
    description: "Add premium service cards that appear immediately in booking.",
    icon: Settings2,
    url: "/admin/services",
  },
  {
    title: "Review Adoption Queue",
    description: "Approve or reject adoption requests from one warm review space.",
    icon: HeartHandshake,
    url: "/admin/adoption-requests",
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
    },
    {
      label: "Open bookings",
      value: pendingAppointments.length,
      note: "Pending and confirmed appointments",
      icon: CalendarClock,
    },
    {
      label: "Live services",
      value: services.length,
      note: "Visible to booking users right now",
      icon: Settings2,
    },
    {
      label: "Pending adoption requests",
      value: pendingRequests.length,
      note: `${adoptionPets.length} adoption pets in the gallery`,
      icon: BellRing,
    },
  ];

  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="pet-card relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,179,71,0.24),_transparent_28%)]" />
          <div className="relative">
            <span className="pet-chip">Admin Overview</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              The PetHub admin side is back in the same premium flow as the user app.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#6B6B6B]">
              Track users, control service availability, manage live bookings, and review adoption
              requests from one warm operations workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-[#6B6B6B]">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                  <p className="mt-1 text-xs text-[#8B7B66]">{card.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pet-card bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6">
          <span className="pet-chip">What Changed</span>
          <h2 className="mt-4 text-3xl font-bold">Admin now behaves like a real PetHub workspace.</h2>
          <div className="mt-6 space-y-3">
            {[
              "Admin lands in /admin after the same login form.",
              "Booking status updates now notify the pet parent.",
              "Adoption requests can be reviewed and updated from the admin queue.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-[#5B544C] shadow-[0_14px_28px_rgba(45,45,45,0.04)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="pet-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Quick Actions</span>
              <h2 className="mt-4 text-3xl font-bold">Operations that matter today</h2>
            </div>
            <PawPrint className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {adminActions.map((action) => (
              <Link
                key={action.title}
                to={action.url}
                className="group rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)] transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#A97C3A] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-4 text-lg font-semibold">{action.title}</p>
                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card p-6">
            <span className="pet-chip">Recent Users</span>
            <div className="mt-5 space-y-3">
              {recentUsers.length ? (
                recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]"
                  >
                    <p className="text-base font-semibold">{user.fullName || user.displayName || user.email}</p>
                    <p className="mt-1 text-sm text-[#6B6B6B]">{user.email}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                      {user.role} • {user.onboardingCompleted ? "Onboarded" : "Setup pending"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm text-[#6B6B6B] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  User data will appear here once accounts start syncing.
                </div>
              )}
            </div>
          </div>

          <div className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              <CalendarClock className="h-4 w-4" />
              Today&apos;s booking pulse
            </span>
            <div className="mt-5 space-y-3">
              {todayAppointments.length ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="rounded-[20px] bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white">
                      {appointment.petName} · {appointment.serviceId?.serviceName || "Service"}
                    </p>
                    <p className="mt-1 text-sm text-white/70">{formatWhen(appointment.appointmentTime)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-white/75">
                  No pending appointments right now. As bookings are created, today&apos;s operational
                  pulse will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
