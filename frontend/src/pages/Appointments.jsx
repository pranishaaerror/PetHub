import { useState } from 'react'
import { useAppointment } from '../apis/appointment/hooks'
import { Listbox } from '@headlessui/react'
import { Button } from '../components/ui/button';
const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusConfig = {
    completed: {
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
        dot: "bg-emerald-500",
    },
    confirmed: {
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
        dot: "bg-blue-400",
    },
    pending: {
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
        dot: "bg-amber-400",
    },
    cancelled: {
        badge: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
        dot: "bg-red-400",
    },
};

function StatusDropdown({ value, onChange }) {
    const config = statusConfig[value] || statusConfig["pending"];
    return (
        <div className="relative">
            <Listbox value={value} onChange={onChange}>
                <Listbox.Button className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-75 ${config.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {value}
                    <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </Listbox.Button>

                <Listbox.Options className="absolute z-50 mt-2 w-40 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden focus:outline-none">
                    {statuses.map((status) => {
                        const cfg = statusConfig[status];
                        return (
                            <Listbox.Option
                                key={status}
                                value={status}
                                className={({ active }) =>
                                    `cursor-pointer select-none px-3 py-2.5 flex items-center gap-2.5 transition-colors ${active ? 'bg-gray-50' : 'bg-white'}`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        <span className="text-xs font-medium text-gray-700">{status}</span>
                                        {selected && (
                                            <svg className="w-3.5 h-3.5 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

export const Appointments = () => {
    const { data } = useAppointment();
    const [appointmentStatuses, setAppointmentStatuses] = useState({});

    const handleStatusChange = (id, newStatus) => {
        setAppointmentStatuses((prev) => ({ ...prev, [id]: newStatus }));
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">All Appointments</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-xl">
                                Time
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Pet & Owner
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Service
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-xl">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data?.data?.map((appointment) => (
                            <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatDateTime(appointment.appointmentTime)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(appointment.appointmentTime)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {appointment.userId.displayName || appointment.userId.email}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Owner
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {appointment.serviceId.serviceName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        ID: {appointment._id.slice(0, 8)}...
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusDropdown
                                        value={appointmentStatuses[appointment._id] || appointment.status}
                                        onChange={(newStatus) => handleStatusChange(appointment._id, newStatus)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Button className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <span className="text-xl font-bold">⋮</span>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
