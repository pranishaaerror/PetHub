import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays, ChevronRight, ClipboardList, FileText,
  Stethoscope, Upload, X, CheckCircle2, Clock3, XCircle,
  PawPrint, Save, Scissors,
} from "lucide-react";
import {
  useGroomerBookingMutations,
  useGroomerBookings,
  useVetAppointmentMutations,
  useVetAppointments,
  useVetPetMedicalRecords,
} from "../../apis/provider/hooks";

const BACKEND = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api").replace(/\/?api\/?$/, "");

const formatWhen = (v) =>
  new Date(v).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const statusConfig = {
  pending:   { icon: Clock3,       color: "text-amber-500",   bg: "bg-amber-50",   label: "Pending"   },
  confirmed: { icon: CheckCircle2, color: "text-purple-500",  bg: "bg-purple-50",  label: "Confirmed" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Completed" },
  cancelled: { icon: XCircle,      color: "text-red-400",     bg: "bg-red-50",     label: "Cancelled" },
};

/* ── Vet appointment detail panel ── */
function VetDetailPanel({ appointment, onClose, mutations }) {
  const petId = appointment?.petId?._id ?? appointment?.petId ?? null;
  const recordsQuery = useVetPetMedicalRecords(petId, { enabled: Boolean(petId) });

  const [diagnosis, setDiagnosis]               = useState(appointment.diagnosis ?? "");
  const [consultationNotes, setConsultationNotes] = useState(appointment.consultationNotes ?? "");
  const [recordTitle, setRecordTitle]             = useState("");
  const [recordDesc, setRecordDesc]               = useState("");
  const [uploading, setUploading]                 = useState(false);

  const cfg = statusConfig[appointment.status] ?? statusConfig.pending;
  const StatusIcon = cfg.icon;

  const handleSave = async (complete = false) => {
    try {
      await mutations.consultation.mutateAsync({
        id: appointment._id,
        diagnosis,
        consultationNotes,
        status: complete ? "completed" : undefined,
      });
      toast.success(complete ? "Visit marked complete." : "Notes saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await mutations.report.mutateAsync({ id: appointment._id, file });
      toast.success("Report uploaded.");
      e.target.value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!petId || !recordTitle.trim()) {
      toast.error("Record title is required.");
      return;
    }
    try {
      await mutations.medicalRecord.mutateAsync({
        petId,
        appointmentId: appointment._id,
        title: recordTitle.trim(),
        description: recordDesc.trim(),
        date: new Date().toISOString(),
        type: "consultation",
      });
      toast.success("Medical record added.");
      setRecordTitle("");
      setRecordDesc("");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const inputCls = "w-full rounded-2xl border border-gray-200 bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition resize-none";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-[0_24px_70px_rgba(45,45,45,0.16)]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0D6]">
              <Stethoscope className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2D2D]">
                {appointment.serviceId?.serviceName ?? "Appointment"}
              </h2>
              <p className="text-xs text-gray-400">{appointment.bookingId}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Pet + owner info */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Pet", value: appointment.petName },
              { label: "Owner", value: appointment.ownerName },
              { label: "When", value: formatWhen(appointment.appointmentTime) },
              { label: "Contact", value: appointment.contactNumber || appointment.ownerEmail },
              { label: "Pet type", value: appointment.petType || "—" },
              { label: "Status", value: (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon className="h-3 w-3" /> {cfg.label}
                </span>
              )},
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-[#FAFAF8] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <div className="mt-1 text-sm font-semibold text-[#2D2D2D]">{value}</div>
              </div>
            ))}
          </div>

          {/* Diagnosis */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B78331]">
              <ClipboardList className="h-3.5 w-3.5" /> Diagnosis
            </label>
            <textarea
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className={inputCls}
              placeholder="Enter diagnosis…"
            />
          </div>

          {/* Treatment / consultation notes */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B78331]">
              <FileText className="h-3.5 w-3.5" /> Treatment notes
            </label>
            <textarea
              rows={4}
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              className={inputCls}
              placeholder="Medications prescribed, follow-up instructions…"
            />
          </div>

          {/* Save / complete buttons */}
          {appointment.status !== 'completed' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={mutations.consultation.isPending}
                className="flex items-center gap-2 rounded-full border border-[#E8D9C4] bg-white px-5 py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 text-[#F5A623]" />
                Save notes
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={mutations.consultation.isPending}
                className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark complete
              </button>
            </div>
          )}

          {/* Upload report */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B78331]">
              <Upload className="h-3.5 w-3.5" /> Upload medical report
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#F0DFC0] bg-[#FFF8EE] py-5 transition hover:border-[#F5A623] hover:bg-[#FFF5E0]">
              <Upload className="h-6 w-6 text-[#F5A623]" />
              <p className="text-xs font-semibold text-[#B78331]">
                {uploading ? "Uploading…" : "Click to upload PDF or image"}
              </p>
              <p className="text-[11px] text-gray-400">PDF, JPG, PNG · max 12MB</p>
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {appointment.medicalReportUrl && (
              <a
                href={`${BACKEND}${appointment.medicalReportUrl}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5A623] hover:underline"
              >
                <FileText className="h-3.5 w-3.5" /> View uploaded report
              </a>
            )}
          </div>

          {/* Medical history + add record */}
          {petId ? (
            <div className="rounded-2xl border border-[#F0E2CC] bg-[#FFF8EE] p-5">
              <p className="mb-3 text-sm font-bold text-[#2D2D2D]">Medical history</p>
              <div className="max-h-44 space-y-2 overflow-y-auto">
                {(recordsQuery.data ?? []).length ? (
                  recordsQuery.data.map((rec) => (
                    <div key={rec._id} className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-sm font-semibold text-[#2D2D2D]">{rec.title}</p>
                      <p className="text-[11px] uppercase tracking-wider text-[#B78331]">{rec.type}</p>
                      <p className="text-xs text-gray-400">{new Date(rec.date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No records yet.</p>
                )}
              </div>

              <div className="mt-4 space-y-2 border-t border-[#F0E2CC] pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#B78331]">Add record</p>
                <input
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="Record title"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition"
                />
                <textarea
                  value={recordDesc}
                  onChange={(e) => setRecordDesc(e.target.value)}
                  placeholder="Details for the owner-facing timeline"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition"
                />
                <button
                  onClick={handleAddRecord}
                  disabled={mutations.medicalRecord.isPending}
                  className="w-full rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  Add consultation record
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              This booking is not linked to a pet profile — medical history unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Groomer detail panel (unchanged logic, cleaner UI) ── */
function GroomerDetailPanel({ booking, onClose, mutations }) {
  const [serviceNotes, setServiceNotes] = useState(booking.serviceNotes ?? "");

  const handleSave = async () => {
    try {
      await mutations.notes.mutateAsync({ id: booking._id, serviceNotes });
      toast.success("Notes saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleComplete = async () => {
    try {
      await mutations.complete.mutateAsync({ id: booking._id, serviceNotes });
      toast.success("Service marked complete.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-[0_24px_70px_rgba(45,45,45,0.16)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF0D6]">
              <Scissors className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2D2D]">{booking.serviceId?.serviceName ?? "Grooming"}</h2>
              <p className="text-xs text-gray-400">{booking.petName} · {formatWhen(booking.appointmentTime)}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#B78331]">Service notes</label>
            <textarea
              rows={4}
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              placeholder="Coat treatment, temperament, special handling…"
              className="w-full resize-none rounded-2xl border border-gray-200 bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20 transition"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={mutations.notes.isPending}
              className="flex-1 rounded-full border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors disabled:opacity-50">
              Save notes
            </button>
            <button onClick={handleComplete} disabled={mutations.complete.isPending}
              className="flex-1 rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all">
              Mark complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export const ProviderBookingsPage = () => {
  const { portal } = useOutletContext();
  const isVet = portal === "vet";

  const vetQuery     = useVetAppointments({ enabled: isVet });
  const groomerQuery = useGroomerBookings({ enabled: !isVet });
  const vetMutations     = useVetAppointmentMutations();
  const groomerMutations = useGroomerBookingMutations();

  const [selectedId, setSelectedId] = useState(null);

  // For vet: show only appointments assigned to this vet (mine)
  // For groomer: show incoming + mine
  const rows = useMemo(() => {
    if (isVet) return vetQuery.data?.mine ?? [];
    return [...(groomerQuery.data?.incoming ?? []), ...(groomerQuery.data?.mine ?? [])];
  }, [isVet, vetQuery.data, groomerQuery.data]);

  const selected = useMemo(() => rows.find((r) => r._id === selectedId) ?? null, [rows, selectedId]);

  const statusOrder = {  confirmed: 1, completed: 2, cancelled: 3 };
  const sorted = [...rows].sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

  return (
    <div className="pet-page space-y-6">

      {/* Header */}
      
        
        <h3 className="mt-3 text-3xl font-bold text-[#2D2D2D]">
          {isVet ? "My appointments" : "My bookings"}
        </h3>
        
      

      {/* Stats row */}
      

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["When", "Pet & Owner", "Service", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.length ? sorted.map((row) => {
                const cfg = statusConfig[row.status] ?? statusConfig.pending;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#F5A623]" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(row.appointmentTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true })}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(row.appointmentTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{row.petName}</p>
                      <p className="text-xs text-gray-400">{row.ownerName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{row.serviceId?.serviceName ?? "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedId(row._id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E0] px-4 py-1.5 text-xs font-semibold text-[#C77E1D] hover:bg-[#FFE9A8] transition-colors"
                      >
                        Manage <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6]">
                        <PawPrint className="h-7 w-7 text-[#F5A623]" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">No appointments assigned yet.</p>
                      <p className="text-xs text-gray-400">The admin will assign appointments to you.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && isVet && (
        <VetDetailPanel
          appointment={selected}
          onClose={() => setSelectedId(null)}
          mutations={vetMutations}
        />
      )}
      {selected && !isVet && (
        <GroomerDetailPanel
          booking={selected}
          onClose={() => setSelectedId(null)}
          mutations={groomerMutations}
        />
      )}
    </div>
  );
};
