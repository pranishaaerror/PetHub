import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarDays,
  HeartHandshake,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAdoptionById } from "../apis/adoption/hooks";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { PetHubLoader } from "../components/PetHubLoader";
import { decorateAdoptionPet } from "../utils/adoptionPets";

const requestMeta = {
  pending: {
    label: "Pending review",
    description:
      "Your adoption request is already in PetHub's review queue for this pet.",
  },
  approved: {
    label: "Approved",
    description:
      "This adoption request has already been approved, so you can continue the follow-up process instead of sending another form.",
  },
  rejected: {
    label: "Request closed",
    description:
      "A previous request was closed. You can submit a fresh application if you'd like to try again.",
  },
  cancelled: {
    label: "Cancelled",
    description:
      "The previous request was cancelled, so you can reopen the conversation with a new request.",
  },
};

export const AdoptionPetDetailPage = () => {
  const { petId } = useParams();
  const { data: response, isLoading } = useAdoptionById(petId);
  const { data: requestsResponse } = useMyAdoptionRequests();
  const pet = decorateAdoptionPet(response?.data?.pet);
  const requests = requestsResponse?.data ?? [];

  const latestRequest = useMemo(() => {
    return (
      requests.find((request) => {
        const requestPetId =
          typeof request.petId === "string" ? request.petId : request.petId?._id;

        return requestPetId === petId;
      }) ?? null
    );
  }, [petId, requests]);

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Pet Profile"
        message="Opening this adoption story and checking your request status."
      />
    );
  }

  if (!pet) {
    return (
      <div className="pet-page">
        <div className="pet-card p-8 text-center">
          <h1 className="text-3xl font-bold">Pet not found.</h1>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            This adoption profile is unavailable right now.
          </p>
          <Link to="/adoption" className="pet-button-primary mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  const currentRequestMeta = latestRequest ? requestMeta[latestRequest.status] : null;
  const canRequest = pet.status === "Available" && !["pending", "approved"].includes(latestRequest?.status);

  return (
    <div className="pet-page">
      <section className="pet-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Link to="/adoption" className="pet-button-secondary gap-2">
              <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
              Back to adoption
            </Link>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="pet-chip">{pet.species}</span>
              <span className="pet-chip">{pet.displayStatus}</span>
              <span className="pet-chip">{pet.location}</span>
            </div>

            <h1 className="mt-5 text-5xl font-bold leading-tight">{pet.petName}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B6B6B]">{pet.summary}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                <p className="text-sm text-[#8B7B66]">Breed</p>
                <p className="mt-1 text-lg font-semibold">{pet.breed}</p>
              </div>
              <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                <p className="text-sm text-[#8B7B66]">Age</p>
                <p className="mt-1 text-lg font-semibold">{pet.age}</p>
              </div>
              <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                <p className="text-sm text-[#8B7B66]">Gender</p>
                <p className="mt-1 text-lg font-semibold">{pet.gender}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={canRequest ? `/adoption/${pet._id}/request` : "#request-status"}
                className={`pet-button-primary gap-2 ${!canRequest ? "cursor-not-allowed opacity-70" : ""}`}
                onClick={(event) => {
                  if (!canRequest) {
                    event.preventDefault();
                    document.getElementById("request-status")?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
              >
                <HeartHandshake className="h-4 w-4" />
                {pet.status !== "Available"
                  ? "Currently unavailable"
                  : latestRequest?.status === "pending"
                    ? "Request pending"
                    : latestRequest?.status === "approved"
                      ? "Request approved"
                      : latestRequest?.status === "rejected" || latestRequest?.status === "cancelled"
                        ? "Submit a fresh request"
                        : "Start adoption request"}
              </Link>
              <div className="pet-button-secondary gap-2">
                <MapPin className="h-4 w-4 text-[#F5A623]" />
                {pet.location}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[34px] bg-[linear-gradient(145deg,#FFE6BF,#F5A623)] p-5 shadow-[0_24px_50px_rgba(245,166,35,0.18)]">
            <div className="absolute left-8 top-8 h-36 w-36 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute bottom-8 right-6 h-40 w-40 rounded-full bg-[#FFC978]/35 blur-3xl" />
            <img
              src={pet.image}
              alt={pet.petName}
              className="relative z-10 h-[420px] w-full rounded-[28px] object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="pet-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF0D6] text-[#F5A623]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="pet-chip">Temperament</span>
              <h2 className="mt-3 text-3xl font-bold">A closer feel for {pet.petName}</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">
                Personality
              </p>
              <p className="mt-3 text-lg font-bold">{pet.temperament}</p>
              <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">{pet.summary}</p>
            </div>

            <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">
                Care note
              </p>
              <p className="mt-3 text-lg font-bold">Best with a gentle transition</p>
              <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">{pet.careNote}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6">
            <span className="pet-chip">Profile Snapshot</span>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                <span className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <ShieldCheck className="h-4 w-4 text-[#F5A623]" />
                  Adoption status
                </span>
                <span className="text-sm font-semibold">{pet.displayStatus}</span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                <span className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <CalendarDays className="h-4 w-4 text-[#F5A623]" />
                  Intake date
                </span>
                <span className="text-sm font-semibold">
                  {new Date(pet.intakeDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                <span className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <PawPrint className="h-4 w-4 text-[#F5A623]" />
                  Type
                </span>
                <span className="text-sm font-semibold">{pet.species}</span>
              </div>
            </div>
          </div>

          <div
            id="request-status"
            className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              <HeartHandshake className="h-4 w-4" />
              Ready to connect
            </span>
            <h2 className="mt-4 text-3xl font-bold">
              {currentRequestMeta?.label ?? "A softer start for adoption conversations."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/75">
              {currentRequestMeta?.description ??
                "Open the request only when the home, routine, and energy match feel right. PetHub keeps the profile warm first and pushy never."}
            </p>
            {canRequest ? (
              <Link to={`/adoption/${pet._id}/request`} className="pet-button-secondary mt-5 gap-2 bg-white/92">
                <HeartHandshake className="h-4 w-4 text-[#F5A623]" />
                Continue to request form
              </Link>
            ) : (
              <div className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                {pet.status !== "Available" ? "Requests paused for this profile" : currentRequestMeta?.label}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
