import { axiosInstance } from "../axios";

export const getMyBookings = () =>
  axiosInstance.request({
    url: "/bookings/me",
    method: "GET",
  });
