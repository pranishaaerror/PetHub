import { Mail, PawPrint, Phone, ShieldCheck, Users } from "lucide-react";
import { PetHubLoader } from "../components/PetHubLoader";
import { useUsers } from "../apis/users/hooks";

export const AdminUsersPage = () => {
  const { data: usersResponse, isLoading } = useUsers();
  const users = usersResponse?.data ?? [];

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Users"
        message="Pulling PetHub accounts and their current onboarding status."
      />
    );
  }

  return (
    <div className="pet-page">
      <section className="pet-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="pet-chip">Users</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Pet parents and admins in one clear view.</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#6B6B6B]">
              Review onboarding progress, contact information, and account role without leaving the
              premium admin workspace.
            </p>
          </div>
          <div className="rounded-[24px] bg-[linear-gradient(145deg,#FFF4E2,#FFFFFF)] p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B78331]">Total users</p>
            <p className="mt-2 text-4xl font-bold">{users.length}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {users.map((user) => (
          <article key={user._id} className="pet-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-lg font-bold text-white shadow-[0_18px_35px_rgba(245,166,35,0.24)]">
                {(user.fullName || user.displayName || user.email || "P").trim().charAt(0).toUpperCase()}
              </div>
              <span className="pet-chip">{user.role}</span>
            </div>

            <h2 className="mt-5 text-2xl font-bold">{user.fullName || user.displayName || "PetHub Member"}</h2>
            <div className="mt-5 space-y-3 text-sm text-[#6B6B6B]">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#F5A623]" />
                {user.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#F5A623]" />
                {user.phoneNumber || user.contactNumber || "No phone saved"}
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#F5A623]" />
                {user.onboardingCompleted ? "Onboarding completed" : "Onboarding pending"}
              </p>
              <p className="flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-[#F5A623]" />
                {user.authProvider || "local"} account
              </p>
            </div>

            <div className="mt-5 rounded-[22px] bg-[#FFF8EE] px-4 py-4 shadow-[0_14px_28px_rgba(45,45,45,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A97C3A]">Created</p>
              <p className="mt-2 text-sm font-semibold text-[#2D2D2D]">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </article>
        ))}

        {!users.length ? (
          <div className="pet-card p-8 text-center text-[#6B6B6B] md:col-span-2 2xl:col-span-3">
            No users have been synced yet.
          </div>
        ) : null}
      </section>
    </div>
  );
};
