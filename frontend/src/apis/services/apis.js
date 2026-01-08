import { axiosInstance } from "../axios";

export const createServices = ({serviceName,price}) => axiosInstance.request({
    
    url:"/services",
    method:"POST",
    data:{
        serviceName,
        price
    }
    
})
export const listServices = ()=> axiosInstance.request({
    url:"/services",
    method:"GET",
  
})