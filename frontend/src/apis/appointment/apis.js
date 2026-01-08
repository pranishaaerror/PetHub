import { axiosInstance } from "../axios";

export const createAppointment = ({appointmentTime,userId,serviceId}) => axiosInstance.request({
    
    url:"/appointments",
    method:"POST",
    data:{
        appointmentTime,
        userId,
        serviceId
    }
    
})
export const listAppointment = ()=> axiosInstance.request({
    url:"/appointments",
    method:"GET",
  
})