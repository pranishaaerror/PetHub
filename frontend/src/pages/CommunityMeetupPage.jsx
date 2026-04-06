import { useEffect, useState } from "react";
import { ArrowLeft, CalendarHeart, MapPin, MailCheck, Sparkles, UsersRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateEngagementRequest } from "../apis/engagements/hooks";
import { useAuth } from "../context/AuthContext";
import { featuredMeetup, findCommunityJourney } from "../utils/communityJourneys";
import { Button } from "../components/Button";

const attendanceOptions = ["Just me", "Me and my pet", "Family group"];

export const CommunityMeetupPage = () => {
  const { slug = featuredMeetup.slug } = useParams();
  const meetup = findCommunityJourney(slug);
  const { userProfile } = useAuth();
  const { mutateAsync: createRequest, isPending } = useCreateEngagementRequest();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    petName: "",
    attendanceType: attendanceOptions[1],
    message: "",
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || userProfile?.displayName || "",
      email: current.email || userProfile?.email || "",
      contactNumber: current.contactNumber || userProfile?.contactNumber || userProfile?.phoneNumber || "",
    }));
  }, [userProfile]);

  if (!meetup) {
    return (
      <div className="pet-page">
        <div className="pet-card p-8 text-center">
          <h1 className="text-3xl font-bold">Meetup not found.</h1>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            This meetup card is unavailable right now.
          </p>
          <Link to="/community" className="pet-button-primary mt-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to community
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await createRequest({
        type: "community-rsvp",
        fullName: form.fullName,
        email: form.email,
        contactNumber: form.contactNumber,
        petName: form.petName,
        title: meetup.title,
        message: form.message,
        referenceId: meetup.slug,
        metadata: {
          attendanceType: form.attendanceType,
          location: meetup.location,
          time: meetup.time,
          petHubId: userProfile?.petHubId ?? null,
        },
      });

      toast.success(response.data?.message || "RSVP saved.");
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white md:p-8">
          <Link to="/community" className="pet-button-secondary gap-2 bg-white/92">
            <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
            Back to community
          </Link>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
            <Sparkles className="h-4 w-4" />
            Meetup card
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">{meetup.title}</h1>
          <p className="mt-4 text-base leading-7 text-white/75">{meetup.summary ?? meetup.detail}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD48C]">When</p>
              <p className="mt-2 text-xl font-bold">{meetup.time}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD48C]">Where</p>
              <p className="mt-2 text-xl font-bold">{meetup.location}</p>
            </div>
          </div>

          {meetup.agenda ? (
            <div className="mt-8 rounded-[28px] bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD48C]">What happens</p>
              <div className="mt-4 space-y-3">
                {meetup.agenda.map((item) => (
                  <div key={item} className="rounded-[20px] bg-white/8 px-4 py-3 text-sm leading-7 text-white/80">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="pet-card p-6 md:p-8">
          <span className="pet-chip">RSVP Flow</span>
          <h2 className="mt-4 text-3xl font-bold">Save your place with a proper follow-up trail.</h2>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            Your RSVP is stored, the PetHub team is notified, and a confirmation email lands in
            your inbox so this page feels client-ready instead of temporary.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Full name</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Contact number</span>
                <input
                  type="tel"
                  value={form.contactNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, contactNumber: event.target.value }))
                  }
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Attendance</span>
                <select
                  value={form.attendanceType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, attendanceType: event.target.value }))
                  }
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                >
                  {attendanceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Pet name</span>
              <input
                type="text"
                value={form.petName}
                onChange={(event) => setForm((current) => ({ ...current, petName: event.target.value }))}
                placeholder="Optional, if your companion is joining"
                className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">A short note</span>
              <textarea
                rows={4}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Mention your pet's energy level, any accessibility needs, or who is joining."
                className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
              />
            </label>

            <Button type="submit" disabled={isPending} className="pet-button-primary w-full gap-2">
              <CalendarHeart className="h-4 w-4" />
              {isPending ? "Saving RSVP..." : "RSVP and email me the details"}
            </Button>

            {submitted ? (
              <div className="rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#5B544C] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                Your RSVP is logged and a PetHub confirmation email is on the way.
              </div>
            ) : null}
          </form>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <UsersRound className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 text-sm font-semibold">Capacity</p>
              <p className="mt-1 text-lg font-bold">{meetup.capacity ?? "Open"}</p>
            </div>
            <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <MapPin className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 text-sm font-semibold">Location</p>
              <p className="mt-1 text-lg font-bold">{meetup.location}</p>
            </div>
            <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <MailCheck className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 text-sm font-semibold">Follow-up</p>
              <p className="mt-1 text-lg font-bold">Email receipt</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
