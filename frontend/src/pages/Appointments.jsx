import { Link } from "react-router-dom"
import { useAppointment } from '../apis/appointment/hooks'

export const Appointments = () => {
    const { data } = useAppointment();
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Owner</th>
                            <th>Service</th>
                            <th>Appointment Time</th>
                            <th>Status</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                       {data?.data?.map((appointment) => {
                        return(
                             <tr>
                            <td>{appointment._id}</td>
                            <td>{appointment.userId.name}</td>
                            <td>{appointment.serviceId.serviceName}</td>
                            <td>{appointment.appointmentTime}</td>
                            <td>{appointment.status}</td>
                            <td>{appointment.createdAt}</td>
                        </tr>
                        )
                       })}
                    </tbody>
                </table>
            </div>
        </>
    )

}
