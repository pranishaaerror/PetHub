import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";

const backendOrigin = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api").replace(
  /\/?api\/?$/,
  ""
);
import {
  useGroomerBookingMutations,
  useGroomerBookings,
  useVetAppointmentMutations,
  useVetAppointments,
  useVetPetMedicalRecords,
} from "../../apis/provider/hooks";

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const ProviderBookingsPage = () => {
  const { portal } = useOutletContext();
  const isVet = portal === "vet";

  const vetQuery = useVetAppointments({ enabled: isVet });
  const groomerQuery = useGroomerBookings({ enabled: !isVet });
  const vetMutations = useVetAppointmentMutations();
  const groomerMutations = useGroomerBookingMutations();

  const incoming = isVet ? vetQuery.data?.incoming ?? [] : groomerQuery.data?.incoming ?? [];
  const mine = isVet ? vetQuery.data?.mine ?? [] : groomerQuery.data?.mine ?? [];

  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => {
    const pool = [...incoming, ...mine];
    return pool.find((row) => row._id === selectedId) ?? null;
  }, [incoming, mine, selectedId]);

  const petId = selected?.petId?._id ?? selected?.petId ?? null;
  const recordsQuery = useVetPetMedicalRecords(petId, { enabled: isVet && Boolean(petId) });

  const [diagnosis, setDiagnosis] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");

  const syncForm = (row) => {
    if (!row) {
      return;
    }

    setDiagnosis(row.diagnosis ?? "");
    setConsultationNotes(row.consultationNotes ?? "");
    setServiceNotes(row.serviceNotes ?? "");
    setRecordTitle("");
    setRecordDescription("");
  };

  const handleSelect = (row) => {
    setSelectedId(row._id);
    syncForm(row);
  };

  const handleAccept = async () => {
    if (!selected) {
      return;
    }

    try {
      if (isVet) {
        await vetMutations.accept.mutateAsync(selected._id);
      } else {
        await groomerMutations.accept.mutateAsync(selected._id);
      }
      toast.success("Booking accepted.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleReject = async () => {
    if (!selected) {
      return;
    }

    try {
      if (isVet) {
        await vetMutations.reject.mutateAsync(selected._id);
      } else {
        await groomerMutations.reject.mutateAsync(selected._id);
      }
      toast.success("Booking rejected.");
      setSelectedId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleSaveConsultation = async (complete = false) => {
    if (!selected || !isVet) {
      return;
    }

    try {
      await vetMutations.consultation.mutateAsync({
        id: selected._id,
        diagnosis,
        consultationNotes,
        status: complete ? "completed" : undefined,
      });
      toast.success(complete ? "Visit marked complete." : "Consultation notes saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleUploadReport = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selected || !isVet) {
      return;
    }

    try {
      await vetMutations.report.mutateAsync({ id: selected._id, file });
      toast.success("Medical report uploaded.");
      event.target.value = "";
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleCreateRecord = async () => {
    if (!selected || !isVet || !petId || !recordTitle.trim()) {
      toast.error("Pet and record title are required.");
      return;
    }

    try {
      await vetMutations.medicalRecord.mutateAsync({
        petId,
        appointmentId: selected._id,
        title: recordTitle.trim(),
        description: recordDescription.trim(),
        date: new Date().toISOString(),
        type: "consultation",
      });
      toast.success("Medical record added.");
      setRecordTitle("");
      setRecordDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleSaveGroomerNotes = async () => {
    if (!selected || isVet) {
      return;
    }

    try {
      await groomerMutations.notes.mutateAsync({ id: selected._id, serviceNotes });
      toast.success("Service notes saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleCompleteGroom = async () => {
    if (!selected || isVet) {
      return;
    }

    try {
      await groomerMutations.complete.mutateAsync({ id: selected._id, serviceNotes });
      toast.success("Service marked complete.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const renderTable = (rows, emptyLabel) => (
    <div className="overflow-hidden rounded-[24px] border border-[#F0E2CC] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#FFF8EE] text-xs font-semibold uppercase tracking-[0.18em] text-[#8B7B66]">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Pet</th>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"> </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5E6CC]">
          {rows.length ? (
            rows.map((row) => (
              <tr key={row._id} className="hover:bg-[#FFFBF4]">
                <td className="px-4 py-3 font-semibold text-[#2D2D2D]">{formatWhen(row.appointmentTime)}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{row.petName}</p>
                  <p className="text-xs text-[#8B7B66]">{row.ownerName}</p>
                </td>
                <td className="px-4 py-3">{row.serviceId?.serviceName ?? "—"}</td>
                <td className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#A77222]">
                  {row.status}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSelect(row)}
                    className="rounded-full bg-[#FFF4E2] px-3 py-1 text-xs font-semibold text-[#C77E1D]"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-sm text-[#6B6B6B]">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="pet-page space-y-8">
      <div className="pet-card p-6">
        <h1 className="text-3xl font-bold">{isVet ? "Appointments" : "Bookings"}</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Accept new requests, document visits, and keep pet parents informed.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Incoming</h2>
        {renderTable(incoming, "No incoming requests right now.")}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{isVet ? "My appointments" : "My bookings"}</h2>
        {renderTable(mine, "You have no assigned visits yet.")}
      </section>

      {selected ? (
        <div className="pet-card grid gap-6 p-6 lg:grid-cols-2">
          <div>
            <span className="pet-chip">Selected visit</span>
            <h3 className="mt-3 text-2xl font-bold">{selected.serviceId?.serviceName ?? "Service"}</h3>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              {selected.petName} · {formatWhen(selected.appointmentTime)}
            </p>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              Owner {selected.ownerName} · {selected.contactNumber || selected.ownerEmail}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={handleAccept} className="pet-button-primary">
                Accept
              </button>
              <button type="button" onClick={handleReject} className="pet-button-secondary">
                Reject
              </button>
            </div>
            {isVet && selected.medicalReportUrl ? (
              <a
                href={`${backendOrigin}${selected.medicalReportUrl}`}
                className="mt-4 inline-flex text-sm font-semibold text-[#C77E1D]"
                target="_blank"
                rel="noreferrer"
              >
                View uploaded report
              </a>
            ) : null}
          </div>

          <div className="space-y-4">
            {isVet ? (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A97C3A]">
                    Diagnosis
                  </label>
                  <textarea
                    value={diagnosis}
                    onChange={(event) => setDiagnosis(event.target.value)}
                    className="mt-2 min-h-[90px] w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A97C3A]">
                    Treatment notes
                  </label>
                  <textarea
                    value={consultationNotes}
                    onChange={(event) => setConsultationNotes(event.target.value)}
                    className="mt-2 min-h-[90px] w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleSaveConsultation(false)} className="pet-button-secondary">
                    Save notes
                  </button>
                  <button type="button" onClick={() => handleSaveConsultation(true)} className="pet-button-primary">
                    Complete visit
                  </button>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A97C3A]">
                    Upload medical report
                  </label>
                  <input type="file" accept=".pdf,image/*" className="mt-2 w-full text-sm" onChange={handleUploadReport} />
                </div>

                {petId ? (
                  <div className="rounded-[22px] bg-[#FFF8EE] p-4">
                    <p className="text-sm font-semibold text-[#2D2D2D]">Medical history</p>
                    <div className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-[#6B6B6B]">
                      {(recordsQuery.data ?? []).map((record) => (
                        <div key={record._id} className="rounded-[16px] bg-white px-3 py-2 shadow-sm">
                          <p className="font-semibold text-[#2D2D2D]">{record.title}</p>
                          <p className="text-xs uppercase tracking-[0.16em] text-[#B78331]">{record.type}</p>
                          <p className="text-xs">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {!recordsQuery.data?.length ? <p>No records loaded yet.</p> : null}
                    </div>
                    <div className="mt-4 space-y-2">
                      <input
                        value={recordTitle}
                        onChange={(event) => setRecordTitle(event.target.value)}
                        placeholder="New record title"
                        className="w-full rounded-[16px] border border-[#F0E2CC] bg-white px-3 py-2 text-sm outline-none"
                      />
                      <textarea
                        value={recordDescription}
                        onChange={(event) => setRecordDescription(event.target.value)}
                        placeholder="Details for the owner-facing timeline"
                        className="min-h-[70px] w-full rounded-[16px] border border-[#F0E2CC] bg-white px-3 py-2 text-sm outline-none"
                      />
                      <button type="button" onClick={handleCreateRecord} className="pet-button-primary w-full">
                        Add consultation record
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#6B6B6B]">
                    This booking is not linked to a pet profile yet, so medical history is unavailable.
                  </p>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A97C3A]">
                    Service notes
                  </label>
                  <textarea
                    value={serviceNotes}
                    onChange={(event) => setServiceNotes(event.target.value)}
                    placeholder="Coat treatment, temperament, or special handling"
                    className="mt-2 min-h-[120px] w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleSaveGroomerNotes} className="pet-button-secondary">
                    Save notes
                  </button>
                  <button type="button" onClick={handleCompleteGroom} className="pet-button-primary">
                    Mark completed
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
