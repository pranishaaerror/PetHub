import { useEffect } from "react";
import {
  ArrowUpRight,
  CalendarHeart,
  MapPin,
  Sparkles,
  UsersRound,
  Heart,
  Shield,
  Clock3,
  CheckCircle2,
  MessageCircleHeart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { communityPlaydates, featuredMeetup } from "../utils/communityJourneys";
import { useCommunityMeetups } from "../apis/community/hooks";
import { useCurrentUser, useUpdateCurrentUser } from "../apis/users/hooks";
import { useAuth } from "../context/AuthContext";

const interestSchema = z.object({
  petName: z.string().optional(),
  address: z.string().optional(),
  interestType: z.string().optional(),
});

export const CommunityPage = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { data: meetupsResponse } = useCommunityMeetups({ approvedOnly: true });
  const { data: userResponse } = useCurrentUser({ enabled: !!currentUser });
  const { mutateAsync: updateCurrentUser, isPending: isSavingInterest } = useUpdateCurrentUser();

  const user = userResponse?.data;
  const approvedMeetups = meetupsResponse?.data ?? [];

  const liveStats = [
    { value: String(approvedMeetups.length), label: "Upcoming community events" },
    { value: String(approvedMeetups.reduce((sum, m) => sum + (m.attendees?.length ?? 0), 0)), label: "RSVPs confirmed" },
    { value: String(new Set(approvedMeetups.map(m => m.location)).size), label: "Active locations" },
  ];

  const interestForm = useForm({
    resolver: zodResolver(interestSchema),
    defaultValues: { petName: "", address: "", interestType: "" },
  });

  useEffect(() => {
    if (user?.communityInterest) {
      interestForm.reset({
        petName: user.communityInterest.petName ?? "",
        address: user.communityInterest.address ?? "",
        interestType: user.communityInterest.interestType ?? "",
      });
    }
  }, [user, interestForm]);

  const onSaveInterest = interestForm.handleSubmit(async (values) => {
    try {
      await updateCurrentUser({
        communityInterest: {
          petName: values.petName?.trim() || "",
          address: values.address?.trim() || "",
          interestType: values.interestType?.trim() || "",
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success("Community preferences saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  return (
    <div className="cm-root min-h-screen bg-transparent">
      <style>{`
        .cm-root { font-family: inherit; color: #1A1A1A; }
        .cm-serif { font-family: inherit; }

        /* ── HERO ── */
        .cm-hero {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1A1614 0%, #2C1F18 45%, #1A1A2A 100%);
          padding: 80px 48px 90px;
        }
        @media (max-width: 640px) { .cm-hero { padding: 56px 24px 64px; } }

        .cm-hero-blob-1 {
          position: absolute; pointer-events: none;
          top: -80px; right: -80px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,166,35,0.22), transparent 65%);
          animation: blobFloat 6s ease-in-out infinite;
        }
        .cm-hero-blob-2 {
          position: absolute; pointer-events: none;
          bottom: -60px; left: 25%;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,140,0,0.12), transparent 65%);
          animation: blobFloat 8s ease-in-out 2s infinite;
        }
        .cm-hero-blob-3 {
          position: absolute; pointer-events: none;
          top: 30%; left: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,166,35,0.08), transparent 65%);
        }
        @keyframes blobFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-14px) scale(1.04); }
        }

        .cm-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,166,35,0.15);
          border: 1px solid rgba(245,166,35,0.3);
          color: #F5A623;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 6px 16px; border-radius: 100px;
          margin-bottom: 28px;
        }

        .cm-hero-title {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 800;
          line-height: 1.1;
          color: #fff;
          max-width: 680px;
          margin-bottom: 24px;
        }
        .cm-hero-title span { color: #F5A623; }

        .cm-hero-sub {
          font-size: 17px;
          color: rgba(255,255,255,0.6);
          max-width: 500px;
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .cm-hero-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #F5A623;
          color: #fff;
          font-weight: 700; font-size: 14px;
          padding: 14px 28px; border-radius: 14px;
          text-decoration: none;
          box-shadow: 0 12px 30px rgba(245,166,35,0.35);
          transition: all 0.2s;
        }
        .cm-hero-cta:hover { background: #E09615; transform: translateY(-2px); box-shadow: 0 18px 40px rgba(245,166,35,0.4); }

        .cm-hero-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.85);
          font-weight: 600; font-size: 14px;
          padding: 14px 28px; border-radius: 14px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .cm-hero-ghost:hover { background: rgba(255,255,255,0.14); transform: translateY(-2px); }

        /* ── STATS STRIP ── */
        .cm-stats-strip {
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 0 48px;
          display: flex; gap: 0;
        }
        @media (max-width: 640px) { .cm-stats-strip { padding: 0 24px; flex-direction: column; } }

        .cm-stat-item {
          flex: 1;
          display: flex; align-items: center; gap: 16px;
          padding: 28px 0;
          border-right: 1px solid rgba(0,0,0,0.06);
          padding-right: 32px; margin-right: 32px;
        }
        .cm-stat-item:last-child { border-right: none; padding-right: 0; margin-right: 0; }
        @media (max-width: 640px) {
          .cm-stat-item { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 20px 0; margin: 0; }
          .cm-stat-item:last-child { border-bottom: none; }
        }

        /* ── CONTENT CARDS ── */
        .cm-card {
          background: #fff;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }

        .cm-chip {
          display: inline-flex; align-items: center;
          background: #F5F0E8; color: #8B6F47;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 100px;
        }

        .cm-input {
          width: 100%; background: #F7F3ED;
          border: 1.5px solid transparent; border-radius: 14px;
          padding: 13px 16px; font-size: 14px;
          font-family: inherit; color: #1A1A1A;
          outline: none; transition: all 0.2s;
        }
        .cm-input:focus { border-color: #F5A623; box-shadow: 0 0 0 4px rgba(245,166,35,0.1); }
        .cm-input::placeholder { color: #B0A898; }
        select.cm-input { appearance: none; cursor: pointer; }

        .cm-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9B8C7A; margin-bottom: 8px;
        }

        .cm-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1A1A1A; color: #fff;
          font-size: 14px; font-weight: 600;
          padding: 13px 22px; border-radius: 14px;
          border: none; cursor: pointer; text-decoration: none;
          transition: all 0.2s;
        }
        .cm-btn-primary:hover { background: #333; transform: translateY(-1px); }
        .cm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .meetup-row {
          border-radius: 18px;
          background: #F7F3ED;
          padding: 20px 22px;
          transition: background 0.15s;
        }
        .meetup-row:hover { background: #FFF5E4; }

        .playdate-card {
          background: #F7F3ED;
          border-radius: 18px;
          padding: 20px 22px;
          transition: all 0.2s;
        }
        .playdate-card:hover { background: #FFF5E4; transform: translateY(-2px); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up   { animation: fadeUp 0.55s ease both; }
        .fade-up-1 { animation-delay: 0.08s; }
        .fade-up-2 { animation-delay: 0.18s; }
        .fade-up-3 { animation-delay: 0.28s; }
        .fade-up-4 { animation-delay: 0.38s; }
      `}</style>

      
      <div className="cm-stats-strip">
        {liveStats.map((stat, i) => {
          const palette = [
            { bg: "#FFF0D6", color: "#F5A623", Ic: UsersRound },
            { bg: "#E8F5E9", color: "#43A047", Ic: CheckCircle2 },
            { bg: "#EDE7F6", color: "#7B68EE", Ic: Heart },
          ];
          const p = palette[i % palette.length];
          return (
            <div key={stat.label} className="cm-stat-item">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: p.bg }}>
                <p.Ic className="h-6 w-6" style={{ color: p.color }} />
              </div>
              <div>
                <p className="cm-serif text-3xl font-bold text-[#1A1A1A]">{stat.value}</p>
                <p className="mt-0.5 text-sm text-[#9B9B9B]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="mx-auto py-8">

       
        <div className="cm-card p-7">
          <div className="flex items-center justify-between">
            <div>
              <span className="cm-chip">Approved Events</span>
              <h2 className="cm-serif mt-3 text-2xl font-bold">Curated by PetHub</h2>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D6]">
              <Shield className="h-5 w-5 text-[#F5A623]" />
            </div>
          </div>
          <p className="mt-2 text-sm text-[#6B6B6B]">Only high-quality, admin-approved listings appear here.</p>

          <div className="mt-6 space-y-3">
            {approvedMeetups.length > 0 ? (
              approvedMeetups.map((m) => (
                <div key={m._id} className="meetup-row">
                  <h3 className="font-semibold text-[#1A1A1A]">{m.title}</h3>
                  <p className="mt-1 text-sm text-[#6B6B6B] line-clamp-2">{m.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#8B7B66]">
                    <span className="flex items-center gap-1.5">
                      <CalendarHeart className="h-3.5 w-3.5 text-[#F5A623]" />
                      {m.date} · {m.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#F5A623]" />
                      {m.location}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#B78331]">Host · {m.hostName}</p>
                    <Link
                      to={
                        currentUser
                          ? `/community/conversations/connect/${m._id}`
                          : `/signup?redirect=${encodeURIComponent(`/community/conversations/connect/${m._id}`)}`
                      }
                      className="flex items-center gap-1 text-xs font-600 text-[#C87D2A] hover:text-[#A56A22]"
                    >
                      View details <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-[#9B9B9B]">No approved events yet — check back soon!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
