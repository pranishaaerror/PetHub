import { useMutation, useQuery } from "@tanstack/react-query";
import { adminDeleteUser, adminUpdateUser, getAllUsers, getCurrentUser, updateCurrentUser } from "./apis";

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

export const useAdminUpdateUser = () =>
  useMutation({
    mutationFn: adminUpdateUser,
    mutationKey: ["admin-update-user"],
  });

export const useAdminDeleteUser = () =>
  useMutation({
    mutationFn: adminDeleteUser,
    mutationKey: ["admin-delete-user"],
  });
