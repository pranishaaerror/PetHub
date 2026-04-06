import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import { useCurrentUser, useUpdateCurrentUser } from "../../apis/users/hooks";

const dayOptions = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

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
    if (!user) {
      return;
    }

    if (isVet) {
      const profile = user.vetProfile ?? {};
      setSpecialization(profile.specialization ?? "");
      setExperienceYears(profile.experienceYears ?? "");
      setQualifications(profile.qualifications ?? "");
      setWorkingDays(profile.availability?.workingDays ?? []);
      const slot = profile.availability?.timeSlots?.[0];
      setSlotStart(slot?.start ?? "09:00");
      setSlotEnd(slot?.end ?? "17:00");
    } else {
      const profile = user.groomerProfile ?? {};
      setServicesOffered((profile.servicesOffered ?? []).join(", "));
      setBio(profile.bio ?? "");
      setWorkingDays(profile.availability?.workingDays ?? []);
      const slot = profile.availability?.timeSlots?.[0];
      setSlotStart(slot?.start ?? "09:00");
      setSlotEnd(slot?.end ?? "17:00");
    }
  }, [isVet, user]);

  const toggleDay = (day) => {
    setWorkingDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  };

  const handleSave = async () => {
    const availability = {
      workingDays,
      timeSlots: [{ start: slotStart, end: slotEnd }],
    };

    try {
      if (isVet) {
        await updateUser.mutateAsync({
          vetProfile: {
            specialization,
            experienceYears,
            qualifications,
            availability,
          },
        });
      } else {
        await updateUser.mutateAsync({
          groomerProfile: {
            servicesOffered: servicesOffered
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            bio,
            availability,
          },
        });
      }

      await refetch();
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="pet-page space-y-6">
      <div className="pet-card p-6">
        <span className="pet-chip">Profile</span>
        <h1 className="mt-4 text-3xl font-bold">{isVet ? "Veterinarian profile" : "Groomer profile"}</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">
          Keep your professional details and availability accurate for scheduling and trust.
        </p>
      </div>

      <div className="pet-card space-y-5 p-6">
        {isVet ? (
          <>
            <label className="block text-sm font-semibold text-[#5B544C]">
              Specialization
              <input
                value={specialization}
                onChange={(event) => setSpecialization(event.target.value)}
                className="mt-2 w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
              />
            </label>
            <label className="block text-sm font-semibold text-[#5B544C]">
              Years of experience
              <input
                type="number"
                min="0"
                value={experienceYears}
                onChange={(event) => setExperienceYears(event.target.value)}
                className="mt-2 w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
              />
            </label>
            <label className="block text-sm font-semibold text-[#5B544C]">
              Qualifications
              <textarea
                value={qualifications}
                onChange={(event) => setQualifications(event.target.value)}
                className="mt-2 min-h-[100px] w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
              />
            </label>
          </>
        ) : (
          <>
            <label className="block text-sm font-semibold text-[#5B544C]">
              Services offered (comma separated)
              <input
                value={servicesOffered}
                onChange={(event) => setServicesOffered(event.target.value)}
                className="mt-2 w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
              />
            </label>
            <label className="block text-sm font-semibold text-[#5B544C]">
              Bio
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="mt-2 min-h-[100px] w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none ring-2 ring-transparent focus:ring-[#F5C062]"
              />
            </label>
          </>
        )}

        <div>
          <p className="text-sm font-semibold text-[#5B544C]">Working days</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {dayOptions.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  workingDays.includes(day)
                    ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white"
                    : "bg-[#FFF4E2] text-[#8B6A39]"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#5B544C]">
            Day start
            <input
              type="time"
              value={slotStart}
              onChange={(event) => setSlotStart(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-[#5B544C]">
            Day end
            <input
              type="time"
              value={slotEnd}
              onChange={(event) => setSlotEnd(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-[#F0E2CC] bg-white px-4 py-3 text-sm outline-none"
            />
          </label>
        </div>

        <button type="button" onClick={handleSave} className="pet-button-primary">
          Save profile
        </button>
      </div>
    </div>
  );
};
