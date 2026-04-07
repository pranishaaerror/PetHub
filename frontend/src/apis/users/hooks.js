import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllUsers, getCurrentUser, updateCurrentUser } from "./apis";

export const useCurrentUser = (options = {}) =>
  useQuery({
    queryFn: getCurrentUser,
    queryKey: ["current-user"],
    ...options,
  });

export const useUpdateCurrentUser = () =>
  useMutation({
    mutationFn: updateCurrentUser,
    mutationKey: ["update-current-user"],
  });

export const useUsers = () =>
  useQuery({
    queryFn: getAllUsers,
    queryKey: ["get-users"],
  });
