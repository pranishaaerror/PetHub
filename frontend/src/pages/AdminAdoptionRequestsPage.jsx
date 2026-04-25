import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Listbox } from "@headlessui/react";
import { HeartHandshake, ChevronDown, Check, PawPrint, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import {
  useMyAdoptionRequests,
  useUpdateAdoptionRequestStatus,
  useDeleteAdoptionRequest,
} from "../apis/adoptionRequests/hooks";

const STATUSES = ["pending", "approved", "rejected", "cancelled"];

const statusConfig = {
  pending:   { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",   dot: "bg-amber-400",   label: "Pending"   },
  approved:  { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20", dot: "bg-emerald-500", label: "Approved"  },
  rejected:  { badge: "bg-red-50 text-red-700 ring-1 ring-red-600/20",         dot: "bg-red-400",     label: "Rejected"  },
  cancelled: { badge: "bg-stone-100 text-stone-500 ring-1 ring-stone-300",     dot: "bg-stone-400",   label: "Cancelled" },
};

function StatusDropdown({ value, onChange, disabled }) {
  const config = statusConfig[value] ?? statusConfig.pending;
  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Listbox.Button
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 ${config.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
          {config.label}
          <ChevronDown className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-50 mt-1.5 w-32 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden focus:outline-none">
          {STATUSES.map((status) => {
            const cfg = statusConfig[status];
            return (
              <Listbox.Option
                key={status}
                value={status}
                className={({ active }) =>
                  `cursor-pointer select-none px-2.5 py-1.5 flex items-center gap-2 transition-colors ${active ? "bg-gray-50" : "bg-white"}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-xs font-medium text-gray-700">{cfg.label}</span>
                    {selected && <Check className="w-3 h-3 ml-auto text-gray-400 flex-shrink-0" />}
                  </>
                )}
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}

function DeleteConfirmModal({ request, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6] mx-auto">
          <PawPrint className="h-7 w-7 text-[#F5A623]" />
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#2D2D2D]">Remove this request?</h3>
        <p className="mt-2 text-center text-sm text-[#7A6A50]">
          The request from <span className="font-semibold text-[#2D2D2D]">{request.fullName || request.email}</span> for{" "}
          <span className="font-semibold text-[#2D2D2D]">{request.petId?.petName || "this pet"}</span> will be permanently removed.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isDeleting ? "Removing…" : "Yes, remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const AdminAdoptionRequestsPage = () => {
  const queryClient = useQueryClient();
  const { data: requestsResponse, isLoading } = useMyAdoptionRequests();
  const { mutateAsync: updateRequest, isPending } = useUpdateAdoptionRequestStatus();
  const { mutateAsync: deleteRequest, isPending: isDeleting } = useDeleteAdoptionRequest();
  const [loadingId, setLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const requests = requestsResponse?.data ?? [];

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = requests.filter((r) => r.status === s).length;
    return acc;
  }, {});

  const handleStatusChange = async (requestId, status) => {
    setLoadingId(requestId);
    try {
      await updateRequest({ requestId, status });
      await queryClient.invalidateQueries({ queryKey: ["my-adoption-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["get-adoption"] });
      toast.success(`Request marked as ${status}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRequest(deleteTarget._id);
      await queryClient.invalidateQueries({ queryKey: ["my-adoption-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["get-adoption"] });
      toast.success("Adoption request deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Adoption Queue"
        message="Collecting adoption requests and review states for the admin team."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">

      {deleteTarget && (
        <DeleteConfirmModal
          request={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Adoption Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Approve, reject, or cancel requests. Each update notifies the applicant instantly.
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-5 py-4 border border-amber-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Pending review</p>
          <p className="mt-1 text-3xl font-bold text-gray-800">{statusCounts.pending ?? 0}</p>
        </div>
      </div>

      {/* ── STAT CHIPS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => {
          const cfg = statusConfig[s];
          return (
            <div key={s} className={`rounded-2xl px-4 py-3 ring-1 ${cfg.badge}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <p className="text-xs font-semibold">{cfg.label}</p>
              </div>
              <p className="mt-1 text-2xl font-bold">{statusCounts[s] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pet
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Household
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((request) => {
                const isRowLoading = loadingId === request._id;
                return (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">

                    {/* Applicant */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-white">
                          {(request.fullName || request.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {request.fullName || "—"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{request.email}</p>
                          <p className="text-xs text-gray-400">{request.contactNumber || "No phone"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Pet */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {request.petId?.petName || "Unknown pet"}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {request.petId?.breed || request.petId?.species || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Household & Lifestyle */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{request.householdType || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{request.lifestyle || "—"}</p>
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4 max-w-[220px]">
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {request.message || "No message provided."}
                      </p>
                    </td>

                    {/* Submitted */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700">
                        {new Date(request.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(request.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-4">
                      <StatusDropdown
                        value={request.status}
                        onChange={(status) => handleStatusChange(request._id, status)}
                        disabled={(isPending && isRowLoading) || isRowLoading}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setDeleteTarget(request)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B78331] hover:bg-[#FFF8EE] transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {requests.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">
              No adoption requests in the queue yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
