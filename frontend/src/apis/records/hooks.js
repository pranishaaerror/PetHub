import { useMutation, useQuery } from "@tanstack/react-query";
import { createRecord, deleteRecord, getRecordsByPet, updateRecord } from "./apis";

export const useRecordsByPet = (petId) =>
  useQuery({
    queryFn: () => getRecordsByPet(petId),
    queryKey: ["records", petId],
    enabled: Boolean(petId),
  });

export const useCreateRecord = () =>
  useMutation({
    mutationFn: createRecord,
    mutationKey: ["create-record"],
  });

export const useUpdateRecord = () =>
  useMutation({
    mutationFn: updateRecord,
    mutationKey: ["update-record"],
  });

export const useDeleteRecord = () =>
  useMutation({
    mutationFn: deleteRecord,
    mutationKey: ["delete-record"],
  });
