import { Link } from "react-router-dom"
import { useServices } from "../apis/services/hooks"

export const ServiceManagement = () => {
const {data} = useServices()
    return (
        <>

            <div className="flex gap-3">
                <Link to ="/services/create" className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md text-sm hover:bg-gray-100">
                    Create New
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#dbe6dd] dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a3320]">
                            <th className="py-4 px-6 text-[#618968] dark:text-gray-400 text-xs font-bold uppercase tracking-wider w-24">ID</th>
                            <th className="py-4 px-6 text-[#618968] dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Service Name</th>
                            <th className="py-4 px-6 text-[#618968] dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Price</th>
                            <th className="py-4 px-6 text-[#618968] dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbe6dd] dark:divide-gray-800">
                       {data?.data?.map((service) => {
                        return(
                             <tr key={service._id} className="group hover:bg-gray-50 dark:hover:bg-[#1f3d25] transition-colors">
                            <td className="py-4 px-6">
                                <span className="text-[#111812] dark:text-gray-200 font-bold text-sm">{service._id}</span>
                            </td>
                            <td className="py-4 px-6">
                                <span className="text-[#111812] dark:text-gray-200 font-bold text-sm">{service.serviceName}</span>
                            </td>
                            <td className="py-4 px-6">
                                                              <span className="text-[#111812] dark:text-gray-200 font-bold text-sm">{service.price}</span>

                            </td>
                            <td className="py-4 px-6">
                                                                <span className="text-[#111812] dark:text-gray-200 font-bold text-sm">{service.createdAt}</span>

                            </td>
                           
                        </tr>
                        )
                       })}
                    </tbody>
                </table>
            </div>
        </>
    )

}
