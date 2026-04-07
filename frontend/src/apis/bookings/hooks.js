import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "./apis";

export const useMyBookings = () =>
  useQuery({
    queryFn: getMyBookings,
    queryKey: ["my-bookings"],
  });
