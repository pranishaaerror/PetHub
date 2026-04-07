import { axiosInstance } from "../axios";

export const createServices = ({
    serviceName,
    description,
    price,
    durationMinutes = 45,
    category = "vet",
    isActive = true,
}) => axiosInstance.request({
    
    url:"/services",
    method:"POST",
    data:{
        serviceName,
        description,
        price,
        durationMinutes,
        category,
        isActive,
    }
    
})
export const listServices = ()=> axiosInstance.request({
    url:"/services",
    method:"GET",
  
})
