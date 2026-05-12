import { CalendarDays, MapPin, PawPrint, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PetHubLoader } from "../../components/PetHubLoader";
import { useCommunityMeetups } from "../../apis/community/hooks";
import { useAuth } from "../../context/AuthContext";

export const CommunityHistoryPage = () => {
  const { currentUser } = useAuth();
  const { data: meetupsResponse, isLoading } = useCommunityMeetups({ approvedOnly: true });
  const allMeetups = meetupsResponse?.data ?? [];

  // Filter meetups the current user has RSVPed to
  const myMeetups = allMeetups.filter((m) =>
    m.attendees?.some((a) => {
      const id = typeof a === "string" ? a : a?._id ?? a?.userId;
      return id && currentUser?.uid && String(id) === String(currentUser.uid);
    })
  );

  if (isLoading) {
    return <PetHubLoader title="Loading Community History" message="Fetching your community activity." />;
  }

  return (
    <div className="pet-page space-y-6">
      {/* Header */}
      <div className="pet-card p-6 md:p-8">
        <span className="pet-chip">Community History</span>
        <h1 className="mt-3 text-3xl font-bold text-[#2D2D2D] md:text-4xl">Your community activity</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[#6B6B6B]">
          Events and meetups you've RSVPed to or attended through PetHub.
        </p>
      </div>

      {/* List */}
      {myMeetups.length === 0 ? (
        <div className="pet-card flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6]">
            <PawPrint className="h-7 w-7 text-[#F5A623]" />
          </div>
          <p className="text-base font-bold text-[#2D2D2D]">No community events joined yet.</p>
          <Link to="/community" className="pet-button-primary">Explore community</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myMeetups.map((meetup) => (
            <div key={meetup._id} className="pet-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D6]">
                  <Users className="h-5 w-5 text-[#F5A623]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-bold text-[#2D2D2D]">{meetup.title}</p>
                    <span className="inline-flex rounded-full bg-[#FFF5E0] px-2.5 py-0.5 text-xs font-semibold text-[#8B6428] capitalize">
                      {meetup.type}
                    </span>
                  </div>
                  {meetup.description && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{meetup.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDays className="h-3.5 w-3.5 text-[#F5A623]" />
                      {meetup.date} · {meetup.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-[#F5A623]" />
                      {meetup.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="h-3.5 w-3.5 text-[#F5A623]" />
                      {meetup.attendees?.length ?? 0} attendees
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
