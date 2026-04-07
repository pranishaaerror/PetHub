import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  useGroomerBookings,
  useGroomerSchedule,
  useVetAppointments,
  useVetSchedule,
} from "../../apis/provider/hooks";

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const ProviderDashboardPage = () => {
  const { portal, base } = useOutletContext();
  const isVet = portal === "vet";
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));

  const vetAppointments = useVetAppointments({ enabled: isVet });
  const groomerBookings = useGroomerBookings({ enabled: !isVet });
  const vetSchedule = useVetSchedule(day, { enabled: isVet });
  const groomerSchedule = useGroomerSchedule(day, { enabled: !isVet });

  const incomingCount = useMemo(() => {
    if (isVet) {
      return vetAppointments.data?.incoming?.length ?? 0;
    }
    return groomerBookings.data?.incoming?.length ?? 0;
  }, [groomerBookings.data?.incoming?.length, isVet, vetAppointments.data?.incoming?.length]);

  const schedule = isVet ? vetSchedule.data ?? [] : groomerSchedule.data ?? [];

  return (
    <div className="pet-page space-y-6">
      <div className="pet-card p-6 md:p-8">
        <span className="pet-chip">{isVet ? "Vet overview" : "Groomer overview"}</span>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">
          {isVet ? "Clinical schedule and assignments" : "Grooming pipeline and daily rhythm"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6B6B6B]">
          Review incoming requests, stay aligned with today&apos;s visits, and jump into detailed management from
          the bookings workspace.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`${base}/bookings`} className="pet-button-primary">
            Manage {isVet ? "appointments" : "bookings"}
          </Link>
          <Link to={`${base}/payments`} className="pet-button-secondary">
            View earnings
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="pet-card p-6">
          <h2 className="text-xl font-bold">Incoming requests</h2>
          <p className="mt-2 text-sm text-[#6B6B6B]">Bookings awaiting your acceptance.</p>
          <p className="mt-6 text-4xl font-bold text-[#C77E1D]">{incomingCount}</p>
          <Link to={`${base}/bookings`} className="mt-4 inline-flex text-sm font-semibold text-[#C77E1D]">
            Open queue
          </Link>
        </div>
        <div className="pet-card p-6">
          <h2 className="text-xl font-bold">Day focus</h2>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">
            Pick a date
          </label>
          <input
            type="date"
            value={day}
            onChange={(event) => setDay(event.target.value)}
            className="mt-2 w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
          />
          <p className="mt-4 text-sm text-[#6B6B6B]">
            {schedule.length
              ? `${schedule.length} slot${schedule.length === 1 ? "" : "s"} on this day.`
              : "No assigned visits for this date."}
          </p>
        </div>
      </div>

      <div className="pet-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Schedule for selected day</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A97C3A]">
            {new Date(day).toLocaleDateString(undefined, { dateStyle: "full" })}
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {schedule.length ? (
            schedule.map((row) => (
              <div
                key={row._id}
                className="rounded-[22px] border border-[#F5E6CC] bg-[#FFF8EE] px-4 py-4 shadow-[0_12px_30px_rgba(45,45,45,0.04)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{row.serviceId?.serviceName ?? "Service"}</p>
                    <p className="text-sm text-[#6B6B6B]">
                      {row.petName} · {formatWhen(row.appointmentTime)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#A77222]">
                    {row.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#6B6B6B]">Nothing scheduled for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};
