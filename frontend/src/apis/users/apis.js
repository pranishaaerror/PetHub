import { axiosInstance } from "../axios";

export const getAllUsers = () => axiosInstance.request({
    url:"/users",
    method:"GET",
})