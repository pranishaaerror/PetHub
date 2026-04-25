import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, MapPin, Users, Plus, Pencil, Trash2,
  X, Eye, EyeOff, Sparkles, PawPrint,
} from "lucide-react";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import {
  useCommunityMeetups,
  useAdminCreateMeetup,
  useAdminUpdateMeetup,
  useAdminDeleteMeetup,
} from "../apis/community/hooks";

const TYPES = ["meetup", "discussion", "playdate", "announcement"];
const ENERGY_STYLES = ["gentle", "playful", "quiet", "active"];

const typeConfig = {
  meetup:       { color: "bg-amber-100 text-amber-700",   dot: "bg-amber-400",   emoji: "🤝" },
  discussion:   { color: "bg-blue-100 text-blue-700",     dot: "bg-blue-400",    emoji: "💬" },
  playdate:     { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", emoji: "🐾" },
  announcement: { color: "bg-purple-100 text-purple-700", dot: "bg-purple-400",  emoji: "📢" },
};

const energyColor = {
  gentle:  "text-emerald-600 bg-emerald-50",
  playful: "text-amber-600 bg-amber-50",
  quiet:   "text-blue-600 bg-blue-50",
  active:  "text-orange-600 bg-orange-50",
};

const EMPTY_FORM = {
  title: "", description: "", type: "meetup", date: "", time: "",
  location: "", hostName: "", tags: "", energyStyle: "gentle",
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white";

function MeetupModal({ initial, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const isEdit = !!initial;
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, description, type, date, time, location, hostName } = form;
    if (!title || !description || !type || !date || !time || !location || !hostName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSave({
      ...form,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {isEdit ? "Edit Event" : "Create New Event"}
              </h3>
              <p className="text-xs text-gray-400">
                {isEdit ? "Update event details" : "Add a new community event"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          <Field label="Event Title" required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
              placeholder="e.g. Sunrise Walk Club"
            />
          </Field>

          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="What's this event about?"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" required>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </Field>
            <Field label="Energy Style">
              <select value={form.energyStyle} onChange={(e) => set("energyStyle", e.target.value)} className={inputCls}>
                {ENERGY_STYLES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" required>
              <input
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className={inputCls}
                placeholder="Sunday, April 6"
              />
            </Field>
            <Field label="Time" required>
              <input
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className={inputCls}
                placeholder="11:00 AM"
              />
            </Field>
          </div>

          <Field label="Location" required>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputCls}
              placeholder="Patan Garden Courts"
            />
          </Field>

          <Field label="Host Name" required>
            <input
              value={form.hostName}
              onChange={(e) => set("hostName", e.target.value)}
              className={inputCls}
              placeholder="PetHub Community Desk"
            />
          </Field>

          <Field label="Tags (comma-separated)">
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={inputCls}
              placeholder="brunch, social, featured"
            />
          </Field>
        </form>

        {/* Modal footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ meetup, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6] mx-auto">
          <PawPrint className="h-7 w-7 text-[#F5A623]" />
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#2D2D2D]">Remove this event?</h3>
        <p className="mt-2 text-center text-sm text-[#7A6A50]">
          <span className="font-semibold text-[#2D2D2D]">"{meetup.title}"</span> will be permanently removed and users won't see it anymore.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? "Removing…" : "Yes, remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetupCard({ meetup, onEdit, onDelete, onToggle, isToggling }) {
  const isPublished = meetup.approved !== false;
  const type = typeConfig[meetup.type] ?? { color: "bg-gray-100 text-gray-600", dot: "bg-gray-400", emoji: "📅" };
  const energy = energyColor[meetup.energyStyle] ?? "text-gray-600 bg-gray-50";

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden ${isPublished ? "border-gray-200" : "border-dashed border-gray-300 opacity-75"}`}>

      {/* Colour accent strip */}
      <div className={`h-1.5 w-full ${isPublished ? "bg-gradient-to-r from-amber-400 to-amber-300" : "bg-gray-200"}`} />

      <div className="flex flex-col gap-3 p-5 flex-1">

        {/* Top row: type badge + visibility */}
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${type.color}`}>
            <span>{type.emoji}</span>
            {meetup.type}
          </span>
          <button
            onClick={() => onToggle(meetup)}
            disabled={isToggling}
            title={isPublished ? "Click to hide" : "Click to publish"}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80 disabled:cursor-not-allowed ${
              isPublished
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
            }`}
          >
            {isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {isPublished ? "Live" : "Hidden"}
          </button>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-1">{meetup.title}</h3>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">{meetup.description}</p>
        </div>

        {/* Meta info */}
        <div className="space-y-1.5">
          <p className="flex items-center gap-2 text-xs text-gray-600">
            <CalendarDays className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            {meetup.date} · {meetup.time}
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{meetup.location}</span>
          </p>
          <p className="flex items-center gap-2 text-xs text-gray-600">
            <Users className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            {meetup.attendees?.length ?? 0} attendee{meetup.attendees?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Host + energy */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">
            <span className="font-medium text-gray-700">{meetup.hostName}</span>
          </p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${energy}`}>
            {meetup.energyStyle}
          </span>
        </div>

        {/* Tags */}
        {meetup.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meetup.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => onEdit(meetup)}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => onDelete(meetup)}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#B78331] hover:bg-[#FFF8EE] transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

export const AdminCommunityPage = () => {
  const queryClient = useQueryClient();
  const { data: meetupsResponse, isLoading } = useCommunityMeetups();
  const { mutateAsync: createMeetup, isPending: isCreating } = useAdminCreateMeetup();
  const { mutateAsync: updateMeetup, isPending: isUpdating } = useAdminUpdateMeetup();
  const { mutateAsync: deleteMeetup, isPending: isDeleting } = useAdminDeleteMeetup();

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId]     = useState(null);

  const meetups = meetupsResponse?.data ?? [];
  const publishedCount = meetups.filter((m) => m.approved !== false).length;
  const hiddenCount    = meetups.length - publishedCount;
  const totalAttendees = meetups.reduce((s, m) => s + (m.attendees?.length ?? 0), 0);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["community-meetups"] });

  const handleCreate = async (data) => {
    try {
      await createMeetup(data);
      await invalidate();
      toast.success("Event created and published.");
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateMeetup({ meetupId: editTarget._id, ...data });
      await invalidate();
      toast.success("Event updated.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleToggleApproved = async (meetup) => {
    setTogglingId(meetup._id);
    try {
      await updateMeetup({ meetupId: meetup._id, approved: !meetup.approved });
      await invalidate();
      toast.success(`Event ${!meetup.approved ? "published" : "hidden"}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeetup({ meetupId: deleteTarget._id });
      await invalidate();
      toast.success("Event deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (isLoading) {
    return <PetHubLoader title="Loading Community" message="Fetching meetups and community events." />;
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Community Events</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage events that appear on the community page for all users.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      {/* ── STAT CHIPS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <p className="text-xs font-semibold text-amber-600">Total Events</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{meetups.length}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <p className="text-xs font-semibold text-emerald-600">Published</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{publishedCount}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200">
          <p className="text-xs font-semibold text-gray-500">Hidden</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{hiddenCount}</p>
        </div>
        <div className="rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-200">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-500" />
            <p className="text-xs font-semibold text-blue-600">Total RSVPs</p>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-800">{totalAttendees}</p>
        </div>
      </div>

      {/* ── CARD GRID ── */}
      {meetups.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
            🐾
          </div>
          <div>
            <p className="text-base font-bold text-gray-700">No events yet</p>
            <p className="mt-1 text-sm text-gray-400">Create your first community event to get started.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create first event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {meetups.map((meetup) => (
            <MeetupCard
              key={meetup._id}
              meetup={meetup}
              onEdit={(m) => setEditTarget({ ...m, tags: m.tags?.join(", ") ?? "" })}
              onDelete={setDeleteTarget}
              onToggle={handleToggleApproved}
              isToggling={togglingId === meetup._id}
            />
          ))}

          {/* Add new card */}
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 py-12 text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Add new event</span>
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      {showModal && (
        <MeetupModal onClose={() => setShowModal(false)} onSave={handleCreate} isSaving={isCreating} />
      )}
      {editTarget && (
        <MeetupModal initial={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} isSaving={isUpdating} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          meetup={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
};
