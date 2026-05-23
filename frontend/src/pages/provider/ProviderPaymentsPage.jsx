import { useOutletContext } from "react-router-dom";
import { useGroomerPaymentSummary, useVetPaymentSummary } from "../../apis/provider/hooks";
import { TrendingUp, DollarSign, CheckCircle } from "lucide-react";

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export const ProviderPaymentsPage = () => {
  const { portal } = useOutletContext();
  const isVet = portal === "vet";

  const vet = useVetPaymentSummary({ enabled: isVet });
  const groomer = useGroomerPaymentSummary({ enabled: !isVet });

  const data = isVet ? vet.data : groomer.data;
  const rows = data?.appointments ?? [];
  const total = data?.totalEarnings ?? 0;

  const avgPerVisit = rows.length ? Math.round(total / rows.length) : 0;

  return (
    <div className="pv-root space-y-6 p-1">
      <style>{`
        .pv-root { font-family: inherit; color: #1A1A2E; }
        .pv-serif { font-family: inherit; }
        .pv-card { background: #fff; border-radius: 22px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 16px rgba(0,0,0,0.05); }
        .pv-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.25); color: #D97706; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; }
      `}</style>

      {/* Header */}
      <div className="pv-card p-7">
        <span className="pv-chip"><TrendingUp className="h-3 w-3" /> Payments</span>
        <h1 className="pv-serif mt-4 text-3xl font-700">Completed, Paid Visits</h1>
        <p className="mt-2 text-sm text-[#64748B]">Totals reflect bookings marked complete with confirmed Khalti payments.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: DollarSign,
            bg: "#FFF7ED", iconColor: "#F59E0B",
            label: "Total Earnings",
            value: `NPR ${total.toLocaleString()}`,
          },
          {
            icon: CheckCircle,
            bg: "#F0FDF4", iconColor: "#22C55E",
            label: "Paid Visits",
            value: rows.length,
          },
          {
            icon: TrendingUp,
            bg: "#EFF6FF", iconColor: "#3B82F6",
            label: "Avg Per Visit",
            value: `NPR ${avgPerVisit.toLocaleString()}`,
          },
        ].map(({ icon: Icon, bg, iconColor, label, value }) => (
          <div key={label} className="pv-card flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
              <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </div>
            <div>
              <p className="pv-serif text-2xl font-700 text-[#1A1A2E]">{value}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="pv-card overflow-hidden">
        <div className="border-b border-[#F1F5F9] px-7 py-5">
          <h2 className="pv-serif text-lg font-700">Payment History</h2>
          <p className="mt-0.5 text-xs text-[#94A3B8]">{rows.length} completed visits</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {["Service", "Pet", "When", "Amount"].map((h) => (
                <th key={h} className="px-6 py-3.5 text-[10px] font-700 uppercase tracking-[0.18em] text-[#94A3B8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {rows.length ? rows.map((row) => (
              <tr key={row._id} className="hover:bg-[#FAFBFD] transition-colors">
                <td className="px-6 py-4 font-600 text-[#1A1A2E]">{row.serviceId?.serviceName ?? "Service"}</td>
                <td className="px-6 py-4 text-[#475569]">{row.petName}</td>
                <td className="px-6 py-4 text-[#94A3B8]">{formatWhen(row.appointmentTime)}</td>
                <td className="px-6 py-4">
                  <span className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-700 text-emerald-700">
                    NPR {Number(row.payment?.amount ?? 0).toLocaleString()}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC]">
                      <DollarSign className="h-5 w-5 text-[#CBD5E1]" />
                    </div>
                    <p className="text-sm text-[#94A3B8]">No completed, paid visits yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
