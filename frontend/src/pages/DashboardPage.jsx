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
} from "lucide-react";
import { Link } from "react-router-dom";
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
    url: "/service-booking",
  },
  {
    title: "Open medical records",
    description: "Review vaccinations, lab notes, and the care timeline for your pet.",
    icon: Stethoscope,
    url: "/medical-records",
  },
  {
    title: "Browse adoption stories",
    description: "Explore new gentle companions and keep favorite profiles close.",
    icon: HeartPulse,
    url: "/adoption",
  },
  {
    title: "Join the community",
    description: "See meetups, playdates, and soft introductions for pet parents nearby.",
    icon: UsersRound,
    url: "/community",
  },
];

const formatWhen = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const DashboardPage = () => {
  const { data: userResponse } = useCurrentUser();
  const { data: petsResponse } = useMyPets();
  const { data: bookingsResponse } = useMyBookings();
  const { data: servicesResponse } = useServices();
  const { data: adoptionResponse } = useAdoption();
  const { data: notificationsResponse } = useNotifications();
  const { data: meetupsResponse } = useCommunityMeetups();

  const user = userResponse?.data;
  const primaryPet = petsResponse?.data?.primaryPet ?? null;
  const bookings = bookingsResponse?.data ?? [];
  const recordsQuery = useRecordsByPet(primaryPet?._id);
  const records = recordsQuery.data?.data ?? [];
  const services = servicesResponse?.data ?? [];
  const adoptionPets = adoptionResponse?.data?.pets ?? [];
  const notifications = notificationsResponse?.data ?? [];
  const meetups = meetupsResponse?.data ?? [];

  const greetingName =
    user?.fullName ||
    user?.displayName ||
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "Pet Parent";

  const unreadNotifications = notifications.filter((item) => !item.isRead).length;
  const upcomingBooking =
    bookings.find((item) => new Date(item.appointmentTime) > new Date() && item.status !== "cancelled") ??
    null;
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
      note: primaryPet ? "Strong daily rhythm this week" : "Complete a pet profile to unlock this",
      icon: HeartPulse,
    },
    {
      label: "Live Services",
      value: services.length || "0",
      note: "Premium care services available right now",
      icon: CalendarHeart,
    },
    {
      label: "Unread Notifications",
      value: unreadNotifications || "0",
      note: "Fresh reminders and updates in your inbox",
      icon: Bell,
    },
    {
      label: "Adoption Stories",
      value: adoptionPets.length || "0",
      note: "Available pets across the gallery",
      icon: UsersRound,
    },
  ];

  const profileCompletionMissing = [
    !primaryPet?.photoUrl ? "Add a pet photo" : null,
    !primaryPet?.preferredClinic ? "Choose a preferred clinic" : null,
    !user?.phoneNumber && !user?.contactNumber ? "Save a phone number" : null,
  ].filter(Boolean);

  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="pet-card relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,179,71,0.24),_transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-6">
              <span className="pet-chip">Dashboard</span>
              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
                  Welcome back, {greetingName}. Your pet’s care world is ready and beautifully organized.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#6B6B6B]">
                  Track reminders, bookings, records, adoption stories, and community moments from
                  one warm premium workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/medical-records" className="pet-button-primary gap-2">
                  Open records
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link to="/service-booking" className="pet-button-secondary gap-2">
                  Book care
                  <CalendarHeart className="h-4 w-4 text-[#F5A623]" />
                </Link>
                <Link to="/profile" className="pet-button-secondary gap-2">
                  <PlusCircle className="h-4 w-4 text-[#F5A623]" />
                  Add another pet later
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {snapshotCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#6B6B6B]">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold">{card.value}</p>
                    <p className="mt-1 text-xs text-[#8B7B66]">{card.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {primaryPet ? (
                <div className="rounded-[30px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#B78331]">
                        Pet Profile
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">{primaryPet.name}</h2>
                    </div>
                    <PawPrint className="h-7 w-7 text-[#F5A623]" />
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[24px] bg-[#FFE8BE]">
                    {primaryPet.photoUrl ? (
                      <img src={primaryPet.photoUrl} alt={primaryPet.name} className="h-56 w-full object-cover" />
                    ) : (
                      <div className="flex h-56 items-center justify-center text-[#F5A623]">
                        <PawPrint className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                      <p className="text-sm text-[#8B7B66]">Breed</p>
                      <p className="mt-1 text-lg font-semibold">{primaryPet.breed}</p>
                    </div>
                    <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                      <p className="text-sm text-[#8B7B66]">Plan</p>
                      <p className="mt-1 text-lg font-semibold">{primaryPet.planType || "Premium Care"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  eyebrow="First Pet"
                  title="Your pet profile is still waiting."
                  description="Complete onboarding to unlock live dashboard care cards and personalized reminders."
                  action={<Link to="/onboarding" className="pet-button-primary">Start onboarding</Link>}
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card bg-[linear-gradient(150deg,#FFF4E2,#FFFFFF)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="pet-chip">Upcoming vaccination</span>
                <h2 className="mt-4 text-2xl font-bold">
                  {latestVaccinationRecord
                    ? latestVaccinationRecord.title
                    : "No vaccination reminder yet"}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
                  {latestVaccinationRecord
                    ? `Next due ${latestVaccinationRecord.nextDueDate
                      ? new Date(latestVaccinationRecord.nextDueDate).toLocaleDateString()
                      : "date to be confirmed"
                    }.`
                    : "As soon as you add a vaccination record, the dashboard will surface it here."}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-[#F5A623]" />
            </div>
          </div>

          <div className="pet-card p-6">
            <span className="pet-chip">Upcoming Booking</span>
            {upcomingBooking ? (
              <div className="mt-5 rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                <p className="text-xl font-bold">{upcomingBooking.serviceId?.serviceName || "Pet care visit"}</p>
                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                  {upcomingBooking.petName} is booked for {formatWhen(upcomingBooking.appointmentTime)}.
                </p>
                <Link to="/service-booking" className="mt-5 inline-flex text-sm font-semibold text-[#C77E1D]">
                  Manage this booking
                </Link>
              </div>
            ) : (
              <EmptyState
                eyebrow="Booking"
                title="No upcoming bookings."
                description="Reserve a visit and it will appear here with clear date, time, and payment status."
                action={<Link to="/service-booking" className="pet-button-primary">Book now</Link>}
              />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="pet-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Recent Medical Records</span>
              <h2 className="mt-4 text-3xl font-bold">Care rhythm and recent health activity</h2>
            </div>
            <Stethoscope className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-8 space-y-5">
            {recentRecords.length ? (
              recentRecords.map((record, index) => (
                <div key={record._id} className="grid gap-4 md:grid-cols-[auto_1fr]">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-full justify-center">
                      <span className="mt-1 h-3 w-3 rounded-full bg-[#F5A623]" />
                      {index < recentRecords.length - 1 ? (
                        <span className="absolute left-1/2 top-5 h-[calc(100%+1.1rem)] w-px -translate-x-1/2 bg-[#F7D6A2]" />
                      ) : null}
                    </div>
                    <div className="min-w-[110px] text-sm font-semibold text-[#8B7B66]">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                    <p className="text-lg font-semibold">{record.title}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                      {record.type}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                      {record.description || "This record was added without extra notes."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                eyebrow="Records"
                title="No medical records yet."
                description="Upload vaccinations, lab notes, allergies, or prescriptions to make the dashboard more useful."
                action={<Link to="/medical-records" className="pet-button-primary">Add records</Link>}
              />
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card p-6">
            <span className="pet-chip">Quick Actions</span>
            <div className="mt-6 grid gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.url}
                  className="group rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)] transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#A97C3A] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold">{action.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {featuredMeetup ? (
            <div className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                <UsersRound className="h-4 w-4" />
                Community meetup
              </span>
              <h2 className="mt-4 text-3xl font-bold">{featuredMeetup.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">{featuredMeetup.description}</p>
              <Link
                to="/community"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#FFD48C]"
              >
                See meetup details
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}

          <div className="pet-card p-6">
            <span className="pet-chip">Profile Completion</span>
            {profileCompletionMissing.length ? (
              <div className="mt-5 space-y-3">
                {profileCompletionMissing.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm text-[#6B6B6B] shadow-[0_14px_28px_rgba(45,45,45,0.04)]"
                  >
                    {item}
                  </div>
                ))}
                <Link to="/profile" className="pet-button-primary mt-3 gap-2">
                  Complete profile
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] bg-[#FFF8EE] p-5 text-sm leading-7 text-[#6B6B6B] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                Your profile feels strong and complete. PetHub has the essentials it needs for reminders,
                bookings, and personalized care surfaces.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
