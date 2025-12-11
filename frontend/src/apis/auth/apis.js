import { axiosInstance } from "../axios";

export const signup = ({name,email,password}) => axiosInstance.request({
    url: "/auth/signup",
    method:"POST",
    data:{
        name,
        email,
        password

    }
})
export const login = ({email,password}) => axiosInstance.request({
    url:"/auth/login",
    method:"POST",
    data:{
        email,
        password
    }
})