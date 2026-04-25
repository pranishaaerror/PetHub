import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./apis";

export const useNotifications = (options = {}) =>
  useQuery({
    queryFn: getNotifications,
    queryKey: ["notifications"],
    ...options,
  });

export const useMarkNotificationRead = () =>
  useMutation({
    mutationFn: markNotificationRead,
    mutationKey: ["mark-notification-read"],
  });

export const useMarkAllNotificationsRead = () =>
  useMutation({
    mutationFn: markAllNotificationsRead,
    mutationKey: ["mark-all-notifications-read"],
  });

export const useDeleteNotification = () =>
  useMutation({
    mutationFn: deleteNotification,
    mutationKey: ["delete-notification"],
  });
