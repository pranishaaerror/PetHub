import {
  ArrowUpRight,
  Bell,
  CalendarHeart,
  HeartPulse,
  PawPrint,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/EmptyState";
import { useAdoption } from "../apis/adoption/hooks";
import { useMyBookings } from "../apis/bookings/hooks";
import { useCommunityMeetups } from "../apis/community/hooks";
import { useNotifications } from "../apis/notifications/hooks";
import { useMyPets } from "../apis/pets/hooks";
import { useRecordsByPet } from "../apis/records/hooks";
import { useServices } from "../apis/services/hooks";
import { useCurrentUser } from "../apis/users/hooks";

const quickActions = [
  {
    title: "Book a premium visit",
    description: "Reserve vet, vaccination, grooming, or dental care in a few taps.",
    icon: CalendarHeart,
    url: "/services",
    accent: "#F5A623",
  },
  {
    title: "Open medical records",
    description: "Review vaccinations, lab notes, and the care timeline for your pet.",
    icon: Stethoscope,
    url: "/medical-records",
    accent: "#4CAF91",
  },
  {
    title: "Browse adoption stories",
    description: "Explore new gentle companions and keep favorite profiles close.",
    icon: HeartPulse,
    url: "/dashboard/adoption",
    accent: "#E87B6A",
  },
  {
    title: "Join the community",
    description: "See meetups, playdates, and soft introductions for pet parents nearby.",
    icon: UsersRound,
    url: "/dashboard/community",
    accent: "#7B68EE",
  },
];

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const typeColors = {
  vaccination: { bg: "#E8F5E9", text: "#2E7D32" },
  lab: { bg: "#E3F2FD", text: "#1565C0" },
  prescription: { bg: "#FFF3E0", text: "#E65100" },
  default: { bg: "#F3E5F5", text: "#6A1B9A" },
};

export const DashboardPage = () => {
  const { userProfile } = useAuth();
  const { data: userResponse } = useCurrentUser();

  if (userProfile?.role === "veterinarian") {
    return <Navigate to="/vet" replace />;
  }

  if (userProfile?.role === "groomer") {
    return <Navigate to="/groomer" replace />;
  }

  const { data: petsResponse } = useMyPets();
  const { data: bookingsResponse } = useMyBookings();
  const { data: servicesResponse } = useServices();
  const { data: adoptionResponse } = useAdoption();
  const { data: notificationsResponse } = useNotifications();
  const { data: meetupsResponse } = useCommunityMeetups({ approvedOnly: true });

  const user = userResponse?.data;
  const primaryPet = petsResponse?.data?.primaryPet ?? null;
  const bookings = bookingsResponse?.data ?? [];
  const recordsQuery = useRecordsByPet(primaryPet?._id);
  const records = recordsQuery.data?.data ?? [];
  const services = servicesResponse?.data ?? [];
  const adoptionPets = (adoptionResponse?.data?.pets ?? []).filter((p) => p.status === "Available");
  const notifications = notificationsResponse?.data ?? [];
  const meetups = meetupsResponse?.data ?? [];

  const greetingName =
    user?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "Pet Parent";

  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const upcomingBooking =
    bookings.find(
      (item) => new Date(item.appointmentTime) > new Date() && item.status !== "cancelled"
    ) ?? null;
  const latestVaccinationRecord =
    records.find((item) => item.type === "vaccination" && item.nextDueDate) ??
    records.find((item) => item.type === "vaccination") ??
    null;
  const recentRecords = records.slice(0, 3);
  const featuredMeetup = meetups[0] ?? null;

  const snapshotCards = [
    {
      label: "Wellness Score",
      value: primaryPet ? "94%" : "--",
      note: primaryPet ? "Strong daily rhythm" : "Add a pet profile",
      icon: HeartPulse,
      color: "#E8F5E9",
      iconColor: "#43A047",
    },
    {
      label: "Live Services",
      value: services.length || "0",
      note: "Available right now",
      icon: CalendarHeart,
      color: "#FFF3E0",
      iconColor: "#F5A623",
    },
    {
      label: "Notifications",
      value: unreadNotifications || "0",
      note: "Unread updates",
      icon: Bell,
      color: "#EDE7F6",
      iconColor: "#7B68EE",
    },
    {
      label: "Adoption",
      value: adoptionPets.length || "0",
      note: "Pets available",
      icon: UsersRound,
      color: "#FCE4EC",
      iconColor: "#E87B6A",
    },
  ];

  const profileCompletionMissing = [
    !primaryPet?.photoUrl ? "Add a pet photo" : null,
    !primaryPet?.preferredClinic ? "Choose a preferred clinic" : null,
    !user?.phoneNumber && !user?.contactNumber ? "Save a phone number" : null,
  ].filter(Boolean);

  const profileComplete = profileCompletionMissing.length === 0;
  const completionPercent = Math.round(
    ((3 - profileCompletionMissing.length) / 3) * 100
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6 sm:px-6 lg:px-8">
      <style>{`
        .dash-root { font-family: inherit; }
        .dash-serif { font-family: inherit; }

        .card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); }

        .card-lift:hover { transform: translateY(-2px); }

        .chip {
          display: inline-flex; align-items: center;
          background: #F5F0E8; color: #8B6F47;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #2D2D2D; color: #ffffff;
          font-size: 13px; font-weight: 600;
          padding: 10px 18px; border-radius: 12px;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .btn-primary:hover { background: #111; transform: translateY(-1px); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FFF5E4; color: #8B6F47;
          font-size: 13px; font-weight: 600;
          padding: 10px 18px; border-radius: 12px;
          border: 1px solid #F0DFC0;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .btn-secondary:hover { background: #FDECC8; transform: translateY(-1px); }

        .timeline-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #F5A623; flex-shrink: 0; margin-top: 6px;
        }
        .timeline-line {
          width: 1px; background: linear-gradient(to bottom, #F5A623, transparent);
          flex: 1; margin: 4px 0;
        }

        .progress-bar-track {
          height: 6px; background: #F0EBE3; border-radius: 99px; overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(to right, #F5A623, #E8863A);
          transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .quick-action-card {
          display: block; text-decoration: none;
          background: #ffffff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 16px; transition: all 0.2s ease;
        }
        .quick-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .hero-gradient {
          background: linear-gradient(135deg, #FFFBF4 0%, #FFF5E4 50%, #FFFAF5 100%);
        }

        .meetup-card {
          background: linear-gradient(135deg, #1A1A2E 0%, #2D2320 60%, #3D2B1F 100%);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative; overflow: hidden;
        }
        .meetup-card::before {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(245,166,35,0.2), transparent 70%);
          border-radius: 50%;
        }

        .snapshot-value { font-family: inherit; }

        @media (max-width: 640px) {
          .btn-primary, .btn-secondary { font-size: 12px; padding: 9px 14px; }
        }
      `}</style>

      <div className="dash-root mx-auto max-w-7xl space-y-5">

        {/* ── HERO SECTION ── */}
        <div className="card hero-gradient p-5 sm:p-7 lg:p-9">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

            {/* Left: greeting + actions + snapshot */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="chip">Dashboard</span>
                {unreadNotifications > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDECC8] px-3 py-1 text-[10px] font-700 text-[#8B6F47] uppercase tracking-widest">
                    <Bell className="h-3 w-3" />
                    {unreadNotifications} new
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="dash-serif text-3xl font-700 leading-[1.15] tracking-tight text-[#1A1A1A] sm:text-4xl lg:text-5xl">
                  Welcome back,<br />
                  <span className="text-[#C87D2A]">{greetingName}.</span>
                </h1>
                <p className="max-w-lg text-sm leading-relaxed text-[#6B6B6B] sm:text-base">
                  Track reminders, bookings, records, adoption stories, and community moments — all in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/medical-records" className="btn-primary">
                  Open records <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/services" className="btn-secondary">
                  Book care <CalendarHeart className="h-4 w-4" />
                </Link>
                <Link to="/pet-profile" className="btn-secondary">
                  <PlusCircle className="h-4 w-4" /> Pet profile
                </Link>
              </div>

              {/* Snapshot cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {snapshotCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl p-4"
                    style={{ background: card.color }}
                  >
                    <div
                      className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm"
                    >
                      <card.icon className="h-4 w-4" style={{ color: card.iconColor }} />
                    </div>
                    <p className="snapshot-value text-2xl font-600 text-[#1A1A1A]">{card.value}</p>
                    <p className="mt-0.5 text-[11px] font-600 text-[#6B6B6B]">{card.label}</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-[#9B9B9B]">{card.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pet profile card */}
            <div>
              {primaryPet ? (
                <div className="card h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="chip">Pet Profile</span>
                    <PawPrint className="h-5 w-5 text-[#F5A623]" />
                  </div>
                  <h2 className="dash-serif mt-3 text-3xl font-700 text-[#1A1A1A]">{primaryPet.name}</h2>

                  <div className="mt-4 overflow-hidden rounded-2xl bg-[#FFF0D6]">
                    {primaryPet.photoUrl ? (
                      <img
                        src={primaryPet.photoUrl}
                        alt={primaryPet.name}
                        className="h-64 w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center">
                        <PawPrint className="h-14 w-14 text-[#F5A623] opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { label: "Breed", value: primaryPet.breed },
                      { label: "Health", value: primaryPet.vaccinationStatus?.trim() || "See records" },
                      { label: "Plan", value: primaryPet.planType || "Premium" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-[#FAFAF8] px-3 py-4 text-center">
                        <p className="text-[10px] font-600 uppercase tracking-wider text-[#9B9B9B]">{item.label}</p>
                        <p className="mt-1.5 text-sm font-700 text-[#1A1A1A] leading-snug break-words">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card flex h-full items-center justify-center p-6 text-center">
                  <EmptyState
                    eyebrow="First Pet"
                    title="Your pet profile is waiting."
                    description="Complete onboarding to unlock live dashboard care cards."
                    action={<Link to="/onboarding" className="btn-primary mt-2">Start onboarding</Link>}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── VACCINATION + BOOKING ROW ── */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Vaccination */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="chip">Upcoming Vaccination</span>
                <h2 className="dash-serif mt-3 text-xl font-700 text-[#1A1A1A] sm:text-2xl">
                  {latestVaccinationRecord ? latestVaccinationRecord.title : "No reminder yet"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                  {latestVaccinationRecord
                    ? `Next due ${
                        latestVaccinationRecord.nextDueDate
                          ? new Date(latestVaccinationRecord.nextDueDate).toLocaleDateString()
                          : "date to be confirmed"
                      }.`
                    : "Add a vaccination record and it'll show up here automatically."}
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9]">
                <ShieldCheck className="h-6 w-6 text-[#43A047]" />
              </div>
            </div>
          </div>

          {/* Upcoming Booking */}
          <div className="card p-5 sm:p-6">
            <span className="chip">Upcoming Booking</span>
            {upcomingBooking ? (
              <div className="mt-4">
                <div className="flex items-start gap-4 rounded-2xl bg-[#FFF8EE] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <CalendarHeart className="h-5 w-5 text-[#F5A623]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-700 text-[#1A1A1A]">
                      {upcomingBooking.serviceId?.serviceName || "Pet care visit"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B6B6B]">
                      {upcomingBooking.petName} · {formatWhen(upcomingBooking.appointmentTime)}
                    </p>
                    <Link to="/appointments" className="mt-3 inline-flex text-sm font-600 text-[#C87D2A]">
                      Manage booking <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                eyebrow="Booking"
                title="No upcoming bookings."
                description="Reserve a visit and it will appear here with date, time, and payment status."
                action={<Link to="/services" className="btn-primary mt-2">Book now</Link>}
              />
            )}
          </div>
        </div>

        {/* ── RECORDS + QUICK ACTIONS + COMMUNITY ── */}
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Medical Records */}
          <div className="card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="chip">Recent Medical Records</span>
                <h2 className="dash-serif mt-3 text-2xl font-700 text-[#1A1A1A]">Care history</h2>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDE7F6]">
                <Stethoscope className="h-5 w-5 text-[#7B68EE]" />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {recentRecords.length ? (
                recentRecords.map((record, index) => {
                  const typeStyle = typeColors[record.type] || typeColors.default;
                  return (
                    <div key={record._id} className="flex gap-4">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="timeline-dot" />
                        {index < recentRecords.length - 1 && <div className="timeline-line" />}
                      </div>
                      {/* Content */}
                      <div className="mb-4 min-w-0 flex-1 rounded-2xl bg-[#FAFAF8] p-4 border border-[rgba(0,0,0,0.05)]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-base font-700 text-[#1A1A1A]">{record.title}</p>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-700 uppercase tracking-wider"
                            style={{ background: typeStyle.bg, color: typeStyle.text }}
                          >
                            {record.type}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#9B9B9B]">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                          {record.description || "No additional notes for this record."}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  eyebrow="Records"
                  title="No vet records yet."
                  description="Records uploaded by your veterinarian will appear here after your appointment."
                  action={<Link to="/medical-records" className="btn-primary mt-2">View records</Link>}
                />
              )}
            </div>

            {recentRecords.length > 0 && (
              <Link to="/medical-records" className="mt-4 inline-flex items-center gap-1.5 text-sm font-600 text-[#C87D2A]">
                View all records <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <div className="card p-5 sm:p-6">
              <span className="chip">Quick Actions</span>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {quickActions.map((action) => (
                  <Link key={action.title} to={action.url} className="quick-action-card">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: `${action.accent}18` }}
                      >
                        <action.icon className="h-4 w-4" style={{ color: action.accent }} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-[#C0B8B0]" />
                    </div>
                    <p className="mt-3 text-sm font-700 text-[#1A1A1A] leading-snug">{action.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#9B9B9B]">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Community Meetup */}
            {featuredMeetup ? (
              <div className="meetup-card p-5 sm:p-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-700 uppercase tracking-widest text-white/70">
                  <UsersRound className="h-3 w-3" /> Community meetup
                </span>
                <h2 className="dash-serif relative mt-3 text-xl font-700 text-white sm:text-2xl">
                  {featuredMeetup.title}
                </h2>
                <p className="relative mt-2 text-sm leading-relaxed text-white/65">
                  {featuredMeetup.description}
                </p>
                <Link
                  to="/dashboard/community"
                  className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-600 text-[#FFD48C]"
                >
                  See details <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}

            {/* Profile Completion */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="chip">Profile Completion</span>
                <span className="text-sm font-700 text-[#C87D2A]">{completionPercent}%</span>
              </div>

              <div className="mt-4 progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${completionPercent}%` }} />
              </div>

              {profileComplete ? (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#E8F5E9] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#43A047]" />
                  <p className="text-sm leading-relaxed text-[#2E7D32]">
                    Your profile is complete. PetHub has everything it needs for reminders and personalized care.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {profileCompletionMissing.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-[#FFF8EE] px-4 py-3 text-sm text-[#8B6F47] border border-[#F0DFC0]"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-[#F5A623]" />
                      {item}
                    </div>
                  ))}
                  <Link to="/profile" className="btn-primary mt-3 w-full justify-center">
                    Complete profile <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
