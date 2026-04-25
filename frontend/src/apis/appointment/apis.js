import { axiosInstance } from "../axios";

export const getAppointments = () =>
  axiosInstance.request({
    url: "/appointments",
    method: "GET",
  });

export const createAppointment = (data) =>
  axiosInstance.request({
    url: "/appointments",
    method: "POST",
    data,
  });

export const updateAppointmentStatus = ({ appointmentId, status }) =>
  axiosInstance.request({
    url: `/appointments/${appointmentId}/status`,
    method: "PATCH",
    data: { status },
  });

export const updateMyAppointment = ({ appointmentId, status, appointmentTime }) =>
  axiosInstance.request({
    url: `/appointments/${appointmentId}`,
    method: "PATCH",
    data: { status, appointmentTime },
  });

export const deleteAppointment = (appointmentId) =>
  axiosInstance.request({
    url: `/appointments/${appointmentId}`,
    method: "DELETE",
  });
