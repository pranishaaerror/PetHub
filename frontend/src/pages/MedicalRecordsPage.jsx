import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import {
  AlertTriangle,
  FileChartColumn,
  FileHeart,
  Pill,
  Search,
  ShieldAlert,
  UploadCloud,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useMyPets } from "../apis/pets/hooks";
import { useCreateRecord, useRecordsByPet } from "../apis/records/hooks";

const recordTypes = ["all", "vaccination", "prescription", "allergy", "surgery", "lab", "document"];

export const MedicalRecordsPage = () => {
  const queryClient = useQueryClient();
  const { data: petsResponse, isLoading: isPetsLoading } = useMyPets();
  const primaryPet = petsResponse?.data?.primaryPet ?? null;
  const { data: recordsResponse, isLoading: isRecordsLoading } = useRecordsByPet(primaryPet?._id);
  const { mutateAsync: createRecord, isPending } = useCreateRecord();
  const [activeType, setActiveType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newRecord, setNewRecord] = useState({
    type: "vaccination",
    title: "",
    description: "",
    date: "",
    nextDueDate: "",
    documentUrl: "",
  });

  const records = recordsResponse?.data ?? [];

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const typeMatch = activeType === "all" ? true : record.type === activeType;
      const searchMatch = `${record.title} ${record.description} ${record.type}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return typeMatch && searchMatch;
    });
  }, [activeType, records, searchTerm]);

  const dueReminders = records
    .filter((record) => record.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    .slice(0, 3);

  const handleCreateRecord = async (event) => {
    event.preventDefault();

    if (!primaryPet) {
      toast.error("Complete pet onboarding first.");
      return;
    }

    if (!newRecord.title.trim() || !newRecord.date) {
      toast.error("Record title and date are required.");
      return;
    }

    try {
      await createRecord({
        petId: primaryPet._id,
        ...newRecord,
      });

      await queryClient.invalidateQueries({ queryKey: ["records", primaryPet._id] });
      setNewRecord({
        type: "vaccination",
        title: "",
        description: "",
        date: "",
        nextDueDate: "",
        documentUrl: "",
      });
      toast.success("Medical record added.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

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
      <section className="pet-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="pet-chip">Medical Records</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              A calm, complete health timeline for {primaryPet.name}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
              Search records, filter by type, upload new entries, and keep upcoming due dates easy to see.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {recordTypes.map((type) => (
                <Button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeType === type
                      ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_18px_35px_rgba(245,166,35,0.22)]"
                      : "bg-[#FFE3B3] text-[#8B6428]"
                  }`}
                >
                  {type === "all" ? "All" : type}
                </Button>
              ))}
            </div>

            <label className="mt-6 flex items-center gap-3 rounded-full bg-[#FFF8EE] px-4 py-3 text-sm text-[#6B6B6B] shadow-[0_15px_30px_rgba(45,45,45,0.05)]">
              <Search className="h-4 w-4 text-[#C28C3B]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search titles, notes, or record type"
                className="w-full bg-transparent outline-none placeholder:text-[#9D8B73]"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <FileHeart className="h-8 w-8 text-[#F5A623]" />
              <p className="mt-4 text-sm text-[#8B7B66]">Record count</p>
              <p className="mt-1 text-3xl font-bold">{records.length}</p>
            </div>
            <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <ShieldAlert className="h-8 w-8 text-[#F5A623]" />
              <p className="mt-4 text-sm text-[#8B7B66]">Upcoming due items</p>
              <p className="mt-1 text-3xl font-bold">{dueReminders.length}</p>
            </div>
            <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <Pill className="h-8 w-8 text-[#F5A623]" />
              <p className="mt-4 text-sm text-[#8B7B66]">Active pet</p>
              <p className="mt-1 text-3xl font-bold">{primaryPet.name}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-6">
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
                  No due reminders yet. Add vaccination or follow-up records to start this view.
                </div>
              )}
            </div>
          </div>

          <div className="pet-card bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6">
            <span className="pet-chip">Upload New Record</span>
            <form onSubmit={handleCreateRecord} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Type</span>
                <select
                  value={newRecord.type}
                  onChange={(event) => setNewRecord((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                >
                  {recordTypes.filter((item) => item !== "all").map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Title</span>
                <input
                  value={newRecord.title}
                  onChange={(event) => setNewRecord((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Description</span>
                <textarea
                  value={newRecord.description}
                  onChange={(event) => setNewRecord((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Record date</span>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(event) => setNewRecord((current) => ({ ...current, date: event.target.value }))}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Next due date</span>
                  <input
                    type="date"
                    value={newRecord.nextDueDate}
                    onChange={(event) => setNewRecord((current) => ({ ...current, nextDueDate: event.target.value }))}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Document URL</span>
                <input
                  value={newRecord.documentUrl}
                  onChange={(event) => setNewRecord((current) => ({ ...current, documentUrl: event.target.value }))}
                  placeholder="Optional downloadable link"
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
              </label>
              <button type="submit" disabled={isPending} className="pet-button-primary gap-2">
                <UploadCloud className="h-4 w-4" />
                {isPending ? "Adding record..." : "Upload new record"}
              </button>
            </form>
          </div>
        </div>

        <div className="pet-card overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Timeline</span>
              <h2 className="mt-4 text-2xl font-bold">Records for {primaryPet.name}</h2>
            </div>
            <FileChartColumn className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-6 space-y-4">
            {filteredRecords.length ? (
              filteredRecords.map((record) => (
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
                    </div>
                    <span className="pet-chip">{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#6B6B6B]">
                    {record.description || "This record was added without extra notes."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {record.nextDueDate ? (
                      <span className="rounded-full bg-white px-4 py-2 font-semibold text-[#8B6428] shadow-[0_12px_24px_rgba(45,45,45,0.04)]">
                        Next due {new Date(record.nextDueDate).toLocaleDateString()}
                      </span>
                    ) : null}
                    {record.documentUrl ? (
                      <a
                        href={record.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white px-4 py-2 font-semibold text-[#2D2D2D] shadow-[0_12px_24px_rgba(45,45,45,0.04)]"
                      >
                        Download document
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                eyebrow="No match"
                title="No records match this view yet."
                description="Try another type tab or add a new record for this pet."
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
