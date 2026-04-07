import { useMemo, useState } from "react";
import {
  ArrowRight,
  Heart,
  HeartHandshake,
  MapPin,
  PawPrint,
  Sparkles,
  SlidersHorizontal,
  Search,
  TrendingUp,
  Clock,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAdoption } from "../apis/adoption/hooks";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { adoptionFilters, decorateAdoptionPets } from "../utils/adoptionPets";

/* ─── small reusable pieces ──────────────────────────────────────────────── */

const statusConfig = {
  pending:   { label: "Request Pending", tone: "bg-amber-50 text-amber-700 border border-amber-200" },
  approved:  { label: "Approved",        tone: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  rejected:  { label: "Request Closed",  tone: "bg-stone-100 text-stone-500 border border-stone-200" },
  cancelled: { label: "Cancelled",       tone: "bg-stone-100 text-stone-500 border border-stone-200" },
};

const FilterChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-[#F5A623] text-white shadow-[0_6px_16px_rgba(245,166,35,0.30)]"
        : "bg-white text-[#6B5C3E] border border-[#EDD9A3] hover:border-[#F5A623] hover:text-[#F5A623]"
    }`}
  >
    {label === "All" && <PawPrint className="h-3.5 w-3.5" />}
    {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, accent = "#F5A623" }) => (
  <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/70 px-4 py-3.5 min-w-[120px]">
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{ background: `${accent}22`, color: accent }}
    >
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs text-[#9A8A6A]">{label}</p>
      <p className="text-lg font-bold text-[#2D2D2D]">{value}</p>
    </div>
  </div>
);

const RequestBadge = ({ status }) => {
  const cfg = statusConfig[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.tone}`}>
      <HeartHandshake className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

/* featured mini card shown in hero right panel */
const FeaturedPetCard = ({ pet }) => (
  <Link
    to={`/dashboard/adoption/${pet._id}`}
    className="group flex items-center gap-3 overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_4px_16px_rgba(45,45,45,0.10)] transition-transform duration-300 hover:-translate-y-0.5"
  >
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(145deg,#FFE6BF,#F5A623)]">
      <img
        src={pet.image}
        alt={pet.petName}
        className="h-full w-full object-cover object-center opacity-90 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
      />
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
  </Link>
);

/* ─── main page ───────────────────────────────────────────────────────────── */
export const AdoptionGalleryPage = () => {
  const { data: adoptionResponse, isLoading } = useAdoption();
  const { data: requestsResponse } = useMyAdoptionRequests();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const adoptionRequests = requestsResponse?.data ?? [];

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

  const filteredPets = useMemo(() => {
    let list = activeFilter === "All" ? pets : pets.filter((p) => p.species === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.petName?.toLowerCase().includes(q) ||
          p.breed?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [pets, activeFilter, searchQuery]);

  const availableCount = pets.filter((p) => p.status === "Available").length;
  const medicalCount   = pets.filter((p) => p.displayStatus === "Medical Hold").length;
  const featuredPets   = useMemo(() => pets.filter((p) => p.status === "Available").slice(0, 3), [pets]);

  return (
    <div className="space-y-5 pb-10">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)]">
        <div className="grid xl:grid-cols-[1fr_360px]">

          {/* LEFT — headline + controls */}
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
                Browse profiles with care notes, temperament clues, and readiness badges —
                welcoming, never transactional.
              </p>
            </div>

            {/* stats */}
            <div className="flex flex-wrap gap-3">
              <StatCard icon={PawPrint}   label="Available now" value={availableCount} />
              <StatCard icon={Clock}      label="Medical holds" value={medicalCount}   accent="#F87171" />
              <StatCard icon={TrendingUp} label="Total listed"  value={pets.length} />
            </div>

            {/* search */}
            <div className="flex items-center gap-2 rounded-2xl bg-[#FAF6EF] px-4 py-3 ring-1 ring-[#EDD9A3] transition-all focus-within:ring-[#F5A623] max-w-md">
              <Search className="h-4 w-4 shrink-0 text-[#B78331]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, breed, or location…"
                className="flex-1 bg-transparent text-sm text-[#2D2D2D] outline-none placeholder:text-[#B0997A]"
              />
            </div>

            {/* filter chips */}
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-[#B78331]" />
              {adoptionFilters.map((f) => (
                <FilterChip key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
              ))}
            </div>
          </div>

          {/* RIGHT — featured pets panel (no carousel, always renders) */}
          <div className="hidden xl:flex flex-col justify-center gap-4 bg-[linear-gradient(145deg,#FFF8EC,#FFE9A8)] p-7">

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#F5A623]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">
                Featured companions
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {featuredPets.length > 0
                ? featuredPets.map((pet) => <FeaturedPetCard key={pet._id} pet={pet} />)
                : [0, 1, 2].map((i) => (
                    <div key={i} className="h-[88px] animate-pulse rounded-[18px] bg-white/50" />
                  ))}
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

      {/* ── RESULTS BAR ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-[#7A6A50]">
          {filteredPets.length}{" "}
          {filteredPets.length === 1 ? "companion" : "companions"} found
        </p>
        {(activeFilter !== "All" || searchQuery) && (
          <button
            type="button"
            onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
            className="text-xs font-semibold text-[#F5A623] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── PET GRID ─────────────────────────────────────────────────── */}
      {!isLoading && filteredPets.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPets.map((pet) => {
            const latestRequest = latestRequestMap[pet._id];
            const requestStatus = latestRequest?.status ?? null;

            return (
              <article
                key={pet._id}
                className="group flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_4px_18px_rgba(45,45,45,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(45,45,45,0.11)]"
              >
                {/* image */}
                <Link
                  to={`/dashboard/adoption/${pet._id}`}
                  className="relative block h-52 overflow-hidden bg-[linear-gradient(145deg,#FFE6BF,#F5A623)] sm:h-56"
                >
                  <img
                    src={pet.image}
                    alt={pet.petName}
                    className="h-full w-full object-cover object-center opacity-90 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#7A5C1E] backdrop-blur-sm">
                      {pet.displayStatus}
                    </span>
                    <span className="rounded-full bg-[#2D2D2D]/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {pet.species}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
                      <Heart className="h-4 w-4 text-[#F5A623]" />
                    </div>
                  </div>
                </Link>

                {/* body */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-[#2D2D2D]">{pet.petName}</h2>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-[#9A8A6A]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F5A623]" />
                        <span className="truncate">{pet.location}</span>
                      </div>
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

                  <p className="line-clamp-2 text-sm leading-6 text-[#7A6A50]">{pet.summary}</p>

                  <div className="mt-auto pt-1">
                    <Link
                      to={`/dashboard/adoption/${pet._id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F5A623] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.26)] transition-all hover:bg-[#e09515]"
                    >
                      {requestStatus === "pending"
                        ? "Check request"
                        : requestStatus === "approved"
                          ? "View approval"
                          : "View details"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── LOADING SKELETONS ─────────────────────────────────────────── */}
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

      {/* ── EMPTY STATE ───────────────────────────────────────────────── */}
      {!isLoading && filteredPets.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white py-16 text-center shadow-[0_4px_18px_rgba(45,45,45,0.07)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF5E0]">
            <PawPrint className="h-8 w-8 text-[#F5A623]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2D2D2D]">No pets match this filter.</h3>
            <p className="mt-2 max-w-xs text-sm text-[#7A6A50]">
              Try another filter to explore more companions waiting in the gallery.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
            className="rounded-full bg-[#F5A623] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.26)] hover:bg-[#e09515] transition-colors"
          >
            Show all pets
          </button>
        </div>
      )}
    </div>
  );
};
