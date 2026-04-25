import { useMutation, useQuery } from "@tanstack/react-query";
import { createServices, deleteService, listServices, updateService } from "./apis";

export const useServices = () =>
  useQuery({ queryFn: listServices, queryKey: ["get-services"] });

export const useCreateServices = () =>
  useMutation({ mutationFn: createServices, mutationKey: ["create-service"] });

export const useUpdateService = () =>
  useMutation({ mutationFn: updateService, mutationKey: ["update-service"] });

export const useDeleteService = () =>
  useMutation({ mutationFn: deleteService, mutationKey: ["delete-service"] });
