import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Listbox } from '@headlessui/react';
import { PawPrint, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppointment, useUpdateAppointmentStatus, useDeleteAppointment } from '../apis/appointment/hooks';
import { PetHubLoader } from '../components/PetHubLoader';

const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusConfig = {
  completed: {
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    dot: 'bg-emerald-500',
    label: 'Completed',
  },
  confirmed: {
    badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
    dot: 'bg-purple-400',
    label: 'Confirmed',
  },
  pending: {
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    dot: 'bg-amber-400',
    label: 'Pending',
  },
  cancelled: {
    badge: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    dot: 'bg-red-400',
    label: 'Cancelled',
  },
};

const paymentTone = {
  paid:      'bg-emerald-50 text-emerald-700',
  unpaid:    'bg-amber-50 text-amber-700',
  failed:    'bg-red-50 text-red-700',
  cancelled: 'bg-stone-100 text-stone-500',
  initiated: 'bg-blue-50 text-blue-700',
};

function StatusDropdown({ value, onChange, disabled }) {
  const config = statusConfig[value] ?? statusConfig.pending;
  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Listbox.Button
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50 ${config.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
          {config.label}
          <svg className="w-2.5 h-2.5 opacity-50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Listbox.Button>
        <Listbox.Options className="absolute z-50 mt-1.5 w-32 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden focus:outline-none">
          {statuses.map((status) => {
            const cfg = statusConfig[status];
            return (
              <Listbox.Option
                key={status}
                value={status}
                className={({ active }) =>
                  `cursor-pointer select-none px-2.5 py-1.5 flex items-center gap-2 transition-colors ${active ? 'bg-gray-50' : 'bg-white'}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-xs font-medium text-gray-700">{cfg.label}</span>
                    {selected && (
                      <svg className="w-3 h-3 ml-auto text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </>
                )}
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}

function DeleteConfirmModal({ appointment, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5A623]/10 backdrop-blur-[3px] px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0D6] mx-auto">
          <PawPrint className="h-7 w-7 text-[#F5A623]" />
        </div>
        <h3 className="mt-4 text-center text-lg font-bold text-[#2D2D2D]">Remove this appointment?</h3>
        <p className="mt-2 text-center text-sm text-[#7A6A50]">
          Booking <span className="font-semibold text-[#2D2D2D]">{appointment.bookingId}</span> for{' '}
          <span className="font-semibold text-[#2D2D2D]">{appointment.petName}</span> will be permanently removed.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-[#E8D9C4] bg-white py-2.5 text-sm font-semibold text-[#5B4A36] hover:bg-[#FFF8EE] transition-colors disabled:opacity-50"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-[linear-gradient(135deg,#F5A623,#FFB347)] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,166,35,0.28)] hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isDeleting ? 'Removing…' : 'Yes, remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

const formatTime = (dateString) =>
  new Date(dateString).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const AdminAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const { data: appointmentsResponse, isLoading } = useAppointment();
  const { mutateAsync: updateStatus, isPending } = useUpdateAppointmentStatus();
  const { mutateAsync: deleteAppointment, isPending: isDeleting } = useDeleteAppointment();
  const [loadingId, setLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const appointments = appointmentsResponse?.data ?? [];

  const statusCounts = useMemo(
    () =>
      statuses.reduce((acc, s) => {
        acc[s] = appointments.filter((a) => a.status === s).length;
        return acc;
      }, {}),
    [appointments]
  );

  const handleStatusChange = async (appointmentId, status) => {
    setLoadingId(appointmentId);
    try {
      await updateStatus({ appointmentId, status });
      await queryClient.invalidateQueries({ queryKey: ['get-appointment'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(`Appointment marked as ${status}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAppointment(deleteTarget._id);
      await queryClient.invalidateQueries({ queryKey: ['get-appointment'] });
      toast.success('Appointment deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <PetHubLoader
        title="Loading Appointments"
        message="Preparing the live booking queue and admin action controls."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">

      {deleteTarget && (
        <DeleteConfirmModal
          appointment={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Confirm, complete, or cancel bookings. Status changes notify the user instantly.
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-5 py-4 border border-amber-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Total bookings</p>
          <p className="mt-1 text-3xl font-bold text-gray-800">{appointments.length}</p>
        </div>
      </div>

      {/* ── STAT CHIPS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statuses.map((s) => {
          const cfg = statusConfig[s];
          return (
            <div key={s} className={`rounded-2xl px-4 py-3 ring-1 ${cfg.badge}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <p className="text-xs font-semibold capitalize">{cfg.label}</p>
              </div>
              <p className="mt-1 text-2xl font-bold">{statusCounts[s] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date / Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pet & Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">

                  {/* Booking ID */}
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                      {appointment.bookingId}
                    </span>
                  </td>

                  {/* Date / Time */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatTime(appointment.appointmentTime)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(appointment.appointmentTime)}
                    </div>
                  </td>

                  {/* Pet & Owner */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{appointment.petName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {appointment.ownerName}
                    </div>
                    <div className="text-xs text-gray-400">{appointment.ownerEmail}</div>
                  </td>

                  {/* Service */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.serviceId?.serviceName ?? '—'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      NPR {appointment.payment?.amount ?? '—'}
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        paymentTone[appointment.payment?.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {appointment.payment?.status ?? 'unpaid'}
                    </span>
                  </td>

                  {/* Status dropdown */}
                  <td className="px-4 py-4">
                    <StatusDropdown
                      value={appointment.status}
                      onChange={(newStatus) => handleStatusChange(appointment._id, newStatus)}
                      disabled={isPending && loadingId === appointment._id}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setDeleteTarget(appointment)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B78331] hover:bg-[#FFF8EE] transition-colors"
                      title="Delete appointment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {appointments.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">
              No appointments in the system yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
