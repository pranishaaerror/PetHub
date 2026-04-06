import { useMutation, useQuery } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "./apis";

export const useNotifications = () =>
  useQuery({
    queryFn: getNotifications,
    queryKey: ["notifications"],
  });

export const useMarkNotificationRead = () =>
  useMutation({
    mutationFn: markNotificationRead,
    mutationKey: ["mark-notification-read"],
  });
