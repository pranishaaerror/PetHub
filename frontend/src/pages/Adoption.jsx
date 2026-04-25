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
} from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysInShelter = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const STATUS_CONFIG = {
  available: { label: 'Available', bg: '#E8F5E9', color: '#2E7D32', dot: '#43A047' },
  pending:   { label: 'Pending',   bg: '#FFF3E0', color: '#E65100', dot: '#FB8C00' },
  adopted:   { label: 'Adopted',   bg: '#EDE7F6', color: '#4527A0', dot: '#7B68EE' },
};

const getStatus = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] ?? { label: status, bg: '#F5F5F5', color: '#616161', dot: '#9E9E9E' };

const SPECIES_EMOJI = { dog: '🐶', cat: '🐱', rabbit: '🐰', bird: '🐦', hamster: '🐹' };
const getEmoji = (breed = '') => {
  const lower = breed.toLowerCase();
  for (const [key, emoji] of Object.entries(SPECIES_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return '🐾';
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
  const filtered = pets;

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
    >
      <style>{`
        .adopt-serif { font-family: inherit; }
        .pet-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .pet-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .filter-pill {
          padding: 7px 18px; border-radius: 100px; font-size: 13px; font-weight: 600;
          border: 1.5px solid transparent; cursor: pointer; transition: all 0.18s;
          background: #fff; color: #6B6B6B; border-color: rgba(0,0,0,0.1);
        }
        .filter-pill.active { background: #1A1A1A; color: #fff; border-color: #1A1A1A; }
        .filter-pill:hover:not(.active) { border-color: #F5A623; color: #F5A623; }
        .adopt-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg,#F5A623,#FFB347);
          color: #fff; font-size: 13px; font-weight: 700;
          padding: 10px 18px; border-radius: 14px; border: none; cursor: pointer;
          text-decoration: none; transition: opacity 0.18s, transform 0.15s;
          box-shadow: 0 8px 20px rgba(245,166,35,0.28);
        }
        .adopt-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .skeleton { background: linear-gradient(90deg,#f0ebe3 25%,#faf6f0 50%,#f0ebe3 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0D6] px-3 py-1 text-[11px] font-700 uppercase tracking-widest text-[#B78331]">
              <HeartHandshake className="h-3.5 w-3.5" />
              Adoption Center
            </div>
            <h1 className="adopt-serif mt-3 text-3xl font-700 leading-tight sm:text-4xl">
              Find your forever friend.
            </h1>
            <p className="mt-2 text-sm text-[#6B6B6B]">
              Every pet here is shelter-verified and ready for a loving home.
            </p>
          </div>

          {!isLoading && !isError && (
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-black/5">
              <div className="text-center px-3">
                <p className="adopt-serif text-2xl font-700 text-[#1A1A1A]">{pets.length}</p>
                <p className="text-[10px] font-600 uppercase tracking-widest text-[#9B9B9B]">Total</p>
              </div>
              <div className="w-px h-8 bg-black/8" />
              <div className="text-center px-3">
                <p className="adopt-serif text-2xl font-700 text-[#43A047]">
                  {pets.filter(p => p.status?.toLowerCase() === 'available').length}
                </p>
                <p className="text-[10px] font-600 uppercase tracking-widest text-[#9B9B9B]">Available</p>
              </div>
              <div className="w-px h-8 bg-black/8" />
              <div className="text-center px-3">
                <p className="adopt-serif text-2xl font-700 text-[#FB8C00]">
                  {pets.filter(p => p.status?.toLowerCase() === 'pending').length}
                </p>
                <p className="text-[10px] font-600 uppercase tracking-widest text-[#9B9B9B]">Pending</p>
              </div>
            </div>
          )}
        </div>

        {/* ── LOADING ── */}
        {isLoading && (
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
        )}

        {/* ── ERROR ── */}
        {isError && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] bg-white py-20 border border-black/5 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0D6] text-3xl">😿</div>
            <p className="text-base font-600 text-[#1A1A1A]">Couldn't load pets right now</p>
            <p className="text-sm text-[#9B9B9B]">Please try refreshing the page.</p>
          </div>
        )}

        {/* ── CARDS ── */}
        {!isLoading && !isError && (
          <>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] bg-white py-20 border border-black/5 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0D6] text-3xl">🔍</div>
                <p className="text-base font-600 text-[#1A1A1A]">No pets found</p>
                <p className="text-sm text-[#9B9B9B]">Try adjusting your search or filter.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((pet, i) => {
                  const palette = PASTEL_PAIRS[i % PASTEL_PAIRS.length];
                  const status = getStatus(pet.status);
                  const days = pet.intakeDate ? daysInShelter(pet.intakeDate) : null;
                  const emoji = getEmoji(pet.breed);
                  const isAvailable = pet.status?.toLowerCase() === 'available';

                  return (
                    <div key={pet._id} className="pet-card flex flex-col">

                      {/* Avatar / Hero */}
                      <div
                        className="relative flex items-center justify-center"
                        style={{ background: palette.bg, height: '160px' }}
                      >
                        <span style={{ fontSize: '72px', lineHeight: 1 }}>{emoji}</span>

                        {/* Status badge */}
                        <div
                          className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-700 uppercase tracking-wider"
                          style={{ background: status.bg, color: status.color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
                          {status.label}
                        </div>

                        {/* Days in shelter */}
                        {days !== null && (
                          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-600 text-[#6B6B6B]">
                            <Calendar className="h-3 w-3" />
                            {days}d
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h2 className="adopt-serif text-xl font-700 text-[#1A1A1A] leading-tight">
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

                        {/* Meta pills */}
                        <div className="flex flex-wrap gap-2">
                          {pet.age && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-600 text-[#5B4A36]">
                              <PawPrint className="h-3 w-3" style={{ color: palette.accent }} />
                              {pet.age}
                            </span>
                          )}
                          {pet.gender && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-600 text-[#5B4A36]">
                              {pet.gender?.toLowerCase() === 'female'
                                ? <Venus className="h-3 w-3 text-[#E91E8C]" />
                                : <Mars className="h-3 w-3 text-[#1E88E5]" />}
                              {pet.gender}
                            </span>
                          )}
                          {pet.intakeDate && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F3ED] px-3 py-1 text-xs font-600 text-[#5B4A36]">
                              <MapPin className="h-3 w-3 text-[#F5A623]" />
                              Since {formatDate(pet.intakeDate)}
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="mt-auto pt-1">
                          {isAvailable ? (
                            <Link
                              to={`/dashboard/adoption/${pet._id}`}
                              className="adopt-btn w-full justify-center"
                              style={{ display: 'flex' }}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Adopt {pet.petName}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <Link
                              to={`/dashboard/adoption/${pet._id}`}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '6px', background: '#F7F3ED', color: '#6B6B6B',
                                fontSize: '13px', fontWeight: '700', padding: '10px 18px',
                                borderRadius: '14px', textDecoration: 'none',
                                transition: 'background 0.15s',
                              }}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};
