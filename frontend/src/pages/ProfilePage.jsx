import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  PawPrint,
  Phone,
  Save,
  Shield,
  UserRound,
  XCircle,
} from "lucide-react";
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
import { useMyPets } from "../apis/pets/hooks";

/* ── schema ──────────────────────────────────────────────────────────────── */
const ownerSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phoneNumber: z.string().optional(),
});

/* ── small helpers ───────────────────────────────────────────────────────── */
const appointmentStatusMeta = {
  confirmed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50",  label: "Confirmed" },
  pending:   { icon: Clock3,       color: "text-amber-500",   bg: "bg-amber-50",    label: "Pending"   },
  cancelled: { icon: XCircle,      color: "text-rose-400",    bg: "bg-rose-50",     label: "Cancelled" },
  completed: { icon: CheckCircle2, color: "text-sky-500",     bg: "bg-sky-50",      label: "Completed" },
};

const adoptionStatusMeta = {
  pending:   { color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",  label: "Pending"  },
  approved:  { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Approved" },
  rejected:  { color: "text-stone-500",   bg: "bg-stone-100",  border: "border-stone-200",   label: "Closed"   },
  cancelled: { color: "text-stone-500",   bg: "bg-stone-100",  border: "border-stone-200",   label: "Cancelled"},
};

const AppointmentRow = ({ appointment }) => {
  const key = appointment.status?.toLowerCase();
  const meta = appointmentStatusMeta[key] ?? appointmentStatusMeta.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(45,45,45,0.05)]">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
        <StatusIcon className={`h-4 w-4 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#2D2D2D]">
          {appointment.petName} · {appointment.serviceId?.serviceName || "Service"}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#9A8A6A]">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {new Date(appointment.appointmentTime).toLocaleString()}
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
        {meta.label}
      </span>
    </div>
  );
};

const AdoptionRow = ({ request }) => {
  const key = request.status?.toLowerCase();
  const meta = adoptionStatusMeta[key] ?? adoptionStatusMeta.pending;

  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${meta.bg} ${meta.border}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/70">
        <HeartHandshake className={`h-4 w-4 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#2D2D2D]">
          {request.petId?.petName || "Adoption profile"}
        </p>
        <p className="mt-1 line-clamp-1 text-xs text-[#9A8A6A]">
          {request.message || "Your request is on file in PetHub."}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.color}`}>
        {meta.label}
      </span>
    </div>
  );
};

/* ── page ─────────────────────────────────────────────────────────────────── */
export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const { data: userResponse, isLoading: isUserLoading }   = useCurrentUser();
  const { data: petsResponse, isLoading: isPetsLoading }   = useMyPets();
  const { data: appointmentsResponse }                     = useAppointment();
  const { data: adoptionRequestsResponse }                 = useMyAdoptionRequests();
  const { mutateAsync: updateCurrentUser, isPending: isSavingUser } = useUpdateCurrentUser();

  const user                 = userResponse?.data;
  const primaryPet           = petsResponse?.data?.primaryPet ?? petsResponse?.data?.pets?.[0] ?? null;
  const recentAppointments   = (appointmentsResponse?.data ?? []).slice(0, 5);
  const recentAdoptionReqs   = (adoptionRequestsResponse?.data ?? []).slice(0, 3);

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

      {/* ── HERO / IDENTITY CARD ─────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)]">
        <div className="grid xl:grid-cols-[1fr_320px]">

          {/* left — user info */}
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

            {/* info chips row */}
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

          {/* right — pet quick-access panel */}
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

      {/* ── PET PROFILE SHORTCUT (mobile / non-xl) ───────────────────── */}
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

      {/* ── BOOKINGS + ADOPTION ──────────────────────────────────────── */}
      <section className="rounded-[28px] bg-white p-6 shadow-[0_6px_28px_rgba(45,45,45,0.07)] md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#F5A623]" />
          <h2 className="text-xl font-bold text-[#2D2D2D]">Booking history</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">

          {/* appointments */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">
                Appointments
              </p>
              <Link
                to="/appointments"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5A623] hover:underline"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentAppointments.length ? (
                recentAppointments.map((a) => <AppointmentRow key={a._id} appointment={a} />)
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#FAF6EF] py-8 text-center">
                  <CalendarDays className="h-8 w-8 text-[#F5C978]" />
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D2D]">No bookings yet</p>
                    <p className="mt-1 text-xs text-[#9A8A6A]">
                      <Link to="/services" className="font-semibold text-[#F5A623] hover:underline">
                        Book a service
                      </Link>{" "}
                      to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* adoption requests */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B78331]">
                Adoption requests
              </p>
              <Link
                to="/dashboard/adoption"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5A623] hover:underline"
              >
                Gallery <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentAdoptionReqs.length ? (
                recentAdoptionReqs.map((r) => <AdoptionRow key={r._id} request={r} />)
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-[#FAF6EF] py-8 text-center">
                  <HeartHandshake className="h-8 w-8 text-[#F5C978]" />
                  <div>
                    <p className="text-sm font-semibold text-[#2D2D2D]">No requests yet</p>
                    <p className="mt-1 text-xs text-[#9A8A6A]">
                      Admin decisions will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── EDIT PERSONAL INFO ───────────────────────────────────────── */}
      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_28px_rgba(45,45,45,0.07)]">
        <div className="grid xl:grid-cols-[1fr_1fr]">

          {/* form */}
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

          {/* decorative right side */}
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
