import { Link } from "react-router-dom"
import { useServices } from "../apis/services/hooks"
import { useCreateServices } from "../apis/services/hooks"
import {  Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/Button";

export const ServiceManagement = () => {
    let [isOpen, setIsOpen] = useState(false)
    const [serviceName, setServiceName] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");
    const [servicePrice, setPrice] = useState("");
    const queryClient = useQueryClient()
    const { data } = useServices()
    const { mutateAsync, isPending } = useCreateServices()
    const navigate = useNavigate()

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await mutateAsync({ serviceName, description: serviceDescription, price: servicePrice });
        queryClient.invalidateQueries({
           queryKey:["get-services"]
        })
        setIsOpen(false);
        setServiceName("");
        setServiceDescription("");
        setPrice("");
        navigate("/admin/services");
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 bg-[#f9c073] text-gray-900 rounded-lg text-sm font-medium hover:bg-[#f0b165] transition-colors"
                >
                    + Create New Service
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Service Name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data?.data?.map((service) => (
                            <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-xs text-gray-500 font-mono">
                                        {service._id.slice(0, 8)}...
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {service.serviceName}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-900">
                                        NPR {service.price}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500">
                                        {formatDate(service.createdAt)}
                                    </span>
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

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black/50">
                    <DialogPanel className="max-w-lg w-full space-y-4 border bg-white p-12 rounded-md">
                        <DialogTitle className="font-bold text-xl">Add Service</DialogTitle>

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
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={serviceDescription}
                                    onChange={(e) => setServiceDescription(e.target.value)}
                                    placeholder="Enter service description"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Service Price (NPR)
                                </label>
                                <input
                                    type="text"
                                    value={servicePrice}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Enter price"
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 px-4 py-2 bg-[#f9c073] text-gray-900 rounded-md hover:bg-[#f0b165] transition disabled:opacity-50"
                                >
                                    {isPending ? "Adding..." : "Add Service"}
                                </Button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

        </div>
    )
}
