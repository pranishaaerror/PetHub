import { axiosInstance } from "../axios";

export const createAppointment = ({
    appointmentTime,
    serviceId,
    ownerName,
    contactNumber,
    petName,
    petType,
    note,
}) => axiosInstance.request({
    
    url:"/appointments",
    method:"POST",
    data:{
        appointmentTime,
        serviceId,
        ownerName,
        contactNumber,
        petName,
        petType,
        note,
    }
    
})
export const listAppointment = ()=> axiosInstance.request({
    url:"/appointments",
    method:"GET",
  
})

export const updateAppointmentStatus = ({ appointmentId, status }) =>
  axiosInstance.request({
    url: `/appointments/${appointmentId}/status`,
    method: "PATCH",
    data: { status },
  });
