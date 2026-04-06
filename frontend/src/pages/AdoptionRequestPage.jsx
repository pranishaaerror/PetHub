import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, HeartHandshake, Home, MailCheck, PawPrint, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateAdoptionRequest, useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { useAdoptionById } from "../apis/adoption/hooks";
import { PetHubLoader } from "../components/PetHubLoader";
import { useAuth } from "../context/AuthContext";
import { decorateAdoptionPet } from "../utils/adoptionPets";
import { Button } from "../components/Button";

const householdOptions = ["Apartment", "House with yard", "Shared home", "Other"];
const lifestyleOptions = [
  "Calm indoor routine",
  "Active outdoor routine",
  "Family household",
  "Flexible and mixed",
];

const requestStatusMeta = {
  pending: {
    label: "Pending review",
    title: "Your request is already in review.",
    description:
      "PetHub has your adoption request saved for this pet, so you do not need to submit another one right now.",
  },
  approved: {
    label: "Approved",
    title: "This adoption request has already been approved.",
    description:
      "PetHub already has an approved match on file for this pet. Please continue with the follow-up instructions from support.",
  },
  rejected: {
    label: "Previous request closed",
    title: "You can send a refreshed request.",
    description:
      "A previous request was closed, so you can submit a new one with updated details and a new note.",
  },
  cancelled: {
    label: "Cancelled",
    title: "You can reopen the conversation.",
    description:
      "This request was cancelled earlier. If the timing feels right again, you can submit a new request below.",
  },
};

export const AdoptionRequestPage = () => {
  const { petId } = useParams();
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();
  const { data: response, isLoading } = useAdoptionById(petId);
  const { data: requestsResponse, isLoading: isRequestsLoading } = useMyAdoptionRequests();
  const { mutateAsync: createRequest, isPending } = useCreateAdoptionRequest();
  const pet = decorateAdoptionPet(response?.data?.pet);
  const requests = requestsResponse?.data ?? [];
  const [submittedStatus, setSubmittedStatus] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    householdType: householdOptions[0],
    lifestyle: lifestyleOptions[0],
    note: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || userProfile?.fullName || userProfile?.displayName || "",
      email: current.email || userProfile?.email || "",
      contactNumber:
        current.contactNumber || userProfile?.phoneNumber || userProfile?.contactNumber || "",
    }));
  }, [userProfile]);

  const latestRequest = useMemo(() => {
    const matchingRequests = requests.filter((request) => {
      const requestPetId =
        typeof request.petId === "string" ? request.petId : request.petId?._id;

      return requestPetId === petId;
    });

    return matchingRequests[0] ?? null;
  }, [petId, requests]);

  const requestMeta =
    requestStatusMeta[submittedStatus || latestRequest?.status] ?? requestStatusMeta.cancelled;
  const isLocked = ["pending", "approved"].includes(submittedStatus || latestRequest?.status);
  const canSubmit = pet?.status === "Available" && !isLocked;

  if (isLoading || isRequestsLoading) {
    return (
      <PetHubLoader
        title="Loading Adoption Request"
        message="Preparing the request form and checking whether you already have a submission on file."
      />
    );
  }

  if (!pet) {
    return (
      <div className="pet-page">
        <div className="pet-card p-8 text-center">
          <h1 className="text-3xl font-bold">Pet not found.</h1>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            This adoption request page is unavailable right now.
          </p>
          <Link to="/adoption" className="pet-button-primary mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("A new adoption request cannot be sent for this pet right now.");
      return;
    }

    if (!form.note.trim()) {
      toast.error("Please share why this home feels like a good match.");
      return;
    }

    try {
      const responseData = await createRequest({
        petId: pet._id,
        fullName: form.fullName,
        email: form.email,
        contactNumber: form.contactNumber,
        householdType: form.householdType,
        lifestyle: form.lifestyle,
        message: form.note,
      });

      setSubmittedStatus(responseData.data?.status ?? "pending");
      await queryClient.invalidateQueries({ queryKey: ["my-adoption-requests"] });
      toast.success("Adoption request submitted. PetHub saved it for review.");
    } catch (error) {
      const nextStatus = error.response?.data?.request?.status;

      if (nextStatus) {
        setSubmittedStatus(nextStatus);
      }

      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pet-page">
      <section className="pet-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="pet-rise-in">
            <Link to={`/adoption/${pet._id}`} className="pet-button-secondary gap-2">
              <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
              Back to {pet.petName}
            </Link>

            <span className="pet-chip mt-6">Adoption Request</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Start a thoughtful request for {pet.petName}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
              This request is now a real backend flow: your details, home snapshot, and note are saved
              to PetHub and tracked by status.
            </p>

            <div className="mt-8 rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                  <PawPrint className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                    Pet snapshot
                  </p>
                  <p className="mt-1 text-2xl font-bold">{pet.petName}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Breed</p>
                  <p className="mt-1 text-lg font-semibold">{pet.breed}</p>
                </div>
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Status</p>
                  <p className="mt-1 text-lg font-semibold">{pet.displayStatus}</p>
                </div>
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Location</p>
                  <p className="mt-1 text-lg font-semibold">{pet.location}</p>
                </div>
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Temperament</p>
                  <p className="mt-1 text-lg font-semibold">{pet.temperament}</p>
                </div>
              </div>
            </div>

            {latestRequest || submittedStatus ? (
              <div className="mt-6 rounded-[28px] bg-[#FFF8EE] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                      {requestMeta.label}
                    </p>
                    <p className="mt-2 text-xl font-bold">{requestMeta.title}</p>
                    <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">{requestMeta.description}</p>
                    {latestRequest?.updatedAt ? (
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#9C8A72]">
                        Last updated {new Date(latestRequest.updatedAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pet-rise-in [animation-delay:140ms]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[32px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 shadow-[0_22px_45px_rgba(45,45,45,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="pet-chip">Application Form</span>
                  <h2 className="mt-4 text-2xl font-bold">Tell PetHub about your home</h2>
                </div>
                <HeartHandshake className="h-7 w-7 text-[#F5A623]" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Full name</span>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] disabled:cursor-not-allowed disabled:opacity-60"
                    required
                    disabled={isLocked}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] disabled:cursor-not-allowed disabled:opacity-60"
                    required
                    disabled={isLocked}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Contact number</span>
                  <input
                    type="tel"
                    value={form.contactNumber}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactNumber: event.target.value }))
                    }
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] disabled:cursor-not-allowed disabled:opacity-60"
                    required
                    disabled={isLocked}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5B544C]">
                    <Home className="h-4 w-4 text-[#F5A623]" />
                    Household type
                  </span>
                  <select
                    value={form.householdType}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, householdType: event.target.value }))
                    }
                    className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isLocked}
                  >
                    {householdOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Lifestyle rhythm</span>
                <select
                  value={form.lifestyle}
                  onChange={(event) => setForm((current) => ({ ...current, lifestyle: event.target.value }))}
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLocked}
                >
                  {lifestyleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">
                  Why does {pet.petName} feel like the right match?
                </span>
                <textarea
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  rows={5}
                  placeholder="Share a little about your routine, your home, and how you would help this pet settle gently."
                  className="w-full rounded-[22px] bg-white px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062] disabled:cursor-not-allowed disabled:opacity-60"
                  required
                  disabled={isLocked}
                />
              </label>

              <Button
                type="submit"
                disabled={isPending || !canSubmit}
                className="pet-button-primary mt-6 w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MailCheck className="h-4 w-4" />
                {isPending
                  ? "Sending request..."
                  : !canSubmit
                    ? "Request already on file"
                    : "Submit adoption request"}
              </Button>

              {!canSubmit ? (
                <div className="mt-4 rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#5B544C] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  {pet.status !== "Available"
                    ? "This pet is not currently open for a new adoption request."
                    : requestMeta.description}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
