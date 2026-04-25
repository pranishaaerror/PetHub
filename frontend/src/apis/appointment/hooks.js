import { useMutation, useQuery } from "@tanstack/react-query";
import { assignVetToAppointment, createAppointment, deleteAppointment, getAppointments, updateAppointmentStatus, updateMyAppointment } from "./apis";

export const useAppointment = () =>
  useQuery({
    queryFn: getAppointments,
    queryKey: ["get-appointment"],
  });

export const useCreateAppointment = () =>
  useMutation({
    mutationFn: createAppointment,
    mutationKey: ["create-appointment"],
  });

export const useUpdateAppointmentStatus = () =>
  useMutation({
    mutationFn: updateAppointmentStatus,
    mutationKey: ["update-appointment-status"],
  });

export const useUpdateMyAppointment = () =>
  useMutation({
    mutationFn: updateMyAppointment,
    mutationKey: ["update-my-appointment"],
  });

export const useDeleteAppointment = () =>
  useMutation({
    mutationFn: deleteAppointment,
    mutationKey: ["delete-appointment"],
  });

export const useAssignVetToAppointment = () =>
  useMutation({
    mutationFn: assignVetToAppointment,
    mutationKey: ["assign-vet-appointment"],
  });
