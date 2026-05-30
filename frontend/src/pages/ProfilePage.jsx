import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  HeartHandshake,
  PawPrint,
  Phone,
  Save,
  Shield,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EmptyState } from "../components/EmptyState";
import { PetHubLoader } from "../components/PetHubLoader";
import { useCurrentUser, useUpdateCurrentUser } from "../apis/users/hooks";
import { useMyPets } from "../apis/pets/hooks";


const ownerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
});

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { data: userResponse, isLoading: isUserLoading } = useCurrentUser();
  const { data: petsResponse, isLoading: isPetsLoading } = useMyPets();
  const { mutateAsync: updateCurrentUser, isPending: isSavingUser } = useUpdateCurrentUser();

  const user       = userResponse?.data;
  const primaryPet = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;

  const ownerForm = useForm({
    resolver: zodResolver(ownerSchema),
    defaultValues: { fullName: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (user) {
      ownerForm.reset({
        fullName:    user.fullName    || user.displayName || "",
        phoneNumber: user.phoneNumber || user.contactNumber || "",
      });
    }
  }, [ownerForm, user]);

  const handleOwnerSubmit = ownerForm.handleSubmit(async (values) => {
    try {
      await updateCurrentUser(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["current-user"] }),
        queryClient.invalidateQueries({ queryKey: ["my-pets"] }),
      ]);
      toast.success("Your profile has been updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  if (isUserLoading || isPetsLoading) {
    return (
      <PetHubLoader
        title="Loading Profile"
        message="Bringing together your account and booking history."
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

  const displayName  = user.fullName || user.displayName || "Pet Parent";
  const userInitial  = displayName.trim().charAt(0).toUpperCase();
  const roleLabel    =
    user.role === "veterinarian" ? "Veterinarian" :
    user.role === "admin"        ? "Administrator" :
                                   "Pet Parent";

  return (
    <div className="space-y-5 pb-10">

  
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)]">
        <div className="grid xl:grid-cols-[1fr_320px]">

          <div className="flex flex-col justify-center gap-5 p-6 md:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF5E0] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#B78331]">
              <UserRound className="h-3.5 w-3.5" />
              My Profile
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-2xl font-bold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)]">
                {userInitial}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2D2D2D] sm:text-3xl">{displayName}</h1>
                <p className="mt-0.5 text-sm text-[#9A8A6A]">{user.email}</p>
              </div>
            </div>

        
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-[#FFF5E0] px-4 py-2.5">
                <Shield className="h-4 w-4 text-[#F5A623]" />
                <div>
                  <p className="text-[11px] text-[#9A8A6A]">PetHub ID</p>
                  <p className="text-sm font-bold text-[#2D2D2D]">{user.petHubId || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-[#FFF5E0] px-4 py-2.5">
                <UserRound className="h-4 w-4 text-[#F5A623]" />
                <div>
                  <p className="text-[11px] text-[#9A8A6A]">Account type</p>
                  <p className="text-sm font-bold text-[#2D2D2D]">{roleLabel}</p>
                </div>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 rounded-2xl bg-[#FFF5E0] px-4 py-2.5">
                  <Phone className="h-4 w-4 text-[#F5A623]" />
                  <div>
                    <p className="text-[11px] text-[#9A8A6A]">Phone</p>
                    <p className="text-sm font-bold text-[#2D2D2D]">{user.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden xl:flex flex-col justify-center gap-4 bg-[linear-gradient(145deg,#FFF8EC,#FFE9A8)] p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">
              Your pets
            </p>

            {primaryPet ? (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(45,45,45,0.08)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#F5A623,#FFB347)]">
                  <PawPrint className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#2D2D2D]">{primaryPet.name}</p>
                  <p className="mt-0.5 truncate text-xs text-[#9A8A6A]">
                    {primaryPet.breed || primaryPet.species || "Pet"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[#F5C978] bg-white/50 p-5 text-center">
                <PawPrint className="mx-auto h-8 w-8 text-[#F5A623]/50" />
                <p className="mt-2 text-xs font-semibold text-[#9A8A6A]">No pet added yet</p>
              </div>
            )}

            <Link
              to="/pet-profile"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F5A623] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.26)] transition-all hover:bg-[#e09515]"
            >
              <PawPrint className="h-4 w-4" />
              {primaryPet ? "Edit pet profile" : "Add your pet"}
            </Link>

            <div className="rounded-2xl bg-white/60 px-4 py-3 text-center">
              <p className="text-[11px] text-[#9A8A6A]">
                Pet photos and medical history live under Pet Profile.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="xl:hidden flex items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-[0_4px_18px_rgba(45,45,45,0.07)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#FFF5E0]">
            <PawPrint className="h-5 w-5 text-[#F5A623]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#2D2D2D]">
              {primaryPet ? primaryPet.name : "No pet added yet"}
            </p>
            <p className="text-xs text-[#9A8A6A]">
              {primaryPet ? "Edit details and photo" : "Add your pet to unlock dashboard"}
            </p>
          </div>
        </div>
        <Link
          to="/pet-profile"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E0] px-4 py-2 text-xs font-semibold text-[#8B6428] transition hover:bg-[#FFE9A8]"
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)]">
        <div className="grid xl:grid-cols-[1fr_1fr]">

        
          <div className="p-6 md:p-8">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#FFF5E0]">
                <UserRound className="h-4 w-4 text-[#F5A623]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">Personal info</p>
                <h2 className="text-lg font-bold text-[#2D2D2D]">Edit your details</h2>
              </div>
            </div>

            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-[#5B544C]">Full name</span>
                <input
                  {...ownerForm.register("fullName")}
                  className="w-full rounded-2xl bg-[#FAF6EF] px-4 py-3.5 text-sm text-[#2D2D2D] outline-none ring-1 ring-[#EDD9A3] transition placeholder:text-[#B0997A] focus:ring-[#F5A623]"
                  placeholder="Your full name"
                />
                {ownerForm.formState.errors.fullName && (
                  <span className="mt-1.5 block text-xs font-medium text-rose-500">
                    {ownerForm.formState.errors.fullName.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#5B544C]">
                  <Phone className="h-3.5 w-3.5 text-[#F5A623]" />
                  Phone number
                </span>
                <input
                  {...ownerForm.register("phoneNumber")}
                  className="w-full rounded-2xl bg-[#FAF6EF] px-4 py-3.5 text-sm text-[#2D2D2D] outline-none ring-1 ring-[#EDD9A3] transition placeholder:text-[#B0997A] focus:ring-[#F5A623]"
                  placeholder="e.g. +977 98XXXXXXXX"
                />
              </label>

              <button
                type="submit"
                disabled={isSavingUser}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F5A623] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(245,166,35,0.26)] transition-all hover:bg-[#e09515] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {isSavingUser ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>

         
          <div className="hidden xl:flex flex-col justify-center gap-4 bg-[linear-gradient(145deg,#FAF6EF,#FFF5E0)] p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">
              Keep it current
            </p>
            <p className="text-sm leading-7 text-[#7A6A50]">
              Your name and phone number help vets and groomers identify you quickly at appointments,
              and keep adoption coordinators in the loop.
            </p>
            <div className="space-y-2.5">
              {[
                { icon: CalendarDays, text: "Faster check-in at appointments" },
                { icon: HeartHandshake, text: "Adoption coordinators can reach you" },
                { icon: Shield, text: "Your data stays within PetHub" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0 text-[#F5A623]" />
                  <p className="text-sm text-[#5B544C]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
