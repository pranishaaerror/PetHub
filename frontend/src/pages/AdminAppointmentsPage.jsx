import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAppointment, useUpdateAppointmentStatus } from "../apis/appointment/hooks";
import { PetHubLoader } from "../components/PetHubLoader";
import { Button } from "../components/Button";

const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const paymentTone = {
  paid: "bg-[#EAF7ED] text-[#3A7D45]",
  unpaid: "bg-[#FFF0D6] text-[#8B6428]",
  failed: "bg-[#FFF1EE] text-[#C45F3E]",
  cancelled: "bg-[#F1E7D7] text-[#8B7B66]",
  initiated: "bg-[#FFF4E2] text-[#B78331]",
};

export const AdminAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const { data: appointmentsResponse, isLoading } = useAppointment();
  const { mutateAsync: updateStatus, isPending } = useUpdateAppointmentStatus();
  const appointments = appointmentsResponse?.data ?? [];

  const statusCounts = useMemo(
    () =>
      statusOptions.reduce((accumulator, status) => {
        accumulator[status] = appointments.filter((appointment) => appointment.status === status).length;
        return accumulator;
      }, {}),
    [appointments]
  );

  const handleStatusChange = async (appointmentId, status) => {
    try {
      await updateStatus({ appointmentId, status });
      await queryClient.invalidateQueries({ queryKey: ["get-appointment"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`Appointment marked as ${status}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Appointments"
        message="Preparing the live booking queue and admin action controls."
      />
    );
  }

  return (
    <div className="pet-page">
      <section className="pet-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="pet-chip">Appointments</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Manage live bookings with real status changes.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#6B6B6B]">
              Confirm, complete, or cancel appointments from the admin console. Each update now feeds
              back into PetHub as a real notification for the user.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B78331]">Total bookings</p>
            <p className="mt-2 text-4xl font-bold">{appointments.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statusOptions.map((status) => (
            <div key={status} className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <p className="text-sm font-medium capitalize text-[#6B6B6B]">{status}</p>
              <p className="mt-1 text-3xl font-bold">{statusCounts[status] ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        {appointments.map((appointment) => (
          <article key={appointment._id} className="pet-card p-6">
            <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
                <div>
                  <span className="pet-chip">{appointment.bookingId}</span>
                  <h2 className="mt-4 text-2xl font-bold">{appointment.petName}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                    {appointment.serviceId?.serviceName || "Service"} for {appointment.ownerName}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-[#5B544C]">
                  <p className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-[#F5A623]" />
                    {formatWhen(appointment.appointmentTime)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[#F5A623]" />
                    {appointment.contactNumber}
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                    {appointment.ownerEmail}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Status</p>
                    <p className="mt-2 text-lg font-semibold capitalize">{appointment.status}</p>
                  </div>
                  <div
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                      paymentTone[appointment.payment?.status] ?? "bg-[#FFF8EE] text-[#8B6428]"
                    }`}
                  >
                    Payment: {appointment.payment?.status ?? "unpaid"}
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:min-w-[220px]">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    disabled={isPending || appointment.status === status}
                    onClick={() => handleStatusChange(appointment._id, status)}
                    className={`rounded-full px-4 py-3 text-sm font-semibold transition-transform ${
                      appointment.status === status
                        ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_18px_35px_rgba(245,166,35,0.18)]"
                        : "bg-[#FFF8EE] text-[#5B544C] shadow-[0_12px_24px_rgba(45,45,45,0.04)] hover:-translate-y-0.5"
                    }`}
                  >
                    {status === "cancelled" ? <XCircle className="mr-2 inline h-4 w-4" /> : null}
                    <span className="capitalize">{status}</span>
                  </Button>
                ))}
              </div>
            </div>
          </article>
        ))}

        {!appointments.length ? (
          <div className="pet-card p-8 text-center text-[#6B6B6B]">
            No appointments are available in the system yet.
          </div>
        ) : null}
      </section>
    </div>
  );
};
