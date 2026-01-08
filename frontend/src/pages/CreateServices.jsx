

import { useState } from "react";
import { useCreateServices } from "../apis/services/hooks";
import { useNavigate } from "react-router-dom";
export const CreateSetvices = () => {
    const { mutateAsync, isPending } = useCreateServices()
    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setPrice] = useState("");
const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
    await mutateAsync({
        serviceName,
        price:servicePrice
    })
    navigate("/services")
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-4 text-center">Add Service</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Name
                        </label>
                        <input
                            type="text"
                            value={serviceName}
                            onChange={(e) => setServiceName(e.target.value)}
                            placeholder="Enter service name"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Price
                        </label>
                        <input
                            type="number"
                            value={servicePrice}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Add Service
                    </button>
                </form>

               
            </div>
        </div>
    );
}
