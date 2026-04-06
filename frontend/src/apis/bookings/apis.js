import { axiosInstance } from "../axios";

export const createBooking = (data) =>
  axiosInstance.request({
    url: "/bookings",
    method: "POST",
    data,
  });

export const getMyBookings = () =>
  axiosInstance.request({
    url: "/bookings/me",
    method: "GET",
  });

export const rescheduleBooking = ({ id, bookingDate, bookingTime }) =>
  axiosInstance.request({
    url: `/bookings/${id}/reschedule`,
    method: "PATCH",
    data: {
      bookingDate,
      bookingTime,
    },
  });

export const cancelBooking = (id) =>
  axiosInstance.request({
    url: `/bookings/${id}/cancel`,
    method: "PATCH",
  });
