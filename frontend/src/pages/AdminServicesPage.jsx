import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, Clock3, PawPrint, Pencil, Plus, Stethoscope, Trash2, WalletCards, X } from "lucide-react";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import { useCreateServices, useDeleteService, useServices, useUpdateService } from "../apis/services/hooks";

function ServiceDetailModal({ service, onClose, onEdit }) {
  if (!service) return null;
  const cfg = categoryConfig[service.category] ?? categoryConfig.vet;
  const catLabel = categoryOptions.find((o) => o.value === service.category)?.label ?? service.category;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0D6]">
              <PawPrint className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2D2D]">{service.serviceName}</h3>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.badge}`}>{catLabel}</span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {service.description && (
            <p className="text-sm leading-relaxed text-gray-600">{service.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#FFF8EE] px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-[#B78331] mb-1">
                <WalletCards className="h-3.5 w-3.5" /> Price
              </div>
              {service.discountPrice != null && service.discountPrice < service.price ? (
                <div>
                  <p className="text-lg font-bold text-emerald-600">NPR {service.discountPrice}</p>
                  <p className="text-xs line-through text-gray-400">NPR {service.price}</p>
                  {service.discountTitle && (
                    <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{service.discountTitle}</span>
                  )}
                </div>
              ) : (
                <p className="text-lg font-bold text-[#2D2D2D]">NPR {service.price}</p>
              )}
            </div>
            <div className="rounded-2xl bg-[#FFF8EE] px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-[#B78331] mb-1">
                <Clock3 className="h-3.5 w-3.5" /> Duration
              </div>
              <p className="text-lg font-bold text-[#2D2D2D]">{service.durationMinutes} min</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#FAFAF8] px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope className="h-4 w-4 text-[#F5A623]" />
              Requires veterinary assignment
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              service.requiresVet
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${service.requiresVet ? "bg-blue-500" : "bg-gray-300"}`} />
              {service.requiresVet ? "Yes" : "No"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[#FAFAF8] px-4 py-3">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              service.isActive
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
              {service.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={() => { onClose(); onEdit({ ...service, price: String(service.price), durationMinutes: String(service.durationMinutes), discountPrice: service.discountPrice != null && service.discountPrice > 0 ? String(service.discountPrice) : "", vaccinationIntervalMonths: service.vaccinationIntervalMonths != null ? String(service.vaccinationIntervalMonths) : "", vaccinationIntervalDays: service.vaccinationIntervalDays != null ? String(service.vaccinationIntervalDays) : "" }); }}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all"
          >
            <Pencil className="h-4 w-4" /> Edit service
          </button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const categoryOptions = [
  { value: "vet",         label: "Vet Consultation" },
  { value: "grooming",    label: "Grooming"          },
  { value: "vaccination", label: "Vaccination"       },
  { value: "dental",      label: "Dental"            },
];

const categoryConfig = {
  vet:         { badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200"     },
  grooming:    { badge: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
  vaccination: { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  dental:      { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200"  },
};

const EMPTY_FORM = { serviceName: "", description: "", price: "", durationMinutes: "45", category: "vet", requiresVet: false, discountTitle: "", discountPrice: "", vaccinationIntervalMonths: "", vaccinationIntervalDays: "" };

function CategoryDropdown({ value, onChange, disabled }) {
  const cfg = categoryConfig[value] ?? categoryConfig.vet;
  const label = categoryOptions.find((o) => o.value === value)?.label ?? value;
  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Listbox.Button className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-75 disabled:opacity-50 ${cfg.badge}`}>
          {label}
          <ChevronDown className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-50 mt-1.5 w-40 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden focus:outline-none">
          {categoryOptions.map((opt) => (
            <Listbox.Option key={opt.value} value={opt.value}
              className={({ active }) => `cursor-pointer select-none px-3 py-2 flex items-center gap-2 text-xs font-medium text-gray-700 transition-colors ${active ? "bg-gray-50" : "bg-white"}`}
            >
              {({ selected }) => (
                <>
                  {opt.label}
                  {selected && <Check className="w-3 h-3 ml-auto text-gray-400 flex-shrink-0" />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}

/* ── Service form modal ── */
function ServiceModal({ initial, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const isEdit = !!initial;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.serviceName.trim() || !form.description.trim() || !form.price) {
      toast.error("Name, description and price are required.");
      return;
    }
    onSave({ ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes), discountPrice: form.discountPrice !== "" && Number(form.discountPrice) > 0 ? Number(form.discountPrice) : null, vaccinationIntervalMonths: form.vaccinationIntervalMonths !== "" ? Number(form.vaccinationIntervalMonths) : null, vaccinationIntervalDays: form.vaccinationIntervalDays !== "" ? Number(form.vaccinationIntervalDays) : null });
  };

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0D6]">
              <PawPrint className="h-4 w-4 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2D2D]">{isEdit ? "Edit Service" : "Add New Service"}</h3>
              <p className="text-xs text-gray-400">{isEdit ? "Update service details" : "Create a new booking service"}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Service Name <span className="text-amber-500">*</span></label>
            <input value={form.serviceName} onChange={(e) => set("serviceName", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description <span className="text-amber-500">*</span></label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (NPR) <span className="text-amber-500">*</span></label>
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duration (min)</label>
              <input type="number" min={15} step={15} value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Discount fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Discount Title</label>
              <input
                value={form.discountTitle}
                onChange={(e) => set("discountTitle", e.target.value)}
                placeholder="e.g. Summer Sale"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Discount Price (NPR)</label>
              <input
                type="number"
                min={0}
                value={form.discountPrice}
                onChange={(e) => set("discountPrice", e.target.value)}
                placeholder="e.g. 1200"
                className={inputCls}
              />
            </div>
          </div>

          {/* Vaccination interval — only shown for vaccination category */}
          {form.category === "vaccination" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Vaccination Interval <span className="text-gray-400 normal-case font-normal">(next due date calculation)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Months</label>
                  <input
                    type="number"
                    min={0}
                    value={form.vaccinationIntervalMonths}
                    onChange={(e) => set("vaccinationIntervalMonths", e.target.value)}
                    placeholder="e.g. 12"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Days</label>
                  <input
                    type="number"
                    min={0}
                    value={form.vaccinationIntervalDays}
                    onChange={(e) => set("vaccinationIntervalDays", e.target.value)}
                    placeholder="e.g. 0"
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                When a vaccination appointment is marked complete, the next due date is automatically calculated and a reminder is sent to the user.
              </p>
            </div>
          )}

          {/* Vet assignment toggle */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-[#FAFAF8] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2D2D2D]">Requires veterinary assignment?</p>
              <p className="mt-0.5 text-xs text-gray-400">Admin must assign a vet before this appointment is active.</p>
            </div>
            <button
              type="button"
              onClick={() => set("requiresVet", !form.requiresVet)}
              className={`relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                form.requiresVet ? "bg-[#F5A623]" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={form.requiresVet}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  form.requiresVet ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSaving}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all">
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create service"}
          </button>
        </div>
      </div>
    </div>
  );
}


function DeleteConfirmModal({ service, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6] mx-auto">
          <PawPrint className="h-7 w-7 text-[#F5A623]" />
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#2D2D2D]">Remove this service?</h3>
        <p className="mt-2 text-center text-sm text-[#7A6A50]">
          <span className="font-semibold text-[#2D2D2D]">"{service.serviceName}"</span> will be permanently removed from the booking catalog.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors disabled:opacity-50">
            Keep it
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all">
            {isDeleting ? "Removing…" : "Yes, remove"}
          </button>
        </div>
      </div>
    </div>
  );
}


export const AdminServicesPage = () => {
  const queryClient = useQueryClient();
  const { data: servicesResponse, isLoading } = useServices();
  const { mutateAsync: createService, isPending: isCreating } = useCreateServices();
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateService();
  const { mutateAsync: deleteService, isPending: isDeleting } = useDeleteService();

  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget]     = useState(null);

  const services = servicesResponse?.data ?? [];

  const categoryCounts = useMemo(() =>
    categoryOptions.reduce((acc, o) => {
      acc[o.value] = services.filter((s) => s.category === o.value).length;
      return acc;
    }, {}), [services]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["get-services"] });

  const handleCreate = async (data) => {
    try {
      await createService(data);
      await invalidate();
      toast.success("Service created.");
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = async (data) => {
    try {
      await updateService({ serviceId: editTarget._id, ...data });
      await invalidate();
      toast.success("Service updated.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteService(deleteTarget._id);
      await invalidate();
      toast.success("Service removed.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (isLoading) {
    return <PetHubLoader title="Loading Services" message="Fetching the live booking catalog." />;
  }

  return (
    <div className="p-6 space-y-6">

      {showModal && <ServiceModal onClose={() => setShowModal(false)} onSave={handleCreate} isSaving={isCreating} />}
      {editTarget && <ServiceModal initial={{ ...editTarget, price: String(editTarget.price), durationMinutes: String(editTarget.durationMinutes), discountPrice: editTarget.discountPrice != null && editTarget.discountPrice > 0 ? String(editTarget.discountPrice) : "", vaccinationIntervalMonths: editTarget.vaccinationIntervalMonths != null ? String(editTarget.vaccinationIntervalMonths) : "", vaccinationIntervalDays: editTarget.vaccinationIntervalDays != null ? String(editTarget.vaccinationIntervalDays) : "" }} onClose={() => setEditTarget(null)} onSave={handleEdit} isSaving={isUpdating} />}
      {deleteTarget && <DeleteConfirmModal service={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} isDeleting={isDeleting} />}
      {viewTarget && <ServiceDetailModal service={viewTarget} onClose={() => setViewTarget(null)} onEdit={(s) => setEditTarget({ ...s, price: String(s.price), durationMinutes: String(s.durationMinutes) })} />}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the booking catalog. Changes appear instantly for users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 px-5 py-4 border border-amber-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Total services</p>
            <p className="mt-1 text-3xl font-bold text-gray-800">{services.length}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categoryOptions.map((o) => {
          const cfg = categoryConfig[o.value] ?? categoryConfig.vet;
          return (
            <div key={o.value} className={`rounded-2xl px-4 py-3 ring-1 ${cfg.badge}`}>
              <p className="text-xs font-semibold">{o.label}</p>
              <p className="mt-1 text-2xl font-bold">{categoryCounts[o.value] ?? 0}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vet Required</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => {
                const cfg = categoryConfig[service.category] ?? categoryConfig.vet;
                const catLabel = categoryOptions.find((o) => o.value === service.category)?.label ?? service.category;
                return (
                  <tr key={service._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewTarget(service)}>

                    {/* Service name + description */}
                    <td className="px-6 py-4 max-w-[260px]">
                      <p className="text-sm font-semibold text-gray-900">{service.serviceName}</p>
                      {service.description && (
                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">{service.description}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                        {catLabel}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">NPR {service.price}</span>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{service.durationMinutes} min</span>
                    </td>

                    {/* Vet Required */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        service.requiresVet
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                          : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${service.requiresVet ? "bg-blue-500" : "bg-gray-300"}`} />
                        {service.requiresVet ? "Yes" : "No"}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4">
                      {service.discountPrice != null && service.discountPrice < service.price ? (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            NPR {service.discountPrice}
                          </span>
                          {service.discountTitle && (
                            <p className="mt-0.5 text-[11px] text-gray-400">{service.discountTitle}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Active toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={async () => {
                          try {
                            await updateService({ serviceId: service._id, isActive: !service.isActive });
                            await invalidate();
                            toast.success(`Service ${!service.isActive ? "activated" : "deactivated"}.`);
                          } catch (err) {
                            toast.error(err.response?.data?.message || err.message);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 ring-1 ring-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {service.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditTarget(service)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Edit service"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B78331] hover:bg-[#FFF8EE] transition-colors"
                          title="Delete service"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {services.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">No services in the catalog yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add first service
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
