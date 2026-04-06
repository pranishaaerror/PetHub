import { useMemo, useState } from "react";
import { ArrowRight, HeartHandshake, MapPin, PawPrint, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdoption } from "../apis/adoption/hooks";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { AdoptionOrbitCarousel } from "../components/AdoptionOrbitCarousel";
import { adoptionFilters, decorateAdoptionPets } from "../utils/adoptionPets";
import { Button } from "../components/Button";

export const AdoptionGalleryPage = () => {
  const { data: adoptionResponse, isLoading } = useAdoption();
  const { data: requestsResponse } = useMyAdoptionRequests();
  const [activeFilter, setActiveFilter] = useState("All");
  const adoptionRequests = requestsResponse?.data ?? [];

  const pets = useMemo(() => {
    const rawPets = adoptionResponse?.data?.pets ?? [];
    return decorateAdoptionPets(rawPets);
  }, [adoptionResponse]);

  const latestRequestMap = useMemo(() => {
    return adoptionRequests.reduce((accumulator, request) => {
      const requestPetId = typeof request.petId === "string" ? request.petId : request.petId?._id;

      if (!requestPetId || accumulator[requestPetId]) {
        return accumulator;
      }

      accumulator[requestPetId] = request;
      return accumulator;
    }, {});
  }, [adoptionRequests]);

  const filteredPets =
    activeFilter === "All" ? pets : pets.filter((pet) => pet.species === activeFilter);

  return (
    <div className="pet-page">
      <section className="pet-card overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="pet-chip">Adoption Gallery</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Meet gentle souls looking for a soft landing.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6B6B6B]">
              Browse the PetHub adoption collection with warm visuals, care notes, and readiness
              badges that feel welcoming instead of transactional.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {adoptionFilters.map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeFilter === filter
                      ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_18px_35px_rgba(245,166,35,0.22)]"
                      : "bg-[#FFE3B3] text-[#8B6428]"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>

            <div className="mt-8 rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF0D6] text-[#F5A623]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B78331]">
                    Today&apos;s highlight
                  </p>
                  <p className="mt-1 text-xl font-bold">New foster stories added</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#6B6B6B]">
                Every adoption profile includes temperament clues, recovery status, and an easy way to
                start the conversation.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Available now</p>
                  <p className="mt-1 text-2xl font-bold">
                    {pets.filter((pet) => pet.status === "Available").length || 0}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Medical holds</p>
                  <p className="mt-1 text-2xl font-bold">
                    {pets.filter((pet) => pet.displayStatus === "Medical Hold").length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AdoptionOrbitCarousel pets={filteredPets} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPets.map((pet) => {
          const latestRequest = latestRequestMap[pet._id];
          const requestStatus = latestRequest?.status ?? null;
          const requestLabel =
            requestStatus === "pending"
              ? "Request Pending"
              : requestStatus === "approved"
                ? "Approved"
                : requestStatus === "rejected"
                  ? "Request Closed"
                  : requestStatus === "cancelled"
                    ? "Cancelled"
                    : null;
          const requestTone =
            requestStatus === "approved"
              ? "bg-[#EAF7ED] text-[#3A7D45]"
              : requestStatus === "pending"
                ? "bg-[#FFF0D6] text-[#8B6428]"
                : "bg-[#F1E7D7] text-[#8B7B66]";

          return (
            <article key={pet._id} className="pet-card overflow-hidden">
            <Link
              to={`/adoption/${pet._id}`}
              className="relative block h-60 overflow-hidden rounded-t-[32px] bg-[linear-gradient(145deg,#FFE6BF,#F5A623)]"
            >
              <img
                src={pet.image}
                alt={pet.petName}
                className="h-full w-full object-cover object-center opacity-90 mix-blend-multiply"
              />
              <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
                <span className="rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-[#8B6428] shadow-[0_12px_25px_rgba(45,45,45,0.08)]">
                  {pet.displayStatus}
                </span>
                <span className="rounded-full bg-[#2D2D2D]/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {pet.species}
                </span>
              </div>
            </Link>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{pet.petName}</h2>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[#8B7B66]">
                    <MapPin className="h-4 w-4 text-[#F5A623]" />
                    {pet.location}
                  </div>
                </div>
                <PawPrint className="h-6 w-6 text-[#F5A623]" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="pet-chip">{pet.breed}</span>
                <span className="pet-chip">{pet.age}</span>
                <span className="pet-chip">{pet.gender}</span>
              </div>

              <p className="mt-5 text-sm leading-7 text-[#6B6B6B]">{pet.summary}</p>

              <div className="mt-6 flex gap-3">
                <Link to={`/adoption/${pet._id}`} className="pet-button-primary flex-1 gap-2">
                  {requestStatus === "pending"
                    ? "Check request"
                    : requestStatus === "approved"
                      ? "View approval"
                      : "View details"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {requestLabel ? (
                  <div className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${requestTone}`}>
                    <HeartHandshake className="h-4 w-4" />
                    {requestLabel}
                  </div>
                ) : (
                  <div
                    className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${
                      pet.status === "Available" ? "bg-[#FFF0D6] text-[#8B6428]" : "bg-[#F1E7D7] text-[#9A8464]"
                    }`}
                  >
                    <HeartHandshake className="h-4 w-4" />
                    {pet.status === "Available" ? "Available" : "Hold"}
                  </div>
                )}
              </div>
            </div>
          </article>
          );
        })}
      </section>

      {!isLoading && !filteredPets.length ? (
        <div className="pet-card p-8 text-center">
          <h3 className="text-2xl font-bold">No pets match this filter yet.</h3>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            Try another chip to explore more companions waiting inside the gallery.
          </p>
        </div>
      ) : null}
    </div>
  );
};
