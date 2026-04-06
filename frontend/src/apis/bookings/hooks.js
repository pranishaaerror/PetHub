import { useMutation, useQuery } from "@tanstack/react-query";
import { cancelBooking, createBooking, getMyBookings, rescheduleBooking } from "./apis";

export const useMyBookings = () =>
  useQuery({
    queryFn: getMyBookings,
    queryKey: ["my-bookings"],
  });

export const useCreateBooking = () =>
  useMutation({
    mutationFn: createBooking,
    mutationKey: ["create-booking"],
  });

export const useRescheduleBooking = () =>
  useMutation({
    mutationFn: rescheduleBooking,
    mutationKey: ["reschedule-booking"],
  });

export const useCancelBooking = () =>
  useMutation({
    mutationFn: cancelBooking,
    mutationKey: ["cancel-booking"],
  });
