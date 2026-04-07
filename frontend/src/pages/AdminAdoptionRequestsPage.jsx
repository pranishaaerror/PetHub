import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, HeartHandshake, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../components/Button";
import {
  useMyAdoptionRequests,
  useUpdateAdoptionRequestStatus,
} from "../apis/adoptionRequests/hooks";
import { PetHubLoader } from "../components/PetHubLoader";

const statusTone = {
  pending: "bg-[#FFF0D6] text-[#8B6428]",
  approved: "bg-[#EAF7ED] text-[#3A7D45]",
  rejected: "bg-[#FFF1EE] text-[#C45F3E]",
  cancelled: "bg-[#F1E7D7] text-[#8B7B66]",
};

const actionLabels = [
  { value: "approved", label: "Approve", icon: CheckCircle2 },
  { value: "rejected", label: "Reject", icon: XCircle },
  { value: "cancelled", label: "Cancel", icon: Clock3 },
];

export const AdminAdoptionRequestsPage = () => {
  const queryClient = useQueryClient();
  const { data: requestsResponse, isLoading } = useMyAdoptionRequests();
  const { mutateAsync: updateRequest, isPending } = useUpdateAdoptionRequestStatus();
  const requests = requestsResponse?.data ?? [];

  const pendingCount = requests.filter((request) => request.status === "pending").length;

  const handleUpdate = async (requestId, status) => {
    try {
      await updateRequest({ requestId, status });
      await queryClient.invalidateQueries({ queryKey: ["my-adoption-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["get-adoption"] });
      toast.success(`Adoption request marked as ${status}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
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
    <div className="pet-page">
      <section className="pet-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="pet-chip">Adoption Queue</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Review adoption requests with a real approval flow.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#6B6B6B]">
              Requests are no longer dead-end submissions. Admin can now approve, reject, or cancel
              them, and PetHub feeds the result back to the user.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B78331]">Pending review</p>
            <p className="mt-2 text-4xl font-bold">{pendingCount}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        {requests.map((request) => (
          <article key={request._id} className="pet-card p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusTone[request.status]}`}>
                    {request.status}
                  </span>
                  <span className="pet-chip">{request.petId?.petName || "Pet profile"}</span>
                </div>

                <h2 className="mt-4 text-2xl font-bold">{request.fullName || "PetHub Member"}</h2>
                <p className="mt-2 text-sm text-[#6B6B6B]">{request.email || "No email saved"}</p>
                <p className="mt-1 text-sm text-[#6B6B6B]">{request.contactNumber || "No contact number saved"}</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Pet</p>
                    <p className="mt-2 text-sm font-semibold text-[#2D2D2D]">
                      {request.petId?.petName || "Unknown pet"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Household</p>
                    <p className="mt-2 text-sm font-semibold text-[#2D2D2D]">
                      {request.householdType || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Lifestyle</p>
                    <p className="mt-2 text-sm font-semibold text-[#2D2D2D]">
                      {request.lifestyle || "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Submitted</p>
                    <p className="mt-2 text-sm font-semibold text-[#2D2D2D]">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-5 w-5 text-[#F5A623]" />
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Message</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#5B544C]">
                    {request.message || "No additional note was provided with this request."}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:min-w-[220px]">
                {actionLabels.map((action) => (
                  <Button
                    key={action.value}
                    type="button"
                    disabled={isPending || request.status === action.value}
                    onClick={() => handleUpdate(request._id, action.value)}
                    className={`rounded-full px-4 py-3 text-sm font-semibold transition-transform ${
                      request.status === action.value
                        ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_18px_35px_rgba(245,166,35,0.18)]"
                        : "bg-white text-[#5B544C] shadow-[0_12px_24px_rgba(45,45,45,0.04)] hover:-translate-y-0.5"
                    }`}
                  >
                    <action.icon className="mr-2 inline h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </article>
        ))}

        {!requests.length ? (
          <div className="pet-card p-8 text-center text-[#6B6B6B]">
            No adoption requests are in the queue yet.
          </div>
        ) : null}
      </section>
    </div>
  );
};
