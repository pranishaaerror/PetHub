import { useEffect } from "react";
import { Camera, PawPrint, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useMyAdoptionRequests } from "../apis/adoptionRequests/hooks";
import { useAppointment } from "../apis/appointment/hooks";
import { useCurrentUser, useUpdateCurrentUser } from "../apis/users/hooks";
import { useMyPets, useUpdatePet, useUploadPetPhoto } from "../apis/pets/hooks";

const ownerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
});

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

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { data: userResponse, isLoading: isUserLoading } = useCurrentUser();
  const { data: petsResponse, isLoading: isPetsLoading } = useMyPets();
  const { data: appointmentsResponse } = useAppointment();
  const { data: adoptionRequestsResponse } = useMyAdoptionRequests();
  const { mutateAsync: updateCurrentUser, isPending: isSavingUser } = useUpdateCurrentUser();
  const { mutateAsync: updatePet, isPending: isSavingPet } = useUpdatePet();
  const { mutateAsync: uploadPetPhoto, isPending: isUploadingPhoto } = useUploadPetPhoto();

  const user = userResponse?.data;
  const primaryPet = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;
  const recentAppointments = (appointmentsResponse?.data ?? []).slice(0, 3);
  const recentAdoptionRequests = (adoptionRequestsResponse?.data ?? []).slice(0, 3);

  const ownerForm = useForm({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
    },
  });

  const petForm = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      gender: "",
      age: "",
      weight: "",
      color: "",
      vaccinationStatus: "",
      preferredClinic: "",
    },
  });

  useEffect(() => {
    if (user) {
      ownerForm.reset({
        fullName: user.fullName || user.displayName || "",
        phoneNumber: user.phoneNumber || user.contactNumber || "",
      });
    }
  }, [ownerForm, user]);

  useEffect(() => {
    if (primaryPet) {
      petForm.reset({
        name: primaryPet.name || "",
        species: primaryPet.species || "",
        breed: primaryPet.breed || "",
        gender: primaryPet.gender || "",
        age: primaryPet.age || "",
        weight: primaryPet.weight || "",
        color: primaryPet.color || "",
        vaccinationStatus: primaryPet.vaccinationStatus || "",
        preferredClinic: primaryPet.preferredClinic || "",
      });
    }
  }, [petForm, primaryPet]);

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
      queryClient.invalidateQueries({ queryKey: ["my-pets"] }),
    ]);
  };

  const handleOwnerSubmit = ownerForm.handleSubmit(async (values) => {
    try {
      await updateCurrentUser(values);
      await refreshData();
      toast.success("Your owner profile has been updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  const handlePetSubmit = petForm.handleSubmit(async (values) => {
    if (!primaryPet) {
      toast.error("No primary pet profile found yet.");
      return;
    }

    try {
      await updatePet({
        id: primaryPet._id,
        data: values,
      });
      await refreshData();
      toast.success("Your pet profile has been updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !primaryPet) {
      return;
    }

    try {
      await uploadPetPhoto({
        id: primaryPet._id,
        file,
      });
      await refreshData();
      toast.success("Pet photo updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (isUserLoading || isPetsLoading) {
    return (
      <PetHubLoader
        title="Loading Profile"
        message="Bringing together your account, pet profile, and shared status updates."
      />
    );
  }

  if (!user) {
    return (
      <div className="pet-page">
        <EmptyState
          eyebrow="Profile"
          title="Your profile is not ready yet."
          description="Sign in again and PetHub will rebuild your profile session."
        />
      </div>
    );
  }

  return (
    <div className="pet-page">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-6">
          <div className="pet-card overflow-hidden p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="pet-chip">Profile</span>
                <h1 className="mt-4 text-4xl font-bold leading-tight">Everything personal, in one premium place.</h1>
              </div>
              <UserRound className="h-8 w-8 text-[#F5A623]" />
            </div>

            <div className="mt-6 rounded-[28px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-xl font-bold text-white">
                  {(user.fullName || user.displayName || user.email || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.fullName || user.displayName || "Pet Parent"}</p>
                  <p className="mt-1 text-sm text-[#6B6B6B]">{user.email}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">PetHub ID</p>
                  <p className="mt-2 text-lg font-semibold">{user.petHubId}</p>
                </div>
                <div className="rounded-[22px] bg-white px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
                  <p className="text-sm text-[#8B7B66]">Onboarding</p>
                  <p className="mt-2 text-lg font-semibold">
                    {user.onboardingCompleted ? "Complete" : "Needs attention"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pet-card p-6">
            <span className="pet-chip">Shared Status Center</span>
            <p className="mt-4 text-2xl font-bold">Updates from the PetHub care team and admin review.</p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">
                  Recent Bookings
                </p>
                <div className="mt-4 space-y-3">
                  {recentAppointments.length ? (
                    recentAppointments.map((appointment) => (
                      <div key={appointment._id} className="rounded-[20px] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(45,45,45,0.04)]">
                        <p className="text-sm font-semibold text-[#2D2D2D]">
                          {appointment.petName} · {appointment.serviceId?.serviceName || "Service"}
                        </p>
                        <p className="mt-1 text-sm text-[#6B6B6B]">
                          {new Date(appointment.appointmentTime).toLocaleString()}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#B78331]">
                          {appointment.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-[#6B6B6B]">
                      Bookings you create and status updates from admin will appear here.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[26px] bg-[#FFF8EE] p-5 shadow-[0_16px_35px_rgba(45,45,45,0.04)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">
                  Adoption Requests
                </p>
                <div className="mt-4 space-y-3">
                  {recentAdoptionRequests.length ? (
                    recentAdoptionRequests.map((request) => (
                      <div key={request._id} className="rounded-[20px] bg-white px-4 py-4 shadow-[0_12px_24px_rgba(45,45,45,0.04)]">
                        <p className="text-sm font-semibold text-[#2D2D2D]">
                          {request.petId?.petName || "Adoption profile"}
                        </p>
                        <p className="mt-1 text-sm text-[#6B6B6B]">
                          {request.message || "Your request is on file in PetHub."}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#B78331]">
                          {request.status}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-[#6B6B6B]">
                      Adoption requests and admin review decisions will appear here.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pet-card p-6">
            <span className="pet-chip">Owner Details</span>
            <form onSubmit={handleOwnerSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Full name</span>
                <input
                  {...ownerForm.register("fullName")}
                  className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
                {ownerForm.formState.errors.fullName ? (
                  <span className="mt-2 block text-sm text-[#C45F3E]">
                    {ownerForm.formState.errors.fullName.message}
                  </span>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#5B544C]">Phone number</span>
                <input
                  {...ownerForm.register("phoneNumber")}
                  className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                />
              </label>
              <Button type="submit" disabled={isSavingUser} className="pet-button-primary gap-2">
                <Save className="h-4 w-4" />
                {isSavingUser ? "Saving..." : "Save owner profile"}
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6">
          {primaryPet ? (
            <>
              <div className="pet-card overflow-hidden p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="pet-chip">Primary Pet</span>
                    <h2 className="mt-4 text-3xl font-bold">{primaryPet.name}</h2>
                    <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                      Your pet photo appears across reminders, dashboard highlights, and booking details.
                    </p>
                  </div>
                  <PawPrint className="h-7 w-7 text-[#F5A623]" />
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
                  <div>
                    <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#FFE4B8,#F5A623)]">
                      {primaryPet.photoUrl ? (
                        <img src={primaryPet.photoUrl} alt={primaryPet.name} className="h-72 w-full object-cover" />
                      ) : (
                        <div className="flex h-72 items-center justify-center text-white">
                          <PawPrint className="h-14 w-14" />
                        </div>
                      )}
                    </div>
                    <label className="pet-button-secondary mt-4 cursor-pointer gap-2">
                      <Camera className="h-4 w-4 text-[#F5A623]" />
                      {isUploadingPhoto ? "Uploading..." : "Change pet photo"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>

                  <form onSubmit={handlePetSubmit} className="grid gap-4 sm:grid-cols-2">
                    {[
                      { name: "name", label: "Pet name" },
                      { name: "species", label: "Species" },
                      { name: "breed", label: "Breed" },
                      { name: "gender", label: "Gender" },
                      { name: "age", label: "Age" },
                      { name: "weight", label: "Weight" },
                      { name: "color", label: "Color" },
                      { name: "vaccinationStatus", label: "Vaccination status" },
                      { name: "preferredClinic", label: "Preferred clinic" },
                    ].map((field) => (
                      <label key={field.name} className="block">
                        <span className="mb-2 block text-sm font-semibold text-[#5B544C]">{field.label}</span>
                        <input
                          {...petForm.register(field.name)}
                          className="w-full rounded-[22px] bg-[#F8F1E6] px-4 py-4 text-sm outline-none ring-2 ring-transparent transition focus:ring-[#F5C062]"
                        />
                        {petForm.formState.errors[field.name] ? (
                          <span className="mt-2 block text-sm text-[#C45F3E]">
                            {petForm.formState.errors[field.name]?.message}
                          </span>
                        ) : null}
                      </label>
                    ))}
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <button type="submit" disabled={isSavingPet} className="pet-button-primary gap-2">
                        <Save className="h-4 w-4" />
                        {isSavingPet ? "Saving pet..." : "Save pet profile"}
                      </button>
                      <div className="pet-button-secondary gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#F5A623]" />
                        Multiple pets can be added later
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Plan", value: primaryPet.planType || "Premium Care", icon: Sparkles },
                  { label: "Clinic", value: primaryPet.preferredClinic || "Open choice", icon: ShieldCheck },
                  { label: "Status", value: primaryPet.vaccinationStatus || "Needs review", icon: PawPrint },
                ].map((item) => (
                  <div key={item.label} className="pet-card p-5">
                    <item.icon className="h-6 w-6 text-[#F5A623]" />
                    <p className="mt-4 text-sm text-[#8B7B66]">{item.label}</p>
                    <p className="mt-1 text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              eyebrow="Pet Profile"
              title="No pet profile yet."
              description="Complete onboarding first so your dashboard, bookings, and reminders have a pet to work from."
            />
          )}
        </div>
      </section>
    </div>
  );
};
