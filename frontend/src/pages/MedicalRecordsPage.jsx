import {
  AlertTriangle,
  FileChartColumn,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useMyPets } from "../apis/pets/hooks";
import { useRecordsByPet } from "../apis/records/hooks";

export const MedicalRecordsPage = () => {
  const { data: petsResponse, isLoading: isPetsLoading } = useMyPets();
  const primaryPet = petsResponse?.data?.primaryPet ?? null;
  const { data: recordsResponse, isLoading: isRecordsLoading } = useRecordsByPet(primaryPet?._id);

  const records = (recordsResponse?.data ?? []).filter((r) => r.veterinarianId);

  const dueReminders = records
    .filter((record) => record.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    .slice(0, 3);

  if (isPetsLoading || isRecordsLoading) {
    return (
      <PetHubLoader
        title="Loading Records"
        message="Gathering your pet's medical timeline and due reminders."
      />
    );
  }

  if (!primaryPet) {
    return (
      <div className="pet-page">
        <EmptyState
          eyebrow="Medical Records"
          title="Start with your pet profile first."
          description="Once onboarding is complete, PetHub can organize records by type, due date, and health story."
          action={<Link to="/onboarding" className="pet-button-primary">Complete onboarding</Link>}
        />
      </div>
    );
  }

  return (
    <div className="pet-page">
      {/* ── HERO ── */}
      <div className="pet-card p-6 md:p-8">
        <span className="pet-chip">Medical Records</span>
        <h1 className="mt-3 text-3xl font-bold text-[#2D2D2D] md:text-4xl">Your medical records</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[#6B6B6B]">
          A full record of your pet's health history, consultations, and upcoming reminders.
        </p>
      </div>

      {/* ── CONTENT ── */}
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">

        {/* Due reminders */}
        <div className="pet-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Due Reminders</span>
              <h2 className="mt-4 text-2xl font-bold">Watch these next</h2>
            </div>
            <AlertTriangle className="h-7 w-7 text-[#F5A623]" />
          </div>
          <div className="mt-6 space-y-4">
            {dueReminders.length ? (
              dueReminders.map((record) => (
                <div
                  key={record._id}
                  className="rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#6B6B6B] shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <p className="font-semibold text-[#2D2D2D]">{record.title}</p>
                  <p className="mt-1">Due {new Date(record.nextDueDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#6B6B6B] shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                No due reminders yet.
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="pet-card overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Timeline</span>
              <h2 className="mt-4 text-2xl font-bold">Records for {primaryPet.name}</h2>
            </div>
            <FileChartColumn className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-6 space-y-4">
            {records.length ? (
              records.map((record) => (
                <article
                  key={record._id}
                  className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold">{record.title}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                        {record.type}
                      </p>
                      {record.veterinarianId && (
                        <p className="mt-1 text-xs text-[#9A8A6A]">
                          By Dr. {record.veterinarianId.fullName || record.veterinarianId.displayName}
                        </p>
                      )}
                    </div>
                    <span className="pet-chip">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  {/* Parse and display diagnosis and notes separately */}
                  {(() => {
                    const desc = record.description || "";
                    const diagMatch = desc.match(/Diagnosis:\s*([\s\S]*?)(?=\nNotes:|$)/);
                    const notesMatch = desc.match(/Notes:\s*([\s\S]*?)$/);
                    const diagnosis = diagMatch?.[1]?.trim();
                    const notes = notesMatch?.[1]?.trim();

                    if (diagnosis || notes) {
                      return (
                        <div className="mt-4 space-y-2">
                          {diagnosis && (
                            <p className="text-sm leading-relaxed text-[#6B6B6B]">
                              <span className="font-bold text-[#2D2D2D]">Diagnosis:</span> {diagnosis}
                            </p>
                          )}
                          {notes && (
                            <p className="text-sm leading-relaxed text-[#6B6B6B]">
                              <span className="font-bold text-[#2D2D2D]">Notes:</span> {notes}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return desc ? (
                      <p className="mt-4 text-sm leading-7 text-[#6B6B6B]">{desc}</p>
                    ) : null;
                  })()}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {record.nextDueDate ? (
                      <span className="rounded-full bg-white px-4 py-2 font-semibold text-[#8B6428] shadow-[0_12px_24px_rgba(45,45,45,0.04)]">
                        Next due {new Date(record.nextDueDate).toLocaleDateString()}
                      </span>
                    ) : null}
                    {record.documentUrl ? (
                      <a
                        href={record.documentUrl.startsWith("http") ? record.documentUrl : `${import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "http://localhost:5000"}${record.documentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#F5A623] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.26)] hover:bg-[#e09515] transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        View medical report
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                eyebrow="No records"
                title="No medical records yet."
                description="Your vet's consultation notes and reports will appear here."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
