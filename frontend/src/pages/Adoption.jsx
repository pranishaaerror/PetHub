import { useAdoption } from '../apis/adoption/hooks';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  MapPin,
  Calendar,
  Venus,
  Mars,
  Sparkles,
  ArrowUpRight,
  PawPrint,
  MoreHorizontal,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Squirrel,
  Search,
  ServerCrash,
} from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const daysInShelter = (dateString) => {
  const intake = new Date(dateString).getTime();
  const today = Date.now();
  const diff = today - intake;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
};

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    bg: '#E8F5E9',
    color: '#2E7D32',
    dot: '#43A047',
  },
  pending: {
    label: 'Pending',
    bg: '#FFF3E0',
    color: '#E65100',
    dot: '#FB8C00',
  },
  adopted: {
    label: 'Adopted',
    bg: '#EDE7F6',
    color: '#4527A0',
    dot: '#7B68EE',
  },
};

const getStatus = (status) => {
  const key = status?.toLowerCase();
  return STATUS_CONFIG[key] ?? {
    label: status,
    bg: '#F5F5F5',
    color: '#616161',
    dot: '#9E9E9E',
  };
};

const getSpeciesIcon = (breed, accentColor) => {
  const lower = breed.toLowerCase();

  const iconStyle = {
    color: accentColor,
    opacity: 0.7,
  };

  if (lower.includes('dog')) {
    return <Dog className="h-16 w-16" style={iconStyle} />;
  }

  if (lower.includes('cat')) {
    return <Cat className="h-16 w-16" style={iconStyle} />;
  }

  if (lower.includes('rabbit')) {
    return <Rabbit className="h-16 w-16" style={iconStyle} />;
  }

  if (lower.includes('bird')) {
    return <Bird className="h-16 w-16" style={iconStyle} />;
  }

  if (lower.includes('hamster')) {
    return <Squirrel className="h-16 w-16" style={iconStyle} />;
  }

  return <PawPrint className="h-16 w-16" style={iconStyle} />;
};

const PASTEL_PAIRS = [
  { bg: '#FFF0D6', accent: '#F5A623' },
  { bg: '#E8F5E9', accent: '#43A047' },
  { bg: '#EDE7F6', accent: '#7B68EE' },
  { bg: '#FCE4EC', accent: '#E91E8C' },
  { bg: '#E3F2FD', accent: '#1E88E5' },
  { bg: '#F3E5F5', accent: '#8E24AA' },
];

export const Adoption = () => {
  const { data, isLoading, isError } = useAdoption();

  const pets = data?.data?.pets ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="pet-card">
                <div className="skeleton h-44 w-full" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 w-2/3 rounded-lg" />
                  <div className="skeleton h-4 w-1/2 rounded-lg" />
                  <div className="skeleton h-8 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] bg-white py-20 border border-black/5 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0D6]">
              <ServerCrash className="h-8 w-8 text-[#F5A623]" />
            </div>
            <p className="text-base font-semibold text-[#1A1A1A]">
              Couldn't load pets right now
            </p>
            <p className="text-sm text-[#9B9B9B]">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] bg-white py-20 border border-black/5 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0D6]">
              <Search className="h-8 w-8 text-[#F5A623]" />
            </div>
            <p className="text-base font-semibold text-[#1A1A1A]">
              No pets found
            </p>
            <p className="text-sm text-[#9B9B9B]">
              Try adjusting your search or filter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableCount = pets.filter(
    (p) => p.status?.toLowerCase() === 'available'
  ).length;

  const pendingCount = pets.filter(
    (p) => p.status?.toLowerCase() === 'pending'
  ).length;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0D6] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#B78331]">
              <HeartHandshake className="h-3.5 w-3.5" />
              Adoption Center
            </div>

            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Find your forever friend.
            </h1>

            <p className="mt-2 text-sm text-[#6B6B6B]">
              Every pet here is shelter-verified and ready for a loving home.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/5">
            <div className="text-center px-3">
              <p className="text-2xl font-bold text-[#1A1A1A]">{pets.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9B9B9B]">
                Total
              </p>
            </div>

            <div className="w-px h-8 bg-gray-200" />

            <div className="text-center px-3">
              <p className="text-2xl font-bold text-[#43A047]">{availableCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9B9B9B]">
                Available
              </p>
            </div>

            <div className="w-px h-8 bg-gray-200" />

            <div className="text-center px-3">
              <p className="text-2xl font-bold text-[#FB8C00]">{pendingCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9B9B9B]">
                Pending
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet, i) => {
            const palette = PASTEL_PAIRS[i % PASTEL_PAIRS.length];
            const status = getStatus(pet.status);
            const days = pet.intakeDate ? daysInShelter(pet.intakeDate) : null;
            const isAvailable = pet.status?.toLowerCase() === 'available';

            return (
              <div
                key={pet._id}
                className="flex flex-col rounded-[24px] border border-black/[0.06] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{ background: palette.bg, height: '160px' }}
                >
                  {getSpeciesIcon(pet.breed, palette.accent)}

                  <div
                    className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: status.bg, color: status.color }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: status.dot }}
                    />
                    {status.label}
                  </div>

                  {days !== null && (
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-[#6B6B6B]">
                      <Calendar className="h-3 w-3" />
                      {days}d
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl font-bold text-[#1A1A1A] leading-tight">
                        {pet.petName}
                      </h2>
                      <button
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F3ED] text-[#9B9B9B] hover:bg-[#EDE6D8] transition-colors"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-[#6B6B6B]">{pet.breed}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {pet.age && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-semibold text-[#5B4A36]">
                        <PawPrint
                          className="h-3 w-3"
                          style={{ color: palette.accent }}
                        />
                        {pet.age}
                      </span>
                    )}

                    {pet.gender && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-semibold text-[#5B4A36]">
                        {pet.gender?.toLowerCase() === 'female' ? (
                          <Venus className="h-3 w-3 text-[#E91E8C]" />
                        ) : (
                          <Mars className="h-3 w-3 text-[#1E88E5]" />
                        )}
                        {pet.gender}
                      </span>
                    )}

                    {pet.intakeDate && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-semibold text-[#5B4A36]">
                        <MapPin className="h-3 w-3 text-[#F5A623]" />
                        Since {formatDate(pet.intakeDate)}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-1">
                    {isAvailable ? (
                      <Link
                        to={`/dashboard/adoption/${pet._id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-br from-[#F5A623] to-[#FFB347] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] transition-all hover:opacity-90 hover:-translate-y-px"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Adopt {pet.petName}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        to={`/dashboard/adoption/${pet._id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-[14px] bg-[#F7F3ED] px-4 py-2.5 text-sm font-bold text-[#6B6B6B] transition-colors hover:bg-[#EDE6D8]"
                      >
                        View details
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};