import { useOutletContext } from "react-router-dom";
import { useGroomerPaymentSummary, useVetPaymentSummary } from "../../apis/provider/hooks";

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const ProviderPaymentsPage = () => {
  const { portal } = useOutletContext();
  const isVet = portal === "vet";

  const vet = useVetPaymentSummary({ enabled: isVet });
  const groomer = useGroomerPaymentSummary({ enabled: !isVet });

  const data = isVet ? vet.data : groomer.data;
  const rows = data?.appointments ?? [];
  const total = data?.totalEarnings ?? 0;

  return (
    <div className="pet-page space-y-6">
      <div className="pet-card p-6">
        <span className="pet-chip">Payments</span>
        <h1 className="mt-4 text-3xl font-bold">Completed, paid visits</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Totals reflect bookings marked complete with confirmed eSewa payments.
        </p>
        <div className="mt-6 rounded-[24px] bg-[#FFF8EE] p-5 shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A97C3A]">Total earnings</p>
          <p className="mt-2 text-4xl font-bold text-[#2D2D2D]">NPR {total.toLocaleString()}</p>
        </div>
      </div>

      <div className="pet-card overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FFF8EE] text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7B66]">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Pet</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5E6CC]">
            {rows.length ? (
              rows.map((row) => (
                <tr key={row._id} className="hover:bg-[#FFFBF4]">
                  <td className="px-4 py-3 font-semibold">{row.serviceId?.serviceName ?? "Service"}</td>
                  <td className="px-4 py-3">{row.petName}</td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{formatWhen(row.appointmentTime)}</td>
                  <td className="px-4 py-3 font-semibold">NPR {Number(row.payment?.amount ?? 0).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#6B6B6B]">
                  No completed, paid visits yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
