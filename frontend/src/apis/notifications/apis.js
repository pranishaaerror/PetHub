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

export const markAllNotificationsRead = () =>
  axiosInstance.request({
    url: "/notifications/read-all",
    method: "PATCH",
  });

export const deleteNotification = (notificationId) =>
  axiosInstance.request({
    url: `/notifications/${notificationId}`,
    method: "DELETE",
  });
