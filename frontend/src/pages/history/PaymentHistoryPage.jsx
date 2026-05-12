import { CalendarDays, PawPrint, WalletCards } from "lucide-react";
import { PetHubLoader } from "../../components/PetHubLoader";
import { useAppointment } from "../../apis/appointment/hooks";

const paymentConfig = {
  paid:      { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  unpaid:    { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400"   },
  initiated: { badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",          dot: "bg-blue-400"    },
  failed:    { badge: "bg-red-50 text-red-700 ring-1 ring-red-200",             dot: "bg-red-400"     },
  cancelled: { badge: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",      dot: "bg-stone-400"   },
};

export const PaymentHistoryPage = () => {
  const { data: appointmentsResponse, isLoading } = useAppointment();
  const appointments = appointmentsResponse?.data ?? [];

  const totalPaid = appointments
    .filter((a) => a.payment?.status === "paid")
    .reduce((sum, a) => sum + (a.payment?.amount ?? 0), 0);

  if (isLoading) {
    return <PetHubLoader title="Loading Payment History" message="Fetching your booking payments." />;
  }

  return (
    <div className="pet-page space-y-6">
      {/* Header */}
      <div className="pet-card p-6 md:p-8">
        <span className="pet-chip">Payment History</span>
        <h1 className="mt-3 text-3xl font-bold text-[#2D2D2D] md:text-4xl">Your payment records</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[#6B6B6B]">
          A full record of payments made for your bookings and appointments.
        </p>
      </div>

      {/* List */}
      {totalPaid > 0 && (
        <div className="pet-card flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
            <WalletCards className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total paid</p>
            <p className="text-2xl font-bold text-[#2D2D2D]">NPR {totalPaid.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* List */}
      {appointments.length === 0 ? (
        <div className="pet-card flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6]">
            <PawPrint className="h-7 w-7 text-[#F5A623]" />
          </div>
          <p className="text-base font-bold text-[#2D2D2D]">No payment records yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Booking", "Service", "Date", "Amount", "Payment"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => {
                  const pStatus = apt.payment?.status ?? "unpaid";
                  const cfg = paymentConfig[pStatus] ?? paymentConfig.unpaid;
                  return (
                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">
                          {apt.bookingId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{apt.serviceId?.serviceName ?? "—"}</p>
                        <p className="text-xs text-gray-400">{apt.petName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <CalendarDays className="h-3.5 w-3.5 text-[#F5A623]" />
                          {new Date(apt.appointmentTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">NPR {apt.payment?.amount ?? "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {pStatus.charAt(0).toUpperCase() + pStatus.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
