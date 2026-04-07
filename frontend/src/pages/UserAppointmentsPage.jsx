import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock, CalendarHeart, ChevronRight,
  Clock3, XCircle, MapPin, Stethoscope, Scissors,
  CheckCircle2, AlertCircle, Ban,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useAppointment, useUpdateMyAppointment } from "../apis/appointment/hooks";

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const STATUS = {
  pending:   { label: "Pending",   bg: "#FFF8E1", text: "#E65100", icon: AlertCircle,   dot: "#F5A623" },
  confirmed: { label: "Confirmed", bg: "#E3F2FD", text: "#1565C0", icon: CalendarClock, dot: "#42A5F5" },
  completed: { label: "Completed", bg: "#E8F5E9", text: "#2E7D32", icon: CheckCircle2,  dot: "#43A047" },
  cancelled: { label: "Cancelled", bg: "#FFEBEE", text: "#C62828", icon: Ban,           dot: "#EF5350" },
};

const getStatus = (key) => STATUS[key] ?? { label: key, bg: "#F5F5F5", text: "#555", icon: AlertCircle, dot: "#999" };

export const UserAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const { data: appointmentsResponse, isLoading } = useAppointment();
  const { mutateAsync: updateMyAppointment, isPending } = useUpdateMyAppointment();
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newTime, setNewTime] = useState("");

  const appointments = appointmentsResponse?.data ?? [];

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingList = [];
    const pastList = [];
    for (const apt of appointments) {
      const t = new Date(apt.appointmentTime);
      if (apt.status === "cancelled" || apt.status === "completed" || t <= now) {
        pastList.push(apt);
      } else {
        upcomingList.push(apt);
      }
    }
    upcomingList.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
    pastList.sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
    return { upcoming: upcomingList, past: pastList };
  }, [appointments]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await updateMyAppointment({ appointmentId: id, status: "cancelled" });
      await queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      toast.success("Appointment cancelled.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleReschedule = async (id) => {
    if (!newTime) { toast.error("Choose a new date and time."); return; }
    const iso = new Date(newTime).toISOString();
    try {
      await updateMyAppointment({ appointmentId: id, appointmentTime: iso });
      await queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      toast.success("Appointment rescheduled.");
      setRescheduleId(null);
      setNewTime("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isLoading) {
    return <PetHubLoader title="Appointments" message="Loading your upcoming and past visits." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6 sm:px-6 lg:px-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .ap-root  { font-family: 'DM Sans', sans-serif; color: #1A1A1A; }
        .ap-serif { font-family: 'Fraunces', Georgia, serif; }

        .ap-card {
          background: #fff;
          border-radius: 22px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        }

        .ap-chip {
          display: inline-flex; align-items: center;
          background: #F5F0E8; color: #8B6F47;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
        }

        .ap-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #1A1A1A; color: #fff;
          font-size: 13px; font-weight: 600;
          padding: 10px 18px; border-radius: 12px;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .ap-btn-primary:hover { background: #333; transform: translateY(-1px); }
        .ap-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .ap-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: #F7F3ED; color: #5B4A36;
          font-size: 12px; font-weight: 600;
          padding: 8px 14px; border-radius: 10px;
          border: 1px solid #EAE0D2; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .ap-btn-ghost:hover { background: #EDE6D8; transform: translateY(-1px); }
        .ap-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .ap-btn-danger {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FFF0EF; color: #C0392B;
          font-size: 12px; font-weight: 600;
          padding: 8px 14px; border-radius: 10px;
          border: 1px solid #FFCDD2; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .ap-btn-danger:hover { background: #FFE0DE; transform: translateY(-1px); }
        .ap-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .apt-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .apt-card:hover { box-shadow: 0 6px 22px rgba(0,0,0,0.08); }

        .ap-datetime-input {
          width: 100%;
          background: #F7F3ED;
          border: 1.5px solid transparent;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ap-datetime-input:focus {
          border-color: #F5A623;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }

        .past-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #FAFAF8;
          border: 1px solid rgba(0,0,0,0.05);
          transition: background 0.15s;
        }
        .past-row:hover { background: #F5F0E8; }
      `}</style>

      <div className="ap-root mx-auto max-w-6xl space-y-5">

        {/* ── HEADER ── */}
        <div className="ap-card p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D6]">
                <CalendarHeart className="h-7 w-7 text-[#F5A623]" />
              </div>
              <div>
                <span className="ap-chip">Appointments</span>
                <h1 className="ap-serif mt-1.5 text-2xl font-700 leading-tight sm:text-3xl">
                  Book &amp; manage visits
                </h1>
              </div>
            </div>
            <Link to="/services" className="ap-btn-primary">
              Book a service <CalendarHeart className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6B6B6B]">
            Schedule vet checkups and grooming, then review what's coming up or revisit past visits. You can cancel or reschedule open bookings anytime.
          </p>

          {/* Summary pills */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#E3F2FD] px-4 py-2.5">
              <CalendarClock className="h-4 w-4 text-[#1565C0]" />
              <span className="text-sm font-600 text-[#1565C0]">{upcoming.length} upcoming</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#F5F0E8] px-4 py-2.5">
              <Clock3 className="h-4 w-4 text-[#8B6F47]" />
              <span className="text-sm font-600 text-[#8B6F47]">{past.length} past &amp; cancelled</span>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── UPCOMING ── */}
          <div className="ap-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F2FD]">
                <CalendarClock className="h-5 w-5 text-[#1565C0]" />
              </div>
              <div>
                <h2 className="ap-serif text-xl font-700">Upcoming</h2>
                <p className="text-xs text-[#9B9B9B]">{upcoming.length} appointment{upcoming.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="space-y-3">
              {upcoming.length ? (
                upcoming.map((apt) => {
                  const s = getStatus(apt.status);
                  const StatusIcon = s.icon;
                  const isOpen = rescheduleId === apt._id;

                  return (
                    <article key={apt._id} className="apt-card">
                      {/* Color accent bar */}
                      <div className="h-1 w-full" style={{ background: s.dot }} />

                      <div className="p-4">
                        {/* Top row */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-base font-700 text-[#1A1A1A] leading-tight">
                              {apt.serviceId?.serviceName || "Care visit"}
                            </p>
                            <p className="mt-0.5 text-sm text-[#8B7B6B]">{apt.petName}</p>
                          </div>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-700 uppercase tracking-wider"
                            style={{ background: s.bg, color: s.text }}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {s.label}
                          </span>
                        </div>

                        {/* Date + time block */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F3ED] px-3 py-1.5">
                            <CalendarClock className="h-3.5 w-3.5 text-[#F5A623]" />
                            <span className="text-xs font-600 text-[#5B4A36]">{formatDate(apt.appointmentTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F3ED] px-3 py-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-[#F5A623]" />
                            <span className="text-xs font-600 text-[#5B4A36]">{formatTime(apt.appointmentTime)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setRescheduleId((id) => (id === apt._id ? null : apt._id));
                              setNewTime("");
                            }}
                            className="ap-btn-ghost"
                          >
                            {isOpen ? "Close" : "Reschedule"}
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleCancel(apt._id)}
                            className="ap-btn-danger"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>

                        {/* Reschedule panel */}
                        {isOpen && (
                          <div className="mt-4 rounded-2xl bg-[#FAFAF8] p-4 border border-[#EAE0D2]">
                            <p className="mb-3 text-xs font-700 uppercase tracking-wider text-[#9B8C7A]">
                              Pick a new date &amp; time
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                              <input
                                type="datetime-local"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="ap-datetime-input flex-1"
                              />
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleReschedule(apt._id)}
                                className="ap-btn-primary shrink-0"
                              >
                                Confirm <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <EmptyState
                  eyebrow="Upcoming"
                  title="No upcoming appointments."
                  description="Book a vet checkup or grooming slot and it will appear here."
                  action={<Link to="/services" className="ap-btn-primary mt-2">Browse services</Link>}
                />
              )}
            </div>
          </div>

          {/* ── PAST & CANCELLED ── */}
          <div className="ap-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F0E8]">
                <Clock3 className="h-5 w-5 text-[#8B6F47]" />
              </div>
              <div>
                <h2 className="ap-serif text-xl font-700">Past &amp; cancelled</h2>
                <p className="text-xs text-[#9B9B9B]">{past.length} record{past.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="space-y-2">
              {past.length ? (
                past.map((apt) => {
                  const s = getStatus(apt.status);
                  return (
                    <div key={apt._id} className="past-row">
                      {/* Status dot */}
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: s.dot }}
                      />
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-600 text-[#1A1A1A]">
                          {apt.serviceId?.serviceName || "Visit"}
                        </p>
                        <p className="mt-0.5 text-xs text-[#9B9B9B]">
                          {apt.petName} · {formatDate(apt.appointmentTime)}
                        </p>
                      </div>
                      {/* Badge */}
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-700 uppercase tracking-wider"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-center text-sm text-[#9B9B9B]">
                  Completed and cancelled visits will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
