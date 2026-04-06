import {
  ArrowUpRight,
  CalendarHeart,
  MessageCircleHeart,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  communityPlaydates,
  communityStats,
  featuredMeetup,
} from "../utils/communityJourneys";

export const CommunityPage = () => {
  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="pet-card overflow-hidden bg-[linear-gradient(140deg,#2D2D2D,#5A4632)] p-6 text-white md:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
            <Sparkles className="h-4 w-4" />
            {featuredMeetup.eyebrow}
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            {featuredMeetup.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">{featuredMeetup.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/community/meetups/${featuredMeetup.slug}`}
              className="pet-button-primary gap-2"
            >
              RSVP now
              <CalendarHeart className="h-4 w-4" />
            </Link>
            <Link
              to={`/community/meetups/${featuredMeetup.slug}`}
              className="pet-button-secondary gap-2 bg-white/90"
            >
              View meetup card
              <ArrowUpRight className="h-4 w-4 text-[#F5A623]" />
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {communityStats.map((stat) => (
            <div key={stat.label} className="pet-card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                Community Stat
              </p>
              <p className="mt-3 text-4xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-[#6B6B6B]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="pet-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="pet-chip">Playdate Discovery</span>
              <h2 className="mt-4 text-3xl font-bold">Find the right energy for your next meetup.</h2>
            </div>
            <UsersRound className="h-7 w-7 text-[#F5A623]" />
          </div>

          <div className="mt-8 grid gap-4">
            {communityPlaydates.map((playdate) => (
              <article
                key={playdate.slug}
                className="rounded-[28px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{playdate.title}</p>
                    <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">{playdate.detail}</p>
                  </div>
                  <span className="pet-chip">{playdate.mood}</span>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#8B7B66]">{playdate.time}</p>
                  <div className="flex gap-3">
                    <Link
                      to={`/community/conversations/message/${playdate.slug}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2D2D2D] shadow-[0_14px_28px_rgba(45,45,45,0.05)]"
                    >
                      Message
                    </Link>
                    <Link
                      to={`/community/conversations/connect/${playdate.slug}`}
                      className="rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(245,166,35,0.2)]"
                    >
                      Connect
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="pet-card p-6">
            <span className="pet-chip">Quick pulse</span>
            <h2 className="mt-4 text-2xl font-bold">Why the community feels alive</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                <p className="text-lg font-semibold">Trusted introductions</p>
                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                  Match by temperament, location, and energy level before you commit to a meetup.
                </p>
              </div>
              <div className="rounded-[24px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                <p className="text-lg font-semibold">Warm conversation tools</p>
                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                  Message, connect, and RSVP now open into full PetHub flows with email confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="pet-card bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-[#F5A623] shadow-[0_14px_28px_rgba(45,45,45,0.05)]">
                <MessageCircleHeart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78331]">
                  Conversation starter
                </p>
                <p className="mt-1 text-2xl font-bold">Ask about favorite calming routines</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6B6B6B]">
              Pet parents open up quickly when the first question feels kind and practical. Try:
              “What helps your pet feel safe in a new space?”
            </p>
            <Link to="/community/conversations/warm-intro" className="pet-button-primary mt-6 gap-2">
              Start a warm intro
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
