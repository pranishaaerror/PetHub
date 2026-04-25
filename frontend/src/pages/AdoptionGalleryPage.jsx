import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  HeartHandshake,
  MapPin,
  PawPrint,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  XCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAdoption } from "../apis/adoption/hooks";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { decorateAdoptionPets } from "../utils/adoptionPets";

/* ─── status configs ─────────────────────────────────────────────────────── */
const requestStatusConfig = {
  pending:   { label: "Request Pending", tone: "bg-amber-50 text-amber-700 border border-amber-200" },
  approved:  { label: "Approved",        tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:  { label: "Request Closed",  tone: "bg-stone-100 text-stone-500 border border-stone-200" },
  cancelled: { label: "Cancelled",       tone: "bg-stone-100 text-stone-500 border border-stone-200" },
};

const requestMeta = {
  pending:   { icon: Clock3,       iconColor: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-200"   },
  approved:  { icon: CheckCircle2, iconColor: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  rejected:  { icon: XCircle,      iconColor: "text-stone-400",   bg: "bg-stone-50",   border: "border-stone-200"   },
  cancelled: { icon: XCircle,      iconColor: "text-stone-400",   bg: "bg-stone-50",   border: "border-stone-200"   },
};

/* ─── small pieces ───────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent = "#F5A623" }) => (
  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/70 px-4 py-3.5 min-w-[120px]">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${accent}22`, color: accent }}>
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs text-[#9A8A6A]">{label}</p>
      <p className="text-lg font-bold text-[#2D2D2D]">{value}</p>
    </div>
  </div>
);

const RequestBadge = ({ status }) => {
  const cfg = requestStatusConfig[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.tone}`}>
      <HeartHandshake className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const FeaturedPetCard = ({ pet, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(pet)}
    className="group flex items-center gap-3 overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_4px_16px_rgba(45,45,45,0.10)] transition-transform duration-300 hover:-translate-y-0.5 text-left w-full"
  >
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#F5F0E8]">
      {pet.image ? (
        <img src={pet.image} alt={pet.petName} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <PawPrint className="h-7 w-7 text-[#D4B896]" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="truncate font-bold text-[#2D2D2D]">{pet.petName}</p>
      <div className="mt-0.5 flex items-center gap-1 text-xs text-[#9A8A6A]">
        <MapPin className="h-3 w-3 shrink-0 text-[#F5A623]" />
        <span className="truncate">{pet.location}</span>
      </div>
      <span className="mt-1.5 inline-block rounded-full bg-[#FFF5E0] px-2 py-0.5 text-[11px] font-semibold text-[#8B6428]">
        {pet.species} · {pet.displayStatus}
      </span>
    </div>
    <Heart className="h-4 w-4 shrink-0 text-[#F5A623]" />
  </button>
);

/* ─── Pet detail popup ───────────────────────────────────────────────────── */
function PetDetailModal({ pet, requestStatus, onClose }) {
  const meta = requestStatus ? requestMeta[requestStatus] : null;
  const canRequest = pet.status === "Available" && !["pending", "approved"].includes(requestStatus);

  const ctaLabel =
    pet.status !== "Available"
      ? "Currently unavailable"
      : requestStatus === "pending"
        ? "Request pending"
        : requestStatus === "approved"
          ? "Request approved"
          : requestStatus === "rejected" || requestStatus === "cancelled"
            ? "Submit a fresh request"
            : "Start adoption request";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-[0_24px_70px_rgba(45,45,45,0.18)]">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl bg-[#F5F0E8] sm:h-64">
          {pet.image ? (
            <img src={pet.image} alt={pet.petName} className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PawPrint className="h-20 w-20 text-[#D4B896]" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-1.5 backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5 text-[#F5A623]" />
            <span className="text-xs font-semibold text-[#6B5C3E]">Waiting for a home</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Name + location */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold text-[#2D2D2D]">{pet.petName}</h2>
              {pet.location && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#9A8A6A]">
                  <MapPin className="h-3.5 w-3.5 text-[#F5A623]" />
                  {pet.location}
                </div>
              )}
            </div>
            {requestStatus && <RequestBadge status={requestStatus} />}
          </div>

          {/* Tags */}
          {[pet.breed, pet.age, pet.gender, pet.size].filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {[pet.breed, pet.age, pet.gender, pet.size].filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full bg-[#FFF5E0] px-3 py-1 text-xs font-semibold text-[#8B6428]">
                  {tag}
                </span>
              ))}
              {pet.vaccinated && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ✓ Vaccinated
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {pet.summary && (
            <p className="text-sm leading-7 text-[#7A6A50]">{pet.summary}</p>
          )}

          {/* Health status */}
          {pet.healthStatus && (
            <div className="rounded-2xl bg-[#FFF8EE] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B78331]">Health</p>
              <p className="mt-1 text-sm font-semibold text-[#2D2D2D]">{pet.healthStatus}</p>
            </div>
          )}

          {/* Request status badge */}
          {meta && (
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${meta.bg} ${meta.border}`}>
              <meta.icon className={`h-5 w-5 ${meta.iconColor}`} />
              <span className="text-sm font-semibold text-[#2D2D2D]">{requestStatusConfig[requestStatus]?.label}</span>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-1">
            {canRequest ? (
              <Link
                to={`/dashboard/adoption/${pet._id}/request`}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F5A623] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(245,166,35,0.28)] hover:bg-[#e09515] transition-colors"
              >
                <HeartHandshake className="h-4 w-4" />
                {ctaLabel}
              </Link>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F0E6D3] px-6 py-3 text-sm font-semibold text-[#9A8A6A]">
                {ctaLabel}
              </div>
            )}
            <button
              onClick={onClose}
              className="rounded-full border border-[#EDD9A3] bg-white px-5 py-3 text-sm font-semibold text-[#6B5C3E] hover:bg-[#FFF8EE] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export const AdoptionGalleryPage = () => {
  const { data: adoptionResponse, isLoading } = useAdoption();
  const { data: requestsResponse } = useMyAdoptionRequests();
  const adoptionRequests = requestsResponse?.data ?? [];
  const [selectedPet, setSelectedPet] = useState(null);

  const pets = useMemo(() => {
    const rawPets = adoptionResponse?.data?.pets ?? [];
    return decorateAdoptionPets(rawPets);
  }, [adoptionResponse]);

  const latestRequestMap = useMemo(() => {
    return adoptionRequests.reduce((acc, req) => {
      const id = typeof req.petId === "string" ? req.petId : req.petId?._id;
      if (!id || acc[id]) return acc;
      acc[id] = req;
      return acc;
    }, {});
  }, [adoptionRequests]);

  const availableCount = pets.filter((p) => p.status === "Available").length;
  const medicalCount   = pets.filter((p) => p.displayStatus === "Medical Hold").length;
  const featuredPets   = useMemo(() => pets.filter((p) => p.status === "Available").slice(0, 3), [pets]);

  return (
    <div className="space-y-5 pb-10">

      {/* ── POPUP ── */}
      {selectedPet && (
        <PetDetailModal
          pet={selectedPet}
          requestStatus={latestRequestMap[selectedPet._id]?.status ?? null}
          onClose={() => setSelectedPet(null)}
        />
      )}

      {/* ── HERO ── */}
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)]">
        <div className="grid xl:grid-cols-[1fr_360px]">
          <div className="flex flex-col justify-center gap-5 p-6 md:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF5E0] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#B78331]">
              <Sparkles className="h-3.5 w-3.5" />
              Adoption Gallery
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-snug text-[#2D2D2D] sm:text-4xl">
                Meet gentle souls looking<br className="hidden sm:block" /> for a soft landing.
              </h1>
              <p className="mt-3 max-w-md text-base leading-7 text-[#7A6A50]">
                Browse profiles with care notes, temperament clues, and readiness badges — welcoming, never transactional.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <StatCard icon={PawPrint}   label="Available now" value={availableCount} />
              <StatCard icon={Clock}      label="Medical holds" value={medicalCount} accent="#F87171" />
              <StatCard icon={TrendingUp} label="Total listed"  value={pets.length} />
            </div>
          </div>

          <div className="hidden xl:flex flex-col justify-center gap-4 bg-[linear-gradient(145deg,#FFF8EC,#FFE9A8)] p-7">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#F5A623]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">Featured companions</p>
            </div>
            <div className="flex flex-col gap-3">
              {featuredPets.length > 0
                ? featuredPets.map((pet) => <FeaturedPetCard key={pet._id} pet={pet} onClick={setSelectedPet} />)
                : [0, 1, 2].map((i) => <div key={i} className="h-[88px] animate-pulse rounded-[18px] bg-white/50" />)}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 mt-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5A623]/20 text-[#F5A623]">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D2D2D]">PetHub community</p>
                <p className="text-[11px] text-[#9A8A6A]">Warm, caring, and always growing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-[#7A6A50]">
          {pets.length} {pets.length === 1 ? "companion" : "companions"} found
        </p>
      </div>

      {/* ── PET GRID ── */}
      {!isLoading && pets.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {pets.map((pet) => {
            const latestRequest = latestRequestMap[pet._id];
            const requestStatus = latestRequest?.status ?? null;

            return (
              <article
                key={pet._id}
                className="group flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_4px_18px_rgba(45,45,45,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(45,45,45,0.11)]"
              >
                {/* image */}
                <button
                  type="button"
                  onClick={() => setSelectedPet(pet)}
                  className="relative block h-52 overflow-hidden bg-[#F5F0E8] sm:h-56 w-full"
                >
                  {pet.image ? (
                    <img
                      src={pet.image}
                      alt={pet.petName}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <PawPrint className="h-16 w-16 text-[#D4B896]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute bottom-3 right-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
                      <Heart className="h-4 w-4 text-[#F5A623]" />
                    </div>
                  </div>
                </button>

                {/* body */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-[#2D2D2D]">{pet.petName}</h2>
                      {pet.location && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-[#9A8A6A]">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F5A623]" />
                          <span className="truncate">{pet.location}</span>
                        </div>
                      )}
                    </div>
                    {requestStatus && <RequestBadge status={requestStatus} />}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[pet.breed, pet.age, pet.gender].filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#FFF5E0] px-3 py-1 text-xs font-semibold text-[#8B6428]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {pet.summary && (
                    <p className="line-clamp-2 text-sm leading-6 text-[#7A6A50]">{pet.summary}</p>
                  )}

                  <div className="mt-auto pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPet(pet)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F5A623] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.26)] transition-all hover:bg-[#e09515]"
                    >
                      {requestStatus === "pending"
                        ? "Check request"
                        : requestStatus === "approved"
                          ? "View approval"
                          : "View details"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── LOADING ── */}
      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[24px] bg-white shadow-[0_4px_18px_rgba(45,45,45,0.07)]">
              <div className="h-52 animate-pulse bg-[#F0E6D3] sm:h-56" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-[#F0E6D3]" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#F0E6D3]" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-[#F0E6D3]" />
                  <div className="h-6 w-12 animate-pulse rounded-full bg-[#F0E6D3]" />
                </div>
                <div className="h-10 animate-pulse rounded-full bg-[#F0E6D3]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY ── */}
      {!isLoading && pets.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white py-16 text-center shadow-[0_4px_18px_rgba(45,45,45,0.07)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5E0]">
            <PawPrint className="h-8 w-8 text-[#F5A623]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2D2D2D]">No pets listed yet.</h3>
            <p className="mt-2 max-w-xs text-sm text-[#7A6A50]">Check back soon — new companions are added regularly.</p>
          </div>
        </div>
      )}
    </div>
  );
};
