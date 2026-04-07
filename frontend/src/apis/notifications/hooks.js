import { useMutation, useQuery } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "./apis";

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
