import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from "@tanstack/react-query";
import { Listbox } from "@headlessui/react";
import { Mail, PawPrint, Phone, Plus, ShieldCheck, Trash2, ChevronDown, X, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { PetHubLoader } from "../components/PetHubLoader";
import { useUsers, useAdminUpdateUser, useAdminDeleteUser, useAdminCreateUser } from "../apis/users/hooks";

const ROLES = ["user", "admin", "veterinarian"];

const roleConfig = {
  admin: { tone: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20", dot: "bg-purple-400" },
  user: { tone: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20", dot: "bg-amber-400" },
  veterinarian: { tone: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20", dot: "bg-emerald-500" },
  groomer: { tone: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20", dot: "bg-blue-400" },
};

function RoleDropdown({ value, onChange, disabled }) {
  const { tone, dot } = roleConfig[value] ?? roleConfig.user;
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(true);
  };

  const handleSelect = (role) => {
    onChange(role);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 ${tone}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="capitalize">{value}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      {open && createPortal(
        <ul
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="w-40 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden"
        >
          {ROLES.map((role) => {
            const isSelected = role === value;
            return (
              <li
                key={role}
                onMouseDown={() => handleSelect(role)}
                className="cursor-pointer select-none px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${roleConfig[role].dot}`} />
                <span className="text-xs font-medium text-gray-700 capitalize">{role}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-gray-400" />}
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </>
  );
}

function CreateUserModal({ onClose, onSave, isSaving }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Full name, email, and password are required.");
      return;
    }
    onSave(form);
  };

  const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0D6]">
              <PawPrint className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2D2D]">Add New User</h3>
              <p className="text-xs text-gray-400">Create a PetHub account directly</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name <span className="text-amber-500">*</span></label>
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email <span className="text-amber-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password <span className="text-amber-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={`${inputCls} pr-10`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}>
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all">
              {isSaving ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onConfirm, onCancel, isPending }) {
  const displayName = user.fullName || user.displayName || user.email;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0D6]">
            <PawPrint className="h-5 w-5 text-[#F5A623]" />
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h3 className="mt-4 text-lg font-bold text-[#2D2D2D]">Remove user?</h3>
        <p className="mt-2 text-sm text-[#7A6A50]">
          <span className="font-semibold text-[#2D2D2D]">{displayName}</span>{" "}
          will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const AdminUsersPage = () => {
  const queryClient = useQueryClient();
  const { data: usersResponse, isLoading } = useUsers();
  const { mutateAsync: updateUser, isPending: isUpdating } = useAdminUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeleting } = useAdminDeleteUser();
  const { mutateAsync: createUser, isPending: isCreating } = useAdminCreateUser();

  const [loadingId, setLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const users = usersResponse?.data ?? [];

  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length;
    return acc;
  }, {});

  const handleRoleChange = async (userId, role) => {
    setLoadingId(userId);
    try {
      await updateUser({ userId, role });
      await queryClient.invalidateQueries({ queryKey: ["get-users"] });
      toast.success(`Role updated to ${role}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleDisabled = async (user) => {
    setLoadingId(user._id);
    try {
      await updateUser({ userId: user._id, disabled: !user.disabled });
      await queryClient.invalidateQueries({ queryKey: ["get-users"] });
      toast.success(`User ${!user.disabled ? "disabled" : "enabled"}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser({ userId: deleteTarget._id });
      await queryClient.invalidateQueries({ queryKey: ["get-users"] });
      toast.success("User deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleCreateUser = async (data) => {
    try {
      await createUser(data);
      await queryClient.invalidateQueries({ queryKey: ["get-users"] });
      toast.success("User created successfully.");
      setShowCreateModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Users"
        message="Pulling PetHub accounts and their current onboarding status."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateUser}
          isSaving={isCreating}
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage roles, account status, and remove users from the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 px-5 py-4 border border-amber-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Total users</p>
            <p className="mt-1 text-3xl font-bold text-gray-800">{users.length}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLES.map((role) => (
          <div key={role} className={`rounded-2xl px-4 py-3 ring-1 ${roleConfig[role].tone}`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${roleConfig[role].dot}`} />
              <p className="text-xs font-semibold capitalize">{role}</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{roleCounts[role] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["User", "Contact", "Account", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const name = user.fullName || user.displayName || "—";
                const initial = (user.fullName || user.displayName || user.email || "P").trim().charAt(0).toUpperCase();
                const isRowLoading = loadingId === user._id;

                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-white">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.petHubId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {user.phoneNumber || user.contactNumber || "No phone"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-gray-600">
                          <PawPrint className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {user.authProvider || "local"}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-gray-500">
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          {user.onboardingCompleted ? "Onboarded" : "Pending onboarding"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <RoleDropdown
                        value={user.role}
                        onChange={(role) => handleRoleChange(user._id, role)}
                        disabled={isRowLoading || isUpdating}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleDisabled(user)}
                        disabled={isRowLoading || isUpdating}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 ${user.disabled
                          ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.disabled ? "bg-red-400" : "bg-emerald-500"}`} />
                        {user.disabled ? "Disabled" : "Active"}
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteTarget(user)}
                        disabled={isRowLoading}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#B78331] hover:bg-[#FFF8EE] transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">
              No users have been synced yet.
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
};