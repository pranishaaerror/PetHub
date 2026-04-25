import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarDays,
  HeartHandshake,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Heart,
  Info,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAdoptionById } from "../apis/adoption/hooks";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { PetHubLoader } from "../components/PetHubLoader";
import { decorateAdoptionPet } from "../utils/adoptionPets";

const requestMeta = {
  pending: {
    label: "Pending review",
    icon: Clock3,
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Your adoption request is already in PetHub's review queue for this pet.",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "This adoption request has already been approved. Continue the follow-up process.",
  },
  rejected: {
    label: "Request closed",
    icon: XCircle,
    iconColor: "text-stone-400",
    bg: "bg-stone-50",
    border: "border-stone-200",
    description: "A previous request was closed. You can submit a fresh application if you'd like to try again.",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    iconColor: "text-stone-400",
    bg: "bg-stone-50",
    border: "border-stone-200",
    description: "The previous request was cancelled. You can reopen the conversation with a new request.",
  },
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(45,45,45,0.05)]">
    <span className="flex items-center gap-2 text-sm text-[#7A6A50]">
      <Icon className="h-4 w-4 text-[#F5A623]" />
      {label}
    </span>
    <span className="text-sm font-semibold text-[#2D2D2D]">{value}</span>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl bg-white px-4 py-4 shadow-[0_2px_10px_rgba(45,45,45,0.05)]">
    <p className="text-xs text-[#9A8A6A]">{label}</p>
    <p className="mt-1 text-lg font-bold text-[#2D2D2D]">{value}</p>
  </div>
);

export const AdoptionPetDetailPage = () => {
  const { petId } = useParams();
  const { data: response, isLoading } = useAdoptionById(petId);
  const { data: requestsResponse } = useMyAdoptionRequests();
  const pet = decorateAdoptionPet(response?.data?.pet);
  const requests = requestsResponse?.data ?? [];

  const latestRequest = useMemo(() => {
    return (
      requests.find((req) => {
        const id = typeof req.petId === "string" ? req.petId : req.petId?._id;
        return id === petId;
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
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white py-16 text-center shadow-[0_4px_20px_rgba(45,45,45,0.07)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5E0]">
          <PawPrint className="h-8 w-8 text-[#F5A623]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Pet not found.</h1>
          <p className="mt-2 text-sm text-[#7A6A50]">This adoption profile is unavailable right now.</p>
        </div>
        <Link
          to="/dashboard/adoption"
          className="inline-flex items-center gap-2 rounded-full bg-[#F5A623] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:bg-[#e09515]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to gallery
        </Link>
      </div>
    );
  }

  const currentMeta = latestRequest ? requestMeta[latestRequest.status] : null;
  const canRequest =
    pet.status === "Available" && !["pending", "approved"].includes(latestRequest?.status);

  const ctaLabel =
    pet.status !== "Available"
      ? "Currently unavailable"
      : latestRequest?.status === "pending"
        ? "Request pending"
        : latestRequest?.status === "approved"
          ? "Request approved"
          : latestRequest?.status === "rejected" || latestRequest?.status === "cancelled"
            ? "Submit a fresh request"
            : "Start adoption request";

  return (
    <div className="space-y-5 pb-10">

      {/* ── Back nav ─────────────────────────────────────────────── */}
      <div className="px-1">
        <Link
          to="/dashboard/adoption"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#6B5C3E] shadow-[0_2px_10px_rgba(45,45,45,0.07)] hover:text-[#F5A623] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
          Back to adoption gallery
        </Link>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_32px_rgba(45,45,45,0.08)]">
        <div className="grid gap-0 xl:grid-cols-[1fr_420px]">

          {/* Left — info */}
          <div className="flex flex-col justify-center gap-5 p-6 md:p-10">

            {/* Species + status tags */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E0] px-3 py-1 text-xs font-semibold text-[#8B6428]">
                <PawPrint className="h-3.5 w-3.5" /> {pet.species}
              </span>
              <span className="rounded-full bg-[#FFF5E0] px-3 py-1 text-xs font-semibold text-[#8B6428]">
                {pet.displayStatus}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF5E0] px-3 py-1 text-xs font-semibold text-[#8B6428]">
                <MapPin className="h-3.5 w-3.5 text-[#F5A623]" /> {pet.location}
              </span>
            </div>

            <div>
              <h1 className="text-4xl font-bold leading-tight text-[#2D2D2D] sm:text-5xl">
                {pet.petName}
              </h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-[#7A6A50]">{pet.summary}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Breed"  value={pet.breed} />
              <StatCard label="Age"    value={pet.age} />
              <StatCard label="Gender" value={pet.gender} />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={canRequest ? `/dashboard/adoption/${pet._id}/request` : "#request-status"}
                onClick={(e) => {
                  if (!canRequest) {
                    e.preventDefault();
                    document.getElementById("request-status")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                  canRequest
                    ? "bg-[#F5A623] text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:bg-[#e09515] hover:shadow-[0_8px_22px_rgba(245,166,35,0.36)]"
                    : "cursor-not-allowed bg-[#F0E6D3] text-[#9A8A6A]"
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                {ctaLabel}
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#EDD9A3] bg-white px-5 py-3 text-sm font-semibold text-[#6B5C3E]">
                <MapPin className="h-4 w-4 text-[#F5A623]" />
                {pet.location}
              </div>
            </div>
          </div>

          {/* Right — photo */}
          <div className="relative min-h-[280px] overflow-hidden bg-[linear-gradient(145deg,#FFE6BF,#F5A623)] xl:min-h-[440px]">
            <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-6 right-6 h-36 w-36 rounded-full bg-[#FFC978]/30 blur-3xl" />
            <img
              src={pet.image}
              alt={pet.petName}
              className="relative z-10 h-full w-full object-cover object-center"
            />
            {/* Heart overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 backdrop-blur-sm">
              <Heart className="h-4 w-4 text-[#F5A623]" />
              <span className="text-xs font-semibold text-[#6B5C3E]">Waiting for a home</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
