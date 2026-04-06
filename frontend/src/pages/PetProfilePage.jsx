import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, PawPrint, Save, ShieldCheck, Sparkles, Stethoscope, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useMyPets, useUpdatePet, useUploadPetPhoto } from "../apis/pets/hooks";

const petSchema = z.object({
  name: z.string().min(1, "Pet name is required."),
  species: z.string().min(1, "Species is required."),
  breed: z.string().min(1, "Breed is required."),
  gender: z.string().optional(),
  age: z.string().optional(),
  weight: z.string().optional(),
  color: z.string().optional(),
  vaccinationStatus: z.string().optional(),
  preferredClinic: z.string().optional(),
});

const formFields = [
  { name: "name",              label: "Pet name",            span: false },
  { name: "species",           label: "Species",             span: false },
  { name: "breed",             label: "Breed",               span: false },
  { name: "gender",            label: "Gender",              span: false },
  { name: "age",               label: "Age",                 span: false },
  { name: "weight",            label: "Weight",              span: false },
  { name: "color",             label: "Color / markings",   span: false },
  { name: "vaccinationStatus", label: "Vaccination status",  span: false },
  { name: "preferredClinic",   label: "Preferred clinic",    span: true  },
];

export const PetProfilePage = () => {
  const queryClient = useQueryClient();
  const { data: petsResponse, isLoading: isPetsLoading } = useMyPets();
  const { mutateAsync: updatePet,      isPending: isSavingPet      } = useUpdatePet();
  const { mutateAsync: uploadPetPhoto, isPending: isUploadingPhoto } = useUploadPetPhoto();

  const primaryPet = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;

  const petForm = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "", species: "", breed: "", gender: "",
      age: "", weight: "", color: "", vaccinationStatus: "", preferredClinic: "",
    },
  });

  useEffect(() => {
    if (primaryPet) {
      petForm.reset({
        name:              primaryPet.name              || "",
        species:           primaryPet.species           || "",
        breed:             primaryPet.breed             || "",
        gender:            primaryPet.gender            || "",
        age:               primaryPet.age               || "",
        weight:            primaryPet.weight            || "",
        color:             primaryPet.color             || "",
        vaccinationStatus: primaryPet.vaccinationStatus || "",
        preferredClinic:   primaryPet.preferredClinic   || "",
      });
    }
  }, [petForm, primaryPet]);

  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["my-pets"] });
  };

  const handlePetSubmit = petForm.handleSubmit(async (values) => {
    if (!primaryPet) { toast.error("No primary pet profile found yet."); return; }
    try {
      await updatePet({ id: primaryPet._id, data: values });
      await refreshData();
      toast.success("Your pet profile has been updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !primaryPet) return;
    try {
      await uploadPetPhoto({ id: primaryPet._id, file });
      await refreshData();
      toast.success("Pet photo updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isPetsLoading) {
    return <PetHubLoader title="Loading Pet Profile" message="Fetching your pet details and care preferences." />;
  }

  if (!primaryPet) {
    return (
      <div className="pet-page">
        <EmptyState
          eyebrow="Pet Profile"
          title="No pet profile yet."
          description="Complete onboarding first so you can add your pet's name, photo, and health details."
          action={<Link to="/onboarding" className="pet-button-primary">Start onboarding</Link>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6 sm:px-6 lg:px-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .pp-root  { font-family: 'DM Sans', sans-serif; color: #1A1A1A; }
        .pp-serif { font-family: 'Fraunces', Georgia, serif; }

        .pp-card {
          background: #ffffff;
          border-radius: 22px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 14px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04);
        }

        .pp-chip {
          display: inline-flex; align-items: center;
          background: #F5F0E8; color: #8B6F47;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
        }

        .pp-input {
          width: 100%;
          background: #F7F3ED;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1A1A1A;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .pp-input:focus {
          border-color: #F5A623;
          background: #FFFDF8;
          box-shadow: 0 0 0 3px rgba(245,166,35,0.12);
        }
        .pp-input::placeholder { color: #B0A898; }

        .pp-label {
          display: block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9B8C7A; margin-bottom: 7px;
        }

        .pp-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #1A1A1A; color: #fff;
          font-size: 13px; font-weight: 600;
          padding: 11px 20px; border-radius: 13px;
          border: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .pp-btn-primary:hover { background: #333; transform: translateY(-1px); }
        .pp-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .pp-btn-secondary {
          display: inline-flex; align-items: center; gap: 7px;
          background: #FFF5E4; color: #8B6F47;
          font-size: 13px; font-weight: 600;
          padding: 11px 20px; border-radius: 13px;
          border: 1.5px solid #F0DFC0; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .pp-btn-secondary:hover { background: #FDECC8; transform: translateY(-1px); }

        .photo-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0); display: flex;
          align-items: center; justify-content: center;
          transition: background 0.25s;
          border-radius: inherit;
        }
        .photo-wrap:hover .photo-overlay { background: rgba(0,0,0,0.35); }
        .photo-overlay-icon {
          opacity: 0; transform: scale(0.85);
          transition: opacity 0.2s, transform 0.2s;
          color: #fff;
        }
        .photo-wrap:hover .photo-overlay-icon { opacity: 1; transform: scale(1); }

        .stat-icon-wrap {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .field-error { color: #D95F3B; font-size: 12px; margin-top: 5px; font-weight: 500; }

        .pp-divider {
          border: none; height: 1px;
          background: linear-gradient(to right, transparent, #E8E0D4, transparent);
          margin: 0;
        }
      `}</style>

      <div className="pp-root mx-auto max-w-7xl space-y-5">

        {/* ── PAGE HEADER ── */}
        <div className="pp-card p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF0D6]">
                <PawPrint className="h-7 w-7 text-[#F5A623]" />
              </div>
              <div>
                <span className="pp-chip">Pet profile</span>
                <h1 className="pp-serif mt-1.5 text-2xl font-700 leading-tight sm:text-3xl">
                  {primaryPet.name}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/medical-records" className="pp-btn-primary">
                <Stethoscope className="h-4 w-4" />
                Medical history
              </Link>
              <Link to="/medical-records/upload" className="pp-btn-secondary">
                Upload record <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6B6B6B]">
            Keep details current for bookings, reminders, and your care team. Upload a clear photo so everyone recognizes your companion.
          </p>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">

          {/* ── LEFT: Photo + Form ── */}
          <div className="pp-card overflow-hidden">

            {/* Photo section */}
            <div className="relative bg-gradient-to-br from-[#FFF4E0] to-[#FFE4B0] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">

                {/* Photo */}
                <label className="photo-wrap relative w-fit cursor-pointer">
                  <div className="overflow-hidden rounded-2xl shadow-lg" style={{ width: 160, height: 160 }}>
                    {primaryPet.photoUrl ? (
                      <img
                        src={primaryPet.photoUrl}
                        alt={primaryPet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#FDECC8]">
                        <PawPrint className="h-12 w-12 text-[#F5A623] opacity-50" />
                      </div>
                    )}
                    <div className="photo-overlay">
                      <Camera className="photo-overlay-icon h-7 w-7" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-700 uppercase tracking-widest text-[#B78331]">Primary pet</p>
                    <h2 className="pp-serif mt-1 text-3xl font-700 text-[#1A1A1A]">{primaryPet.name}</h2>
                    {primaryPet.breed && (
                      <p className="mt-1 text-sm font-500 text-[#8B6F47]">
                        {primaryPet.species} · {primaryPet.breed}
                      </p>
                    )}
                  </div>
                  <label className="pp-btn-secondary cursor-pointer text-sm">
                    <Camera className="h-4 w-4 text-[#F5A623]" />
                    {isUploadingPhoto ? "Uploading…" : "Change photo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <hr className="pp-divider" />

            {/* Form */}
            <form onSubmit={handlePetSubmit} className="p-6 sm:p-8">
              <h3 className="pp-serif mb-6 text-xl font-700 text-[#1A1A1A]">Pet details</h3>

              <div className="grid gap-5 sm:grid-cols-2">
                {formFields.map((field) => (
                  <div key={field.name} className={field.span ? "sm:col-span-2" : ""}>
                    <label className="pp-label">{field.label}</label>
                    <input
                      {...petForm.register(field.name)}
                      className="pp-input"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                    {petForm.formState.errors[field.name] && (
                      <p className="field-error">
                        {petForm.formState.errors[field.name]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="submit" disabled={isSavingPet} className="pp-btn-primary">
                  <Save className="h-4 w-4" />
                  {isSavingPet ? "Saving…" : "Save pet profile"}
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Stat cards ── */}
          <div className="flex flex-col gap-4">

            {/* Care plan */}
            <div className="pp-card p-5">
              <div className="flex items-center gap-3">
                <div className="stat-icon-wrap bg-[#FFF0D6]">
                  <Sparkles className="h-5 w-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-[11px] font-700 uppercase tracking-widest text-[#9B8C7A]">Plan</p>
                  <p className="pp-serif mt-0.5 text-xl font-700 text-[#1A1A1A]">
                    {primaryPet.planType || "Premium Care"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                Your current care plan covers bookings, reminders, and health tracking.
              </p>
            </div>

            {/* Preferred clinic */}
            <div className="pp-card p-5">
              <div className="flex items-center gap-3">
                <div className="stat-icon-wrap bg-[#E8F5E9]">
                  <ShieldCheck className="h-5 w-5 text-[#43A047]" />
                </div>
                <div>
                  <p className="text-[11px] font-700 uppercase tracking-widest text-[#9B8C7A]">Clinic</p>
                  <p className="pp-serif mt-0.5 text-xl font-700 text-[#1A1A1A]">
                    {primaryPet.preferredClinic || "Open choice"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                {primaryPet.preferredClinic
                  ? "Your preferred clinic is set for all future bookings."
                  : "Set a preferred clinic to speed up booking checkout."}
              </p>
            </div>

            {/* Health snapshot */}
            <div className="pp-card p-5">
              <div className="flex items-center gap-3">
                <div className="stat-icon-wrap bg-[#EDE7F6]">
                  <Stethoscope className="h-5 w-5 text-[#7B68EE]" />
                </div>
                <div>
                  <p className="text-[11px] font-700 uppercase tracking-widest text-[#9B8C7A]">Health snapshot</p>
                  <p className="pp-serif mt-0.5 text-xl font-700 text-[#1A1A1A]">
                    {primaryPet.vaccinationStatus || "Not set"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">
                {primaryPet.vaccinationStatus
                  ? "Vaccination status recorded in the profile."
                  : "Add vaccination details in the medical records section."}
              </p>
              <Link
                to="/medical-records"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-600 text-[#C87D2A]"
              >
                View records <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick tips */}
            <div className="pp-card bg-[#F7F3ED] p-5">
              <p className="text-[11px] font-700 uppercase tracking-widest text-[#9B8C7A]">Tips</p>
              <ul className="mt-3 space-y-2.5">
                {[
                  "A clear face photo helps vets recognize your pet faster.",
                  "Keep vaccination status updated for accurate health alerts.",
                  "A preferred clinic unlocks one-tap booking checkout.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A623]" />
                    <span className="text-sm leading-relaxed text-[#6B6B6B]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
