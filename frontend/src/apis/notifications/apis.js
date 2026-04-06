import { axiosInstance } from "../axios";

export const getNotifications = () =>
  axiosInstance.request({
    url: "/notifications",
    method: "GET",
  });

export const markNotificationRead = (id) =>
  axiosInstance.request({
    url: `/notifications/${id}/read`,
    method: "PATCH",
  });
