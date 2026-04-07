import { axiosInstance } from "../axios";

export const getNotifications = () =>
  axiosInstance.request({
    url: "/notifications",
    method: "GET",
  });

export const markNotificationRead = (notificationId) =>
  axiosInstance.request({
    url: `/notifications/${notificationId}/read`,
    method: "PATCH",
  });
