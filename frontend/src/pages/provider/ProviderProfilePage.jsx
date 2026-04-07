import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import { useCurrentUser, useUpdateCurrentUser } from "../../apis/users/hooks";
import { Save, UserCircle } from "lucide-react";

const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const dayShort = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" };

export const ProviderProfilePage = () => {
  const { portal } = useOutletContext();
  const isVet = portal === "vet";
  const { data, refetch } = useCurrentUser();
  const updateUser = useUpdateCurrentUser();
  const user = data?.data;

  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [workingDays, setWorkingDays] = useState([]);
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("17:00");
  const [servicesOffered, setServicesOffered] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    if (isVet) {
      const p = user.vetProfile ?? {};
      setSpecialization(p.specialization ?? "");
      setExperienceYears(p.experienceYears ?? "");
      setQualifications(p.qualifications ?? "");
      setWorkingDays(p.availability?.workingDays ?? []);
      const slot = p.availability?.timeSlots?.[0];
      setSlotStart(slot?.start ?? "09:00");
      setSlotEnd(slot?.end ?? "17:00");
    } else {
      const p = user.groomerProfile ?? {};
      setServicesOffered((p.servicesOffered ?? []).join(", "));
      setBio(p.bio ?? "");
      setWorkingDays(p.availability?.workingDays ?? []);
      const slot = p.availability?.timeSlots?.[0];
      setSlotStart(slot?.start ?? "09:00");
      setSlotEnd(slot?.end ?? "17:00");
    }
  }, [isVet, user]);

  const toggleDay = (day) =>
    setWorkingDays((cur) => cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]);

  const handleSave = async () => {
    const availability = { workingDays, timeSlots: [{ start: slotStart, end: slotEnd }] };
    try {
      if (isVet) {
        await updateUser.mutateAsync({ vetProfile: { specialization, experienceYears, qualifications, availability } });
      } else {
        await updateUser.mutateAsync({
          groomerProfile: {
            servicesOffered: servicesOffered.split(",").map((s) => s.trim()).filter(Boolean),
            bio, availability,
          },
        });
      }
      await refetch();
      toast.success("Profile updated.");
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
  };

  return (
    <div className="pv-root space-y-6 p-1">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pv-root { font-family: 'DM Sans', sans-serif; color: #1A1A2E; }
        .pv-serif { font-family: 'Syne', sans-serif; }
        .pv-card { background: #fff; border-radius: 22px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 16px rgba(0,0,0,0.05); }
        .pv-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(245,166,35,0.1); border: 1px solid rgba(245,166,35,0.25); color: #D97706; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; }
        .pv-input { width: 100%; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 12px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1A1A2E; outline: none; transition: all 0.2s; resize: vertical; }
        .pv-input:focus { border-color: #F5A623; box-shadow: 0 0 0 3px rgba(245,166,35,0.1); }
        .pv-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #94A3B8; margin-bottom: 8px; }
        .pv-btn-primary { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #F5A623, #FF8C00); color: #fff; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 14px; border: none; cursor: pointer; box-shadow: 0 8px 20px rgba(245,166,35,0.28); transition: all 0.2s; }
        .pv-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(245,166,35,0.38); }
        .pv-section { padding-bottom: 28px; border-bottom: 1px solid #F1F5F9; margin-bottom: 28px; }
        .pv-section:last-child { padding-bottom: 0; border-bottom: none; margin-bottom: 0; }
      `}</style>

      {/* Header */}
      <div className="pv-card p-7">
        <span className="pv-chip"><UserCircle className="h-3 w-3" /> Profile</span>
        <h1 className="pv-serif mt-4 text-3xl font-700">{isVet ? "Veterinarian Profile" : "Groomer Profile"}</h1>
        <p className="mt-2 text-sm text-[#64748B]">Keep your professional details and availability accurate for scheduling and trust.</p>
      </div>

      {/* Form */}
      <div className="pv-card p-7">

        {/* Professional Info */}
        <div className="pv-section">
          <h2 className="pv-serif mb-5 text-lg font-700">Professional Details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {isVet ? (
              <>
                <div className="sm:col-span-2">
                  <label className="pv-label">Specialization</label>
                  <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="pv-input" placeholder="e.g. Small Animal Medicine" />
                </div>
                <div>
                  <label className="pv-label">Years of Experience</label>
                  <input type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="pv-input" placeholder="e.g. 5" />
                </div>
                <div className="sm:col-span-2">
                  <label className="pv-label">Qualifications</label>
                  <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} className="pv-input min-h-[100px]" placeholder="BVSc, MVSc, or other credentials..." />
                </div>
              </>
            ) : (
              <>
                <div className="sm:col-span-2">
                  <label className="pv-label">Services Offered (comma-separated)</label>
                  <input value={servicesOffered} onChange={(e) => setServicesOffered(e.target.value)} className="pv-input" placeholder="e.g. Bath & Dry, Haircut, Nail Trim" />
                </div>
                <div className="sm:col-span-2">
                  <label className="pv-label">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="pv-input min-h-[100px]" placeholder="Tell pet parents about your experience and approach..." />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="pv-section">
          <h2 className="pv-serif mb-5 text-lg font-700">Availability</h2>

          <div className="mb-5">
            <label className="pv-label">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => {
                const active = workingDays.includes(day);
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className="rounded-xl px-4 py-2 text-xs font-700 capitalize transition"
                    style={{
                      background: active ? "linear-gradient(135deg, #F5A623, #FF8C00)" : "#F1F5F9",
                      color: active ? "#fff" : "#64748B",
                      boxShadow: active ? "0 4px 12px rgba(245,166,35,0.25)" : "none",
                    }}
                  >
                    {dayShort[day]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="pv-label">Day Start</label>
              <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} className="pv-input" />
            </div>
            <div>
              <label className="pv-label">Day End</label>
              <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} className="pv-input" />
            </div>
          </div>
        </div>

        <button type="button" onClick={handleSave} disabled={updateUser.isPending} className="pv-btn-primary">
          <Save className="h-4 w-4" />
          {updateUser.isPending ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};
