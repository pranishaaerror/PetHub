const appointments = [
    {
        time: "09:00 AM",
        pet: "Max",
        owner: "Ishan",
        service: "Full Groom Package",
        duration: "60 min",
        price: " NPR 600",
        groomer: "Ronish",
        status: "Completed",
    },
    {
        time: "10:15 AM",
        pet: "Luna",
        owner: "Ishan",
        service: "Nail Trim & Ear Cleaning",
        duration: "30 min",
        price: "NPR 600",
        groomer: "Isha",
        status: "In Progress",
    },
    {
        time: "11:30 AM",
        pet: "Rocky",
        owner: "Ishan",
        service: "Bathing",
        duration: "90 min",
        price: "NPR 600",
        groomer: "Pranisha",
        status: "Pending",
    },
];

const statusStyles = {
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
};

export const Groomer = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Groomer Appointments</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Pet & Owner
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Service
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Groomer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {appointments.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {item.time}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {item.pet}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.owner}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.service}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {item.duration} • {item.price}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {item.groomer}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${statusStyles[item.status]}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <span className="text-xl font-bold">⋮</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};