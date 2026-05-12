import { HeartHandshake, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { PetHubLoader } from "../../components/PetHubLoader";
import { useMyAdoptionRequests } from "../../apis/adoptionRequests/hooks";

const statusConfig = {
  pending:   { badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       dot: "bg-amber-400"   },
  approved:  { badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  rejected:  { badge: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",      dot: "bg-stone-400"   },
  cancelled: { badge: "bg-stone-100 text-stone-500 ring-1 ring-stone-200",      dot: "bg-stone-400"   },
};

export const AdoptionHistoryPage = () => {
  const { data: requestsResponse, isLoading } = useMyAdoptionRequests();
  const requests = requestsResponse?.data ?? [];

  if (isLoading) {
    return <PetHubLoader title="Loading Adoption History" message="Fetching your adoption requests." />;
  }

  return (
    <div className="pet-page space-y-6">
      {/* Header */}
      <div className="pet-card p-6 md:p-8">
        <span className="pet-chip">Adoption History</span>
        <h1 className="mt-3 text-3xl font-bold text-[#2D2D2D] md:text-4xl">Your adoption requests</h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[#6B6B6B]">
          A full record of every adoption request you've submitted and their current status.
        </p>
      </div>

      {/* List */}
      {requests.length === 0 ? (
        <div className="pet-card flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6]">
            <PawPrint className="h-7 w-7 text-[#F5A623]" />
          </div>
          <p className="text-base font-bold text-[#2D2D2D]">No adoption requests yet.</p>
          <Link to="/dashboard/adoption" className="pet-button-primary">Browse adoption gallery</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const cfg = statusConfig[req.status] ?? statusConfig.pending;
            return (
              <div key={req._id} className="pet-card flex items-start gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D6]">
                  <HeartHandshake className="h-5 w-5 text-[#F5A623]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#2D2D2D]">
                        {req.petId?.petName || "Adoption profile"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 capitalize">
                        {req.petId?.breed || req.petId?.species || "—"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  {req.message && (
                    <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{req.message}</p>
                  )}
                  <p className="mt-2 text-[11px] text-gray-400">
                    Submitted {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
