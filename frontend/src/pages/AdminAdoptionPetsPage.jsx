import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, X, PawPrint,
  Venus, Mars, CalendarDays, MapPin, Heart, Camera,
} from "lucide-react";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import {
  useAdoption,
  useAdminCreateAdoptionPet,
  useAdminUpdateAdoptionPet,
  useAdminDeleteAdoptionPet,
  useAdminUploadAdoptionPetPhoto,
} from "../apis/adoption/hooks";

const STATUSES = ["Available", "Pending", "Adopted"];
const GENDERS  = ["Male", "Female"];
const SIZES    = ["Small", "Medium", "Large"];

const statusConfig = {
  Available: { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  Pending:   { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400"   },
  Adopted:   { badge: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",    dot: "bg-purple-400"  },
};

const SPECIES_EMOJI = { dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦", hamster: "🐹" };
const getEmoji = (breed = "") => {
  const lower = breed.toLowerCase();
  for (const [key, emoji] of Object.entries(SPECIES_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🐾";
};

const EMPTY_FORM = {
  petName: "", breed: "", age: "", gender: "Male",
  size: "Medium", location: "", healthStatus: "",
  description: "", vaccinated: true, status: "Available",
};

const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white";
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-amber-500">*</span>}
    </label>
    {children}
  </div>
);

function PetModal({ initial, onClose, onSave, isSaving, onPhotoUpload, isUploadingPhoto }) {
  const BACKEND = import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "http://localhost:5000";

  const resolvePreview = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    if (path.startsWith("/uploads/")) return `${BACKEND}${path}`;
    return null;
  };

  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState(() => resolvePreview(initial?.imageGallery?.[0] ?? null));
  const isEdit = !!initial;
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local blob preview immediately
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);
    if (isEdit && initial?._id && onPhotoUpload) {
      // Upload immediately for existing pets and update form imageGallery
      try {
        const res = await onPhotoUpload({ petId: initial._id, file });
        // Update form so Save changes preserves the new photo
        const newPhotoUrl = res?.data?.photoUrl ?? res?.photoUrl;
        if (newPhotoUrl) {
          setForm((f) => ({ ...f, imageGallery: [newPhotoUrl] }));
        }
      } catch {
        // preview already shown, upload error handled by parent
      }
    } else {
      // Store file to upload after creation
      setForm((f) => ({ ...f, _pendingPhoto: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.petName || !form.breed || !form.age || !form.gender) {
      toast.error("Pet name, breed, age and gender are required.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0D6]">
              <PawPrint className="h-4 w-4 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2D2D]">
                {isEdit ? "Edit Pet" : "Add New Pet"}
              </h3>
              <p className="text-xs text-gray-400">
                {isEdit ? "Update pet details" : "List a pet for adoption"}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Photo upload */}
          <Field label="Pet Photo">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#F0DFC0] bg-[#FFF8EE] py-5 transition hover:border-[#F5A623] hover:bg-[#FFF5E0]">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="h-28 w-28 rounded-xl object-cover shadow" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0D6]">
                    <Camera className="h-6 w-6 text-[#F5A623]" />
                  </div>
                  <p className="text-xs font-semibold text-[#B78331]">
                    {isUploadingPhoto ? "Uploading…" : "Click to upload photo"}
                  </p>
                  <p className="text-[11px] text-gray-400">JPG, PNG or WEBP · max 15MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={isUploadingPhoto}
              />
            </label>
            {previewUrl && (
              <p className="mt-1 text-center text-[11px] text-[#B78331]">
                {isUploadingPhoto ? "Uploading…" : "Click photo to change"}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pet Name" required>
              <input value={form.petName} onChange={(e) => set("petName", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Breed" required>
              <input value={form.breed} onChange={(e) => set("breed", e.target.value)}
                className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" required>
              <input value={form.age} onChange={(e) => set("age", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Gender" required>
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Size">
              <select value={form.size} onChange={(e) => set("size", e.target.value)} className={inputCls}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Location">
            <input value={form.location} onChange={(e) => set("location", e.target.value)}
              className={inputCls} />
          </Field>

          <Field label="Health Status">
            <input value={form.healthStatus} onChange={(e) => set("healthStatus", e.target.value)}
              className={inputCls} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              rows={3} className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Vaccinated">
              <select value={form.vaccinated ? "yes" : "no"}
                onChange={(e) => set("vaccinated", e.target.value === "yes")}
                className={inputCls}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSaving}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all">
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Add pet"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ pet, onConfirm, onCancel, isPending }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6] mx-auto">
          <PawPrint className="h-7 w-7 text-[#F5A623]" />
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#2D2D2D]">Remove this pet?</h3>
        <p className="mt-2 text-center text-sm text-[#7A6A50]">
          <span className="font-semibold text-[#2D2D2D]">"{pet.petName}"</span> will be permanently removed from the adoption center.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors">
            Keep it
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all">
            {isPending ? "Removing…" : "Yes, remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PetCard({ pet, onEdit, onDelete }) {
  const emoji = getEmoji(pet.breed);
  const status = statusConfig[pet.status] ?? statusConfig.Available;

  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">

      {/* Hero */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-[#FFF5E0] to-[#FFE9A8] h-64 overflow-hidden rounded-t-2xl">
        {pet.imageGallery?.[0] && !pet.imageGallery[0].endsWith("/photo") ? (
          <img
            src={pet.imageGallery[0].startsWith("http") ? pet.imageGallery[0] : `${import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "http://localhost:5000"}${pet.imageGallery[0]}`}
            alt={pet.petName}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span className="text-6xl">{emoji}</span>
        )}
        {/* Status badge */}
        <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {pet.status}
        </div>
        {/* Vaccinated badge */}
        {pet.vaccinated && (
          <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            ✓ Vaccinated
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h3 className="font-bold text-[#2D2D2D] text-base leading-tight">{pet.petName}</h3>
          <p className="text-xs text-[#9A8A6A] mt-0.5">{pet.breed}{pet.species ? ` · ${pet.species}` : ""}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E0] px-2.5 py-0.5 text-[11px] font-semibold text-[#8B6428]">
            {pet.gender === "Female" ? <Venus className="h-3 w-3 text-pink-500" /> : <Mars className="h-3 w-3 text-blue-500" />}
            {pet.gender}
          </span>
          <span className="rounded-full bg-[#FFF5E0] px-2.5 py-0.5 text-[11px] font-semibold text-[#8B6428]">
            {pet.age}
          </span>
          {pet.size && (
            <span className="rounded-full bg-[#FFF5E0] px-2.5 py-0.5 text-[11px] font-semibold text-[#8B6428]">
              {pet.size}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {pet.location && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 text-[#F5A623] shrink-0" />
              <span className="truncate">{pet.location}</span>
            </p>
          )}
          {pet.intakeDate && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <CalendarDays className="h-3.5 w-3.5 text-[#F5A623] shrink-0" />
              Since {new Date(pet.intakeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
          {pet.adoptionFee > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Heart className="h-3.5 w-3.5 text-[#F5A623] shrink-0" />
              NPR {pet.adoptionFee} adoption fee
            </p>
          )}
        </div>

        {pet.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{pet.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button onClick={() => onEdit(pet)}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <div className="w-px bg-gray-100" />
        <button onClick={() => onDelete(pet)}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#B78331] hover:bg-[#FFF8EE] transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}

export const AdminAdoptionPetsPage = () => {
  const queryClient = useQueryClient();
  const { data: adoptionResponse, isLoading } = useAdoption();
  const { mutateAsync: createPet, isPending: isCreating } = useAdminCreateAdoptionPet();
  const { mutateAsync: updatePet, isPending: isUpdating } = useAdminUpdateAdoptionPet();
  const { mutateAsync: deletePet, isPending: isDeleting } = useAdminDeleteAdoptionPet();
  const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useAdminUploadAdoptionPetPhoto();

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const pets = adoptionResponse?.data?.pets ?? [];
  const availableCount = pets.filter((p) => p.status === "Available").length;
  const pendingCount   = pets.filter((p) => p.status === "Pending").length;
  const adoptedCount   = pets.filter((p) => p.status === "Adopted").length;
  // Only show non-adopted pets in the grid
  const visiblePets = pets.filter((p) => p.status !== "Adopted");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["get-adoption"] });

  const handlePhotoUpload = async ({ petId, file }) => {
    try {
      const res = await uploadPhoto({ petId, file });
      await invalidate();
      toast.success("Photo uploaded.");
      return res; // return so modal can update imageGallery
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreate = async (data) => {
    try {
      const { _pendingPhoto, ...petData } = data;
      const res = await createPet(petData);
      const newPetId = res?.data?.adoption?._id;
      if (_pendingPhoto && newPetId) {
        await uploadPhoto({ petId: newPetId, file: _pendingPhoto });
      }
      await invalidate();
      toast.success("Pet listed for adoption.");
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = async (data) => {
    try {
      const { _pendingPhoto, ...petData } = data;
      await updatePet({ petId: editTarget._id, ...petData });
      await invalidate();
      toast.success("Pet updated.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePet({ petId: deleteTarget._id });
      await invalidate();
      toast.success("Pet removed.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (isLoading) {
    return <PetHubLoader title="Loading Adoption Center" message="Fetching all listed pets." />;
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Adoption Center</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add and manage pets listed for adoption. Users can browse and submit requests from their dashboard.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Pet
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <p className="text-xs font-semibold text-amber-600">Total Listed</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{pets.length}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <p className="text-xs font-semibold text-emerald-600">Available</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{availableCount}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <p className="text-xs font-semibold text-amber-700">Pending</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{pendingCount}</p>
        </div>
        <div className="rounded-2xl bg-purple-50 px-4 py-3 ring-1 ring-purple-200">
          <p className="text-xs font-semibold text-purple-600">Adopted</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{adoptedCount}</p>
        </div>
      </div>

      {/* ── GRID ── */}
      {visiblePets.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0D6] text-3xl">
            🐾
          </div>
          <div>
            <p className="text-base font-bold text-gray-700">No pets listed yet</p>
            <p className="mt-1 text-sm text-gray-400">Add the first pet to the adoption center.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add first pet
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visiblePets.map((pet) => (
            <PetCard
              key={pet._id}
              pet={pet}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
          {/* Quick-add card */}
          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 py-12 text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-all min-h-[280px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0D6]">
              <Plus className="h-6 w-6 text-[#F5A623]" />
            </div>
            <span className="text-sm font-semibold">Add new pet</span>
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      {showModal && (
        <PetModal onClose={() => setShowModal(false)} onSave={handleCreate} isSaving={isCreating} onPhotoUpload={handlePhotoUpload} isUploadingPhoto={isUploadingPhoto} />
      )}
      {editTarget && (
        <PetModal initial={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} isSaving={isUpdating} onPhotoUpload={handlePhotoUpload} isUploadingPhoto={isUploadingPhoto} />
      )}
      {deleteTarget && (
        <DeleteModal
          pet={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
};
