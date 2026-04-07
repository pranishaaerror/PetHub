import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, HeartHandshake, MailCheck, MessageCircleHeart, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateEngagementRequest } from "../apis/engagements/hooks";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import {
  communityConversationModes,
  findCommunityJourney,
} from "../utils/communityJourneys";

export const CommunityConversationPage = () => {
  const { mode = "warm-intro", slug } = useParams();
  const { userProfile } = useAuth();
  const { mutateAsync: createRequest, isPending } = useCreateEngagementRequest();
  const journey = findCommunityJourney(slug);
  const modeConfig = communityConversationModes[mode] ?? communityConversationModes["warm-intro"];
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    petName: "",
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

  const pageTitle = useMemo(() => {
    if (!journey) {
      return modeConfig.title;
    }

    return `${modeConfig.title} for ${journey.title}`;
  }, [journey, modeConfig.title]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.message.trim()) {
      toast.error("Please add a short message before sending.");
      return;
    }

    try {
      const response = await createRequest({
        type: "community-message",
        fullName: form.fullName,
        email: form.email,
        contactNumber: form.contactNumber,
        petName: form.petName,
        title: journey?.title ?? "PetHub Warm Intro",
        message: form.message,
        referenceId: slug ?? mode,
        metadata: {
          mode,
          modeLabel: modeConfig.label,
          location: journey?.location ?? null,
          time: journey?.time ?? null,
          petHubId: userProfile?.petHubId ?? null,
        },
      });

      toast.success(response.data?.message || "Community request sent.");
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white md:p-8">
          <Link to="/community" className="pet-button-secondary gap-2 bg-white/92">
            <ArrowLeft className="h-4 w-4 text-[#F5A623]" />
            Back to community
          </Link>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
            <Sparkles className="h-4 w-4" />
            {modeConfig.label}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight">{pageTitle}</h1>
          <p className="mt-4 text-base leading-7 text-white/75">{modeConfig.intro}</p>

          <div className="mt-8 rounded-[28px] bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD48C]">Conversation context</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <p>{journey?.detail ?? "PetHub will use your note to start a softer, more thoughtful introduction."}</p>
              {journey?.time ? <p><strong>Time:</strong> {journey.time}</p> : null}
              {journey?.location ? <p><strong>Location:</strong> {journey.location}</p> : null}
            </div>
          </div>
        </div>

        <div className="pet-card p-6 md:p-8">
          <span className="pet-chip">Conversation Request</span>
          <h2 className="mt-4 text-3xl font-bold">Send a clear note with a real follow-up trail.</h2>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            This page turns the message and connect buttons into an actual PetHub workflow with saved
            requests and email confirmation.
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
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Pet name</span>
                <input
                  type="text"
                  value={form.petName}
                  onChange={(event) => setForm((current) => ({ ...current, petName: event.target.value }))}
                  placeholder="Optional but helpful"
                  className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Message</span>
              <textarea
                rows={5}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Share your pet's temperament, availability, and the tone you want PetHub to set."
                className="w-full rounded-[22px] bg-[#FFF8EE] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                required
              />
            </label>

            <Button type="submit" disabled={isPending} className="pet-button-primary w-full gap-2">
              <MessageCircleHeart className="h-4 w-4" />
              {isPending ? "Sending request..." : `Send ${modeConfig.label.toLowerCase()} request`}
            </Button>

            {submitted ? (
              <div className="rounded-[24px] bg-[#FFF8EE] p-4 text-sm leading-7 text-[#5B544C] shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                Your request is saved and PetHub has emailed you a confirmation receipt.
              </div>
            ) : null}
          </form>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <HeartHandshake className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 text-lg font-semibold">Warmer introductions</p>
              <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                PetHub stores your intent so the conversation can begin with more context.
              </p>
            </div>
            <div className="rounded-[24px] bg-[#FFF8EE] p-4 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
              <MailCheck className="h-6 w-6 text-[#F5A623]" />
              <p className="mt-3 text-lg font-semibold">Email confirmation</p>
              <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                Your inbox gets a clean receipt so nothing feels vague after submission.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
