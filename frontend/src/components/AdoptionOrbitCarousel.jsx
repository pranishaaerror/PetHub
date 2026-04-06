import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, PawPrint } from "lucide-react";

const PetShowcaseImage = ({ src, alt, imageClassName, wrapperClassName }) => {
  const [hasError, setHasError] = useState(false);
  const shouldShowImage = Boolean(src) && !hasError;

  return (
    <div className={wrapperClassName}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] text-white/90">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <PawPrint className="h-7 w-7" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              PetHub Pet
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdoptionOrbitCarousel = ({
  pets,
  title = "Tap a pet card to open its full profile.",
  description = "A clean box layout keeps the adoption section easy to browse and quick to open.",
  chipLabel = "Pet Showcase",
  emptyHeading = "No pets are in this showcase right now.",
  emptyDescription = "Switch filters or add adoption profiles to fill the gallery cards.",
  getLink = (pet) => `/adoption/${pet._id}`,
}) => {
  const carouselPets = pets.slice(0, 10);
  const quantity = carouselPets.length;
  const featuredPet = carouselPets[0];
  const secondaryPets = carouselPets.slice(1, 5);

  if (!quantity) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6 text-center shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#FFF0D6] text-[#F5A623]">
            <PawPrint className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-2xl font-bold">{emptyHeading}</h3>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="pet-chip">{chipLabel}</span>
          <h2 className="mt-4 text-2xl font-bold">{title}</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF0D6] text-[#F5A623]">
          <HeartHandshake className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <Link
          to={getLink(featuredPet)}
          className="group relative block self-start overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#FFE4B8,#F5A623)] p-5 shadow-[0_20px_45px_rgba(245,166,35,0.16)] transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-white/25 blur-3xl" />
          <div className="absolute bottom-4 right-4 h-36 w-36 rounded-full bg-[#FFC978]/35 blur-3xl" />
          <div className="relative z-10 grid gap-4 md:grid-cols-[0.88fr_1.12fr] md:items-stretch">
            <div className="flex flex-col">
              <div className="rounded-[24px] bg-white/88 p-5 shadow-[0_16px_30px_rgba(45,45,45,0.08)] backdrop-blur-sm">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6A4312]"
                  style={{ backgroundColor: `rgba(${featuredPet.accent},0.92)` }}
                >
                  {featuredPet.species}
                </span>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-[#2D2D2D]">{featuredPet.petName}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6428]">
                      {featuredPet.displayStatus}
                    </p>
                  </div>
                  <HeartHandshake className="h-5 w-5 text-[#F5A623]" />
                </div>
                <p className="mt-4 text-sm leading-8 text-[#6B6B6B]">{featuredPet.summary}</p>
                <div className="mt-5 inline-flex rounded-full bg-[#FFF3DF] px-4 py-2 text-sm font-semibold text-[#8B6428] shadow-[0_10px_20px_rgba(45,45,45,0.04)]">
                  Open {featuredPet.petName}&apos;s profile
                </div>
              </div>
            </div>

            <PetShowcaseImage
              src={featuredPet.image}
              alt={featuredPet.petName}
              wrapperClassName="relative min-h-[260px] overflow-hidden rounded-[26px] bg-white/14 p-3 shadow-[0_18px_32px_rgba(45,45,45,0.08)] backdrop-blur-sm md:h-full md:min-h-[320px]"
              imageClassName="h-full w-full rounded-[22px] object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </Link>

        <div className="grid self-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {(secondaryPets.length ? secondaryPets : [featuredPet]).map((pet, index) => (
            <Link
              key={pet._id}
              to={getLink(pet)}
              className="group relative overflow-hidden rounded-[26px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(45,45,45,0.08)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <PetShowcaseImage
                  src={pet.image}
                  alt={pet.petName}
                  wrapperClassName="relative h-28 w-24 shrink-0 overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#FFE6BF,#F5A623)]"
                  imageClassName="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6A4312]"
                    style={{ backgroundColor: `rgba(${pet.accent},0.92)` }}
                  >
                    {pet.species}
                  </span>
                  <p className="mt-3 text-xl font-bold">{pet.petName}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6428]">
                    {pet.displayStatus}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#6B6B6B]">{pet.summary}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-[18px] bg-white px-3 py-3 shadow-[0_12px_24px_rgba(45,45,45,0.04)]">
                <p className="text-sm font-semibold text-[#2D2D2D]">Open profile</p>
                <HeartHandshake className="h-4 w-4 text-[#F5A623]" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#6B6B6B]">
        {description}
      </p>
    </div>
  );
};
